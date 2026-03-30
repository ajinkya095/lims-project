from __future__ import annotations

import argparse
import json
import logging
import os
import sys
import uuid
from contextlib import contextmanager
from dataclasses import asdict, dataclass, field
from datetime import datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Sequence

try:
    from pyrfc import CommunicationError, Connection, LogonError, ABAPApplicationError, ABAPRuntimeError
except ImportError:  # pragma: no cover - depends on environment
    Connection = None  # type: ignore[assignment]
    CommunicationError = Exception  # type: ignore[assignment]
    LogonError = Exception  # type: ignore[assignment]
    ABAPApplicationError = Exception  # type: ignore[assignment]
    ABAPRuntimeError = Exception  # type: ignore[assignment]


DELIMITER = "^"
LOGGER = logging.getLogger("sap_connect")
LEGACY_FALLBACK_CONNECTION = {
    "SAP_USER": "REACT_JS",
    "SAP_PASSWD": "Abcd@1234567890",
    "SAP_ASHOST": "10.10.10.39",
    "SAP_SYSNR": "00",
    "SAP_CLIENT": "100",
    "SAP_LANG": "EN",
}


class SapIntegrationError(Exception):
    def __init__(
        self,
        message: str,
        *,
        code: str = "SAP_INTEGRATION_ERROR",
        sap_messages: Optional[Sequence["SapMessage"]] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.sap_messages = list(sap_messages or [])
        self.details = details or {}


@dataclass
class SapConnectionConfig:
    user: str
    passwd: str
    ashost: str
    sysnr: str
    client: str
    lang: str = "EN"
    trace: str = "0"
    sysid: Optional[str] = None
    mshost: Optional[str] = None
    group: Optional[str] = None
    snc_mode: Optional[str] = None
    snc_qop: Optional[str] = None
    snc_partnername: Optional[str] = None
    snc_myname: Optional[str] = None
    dest: Optional[str] = None

    def to_pyrfc_params(self) -> Dict[str, str]:
        params = {
            "user": self.user,
            "passwd": self.passwd,
            "ashost": self.ashost,
            "sysnr": self.sysnr,
            "client": self.client,
            "lang": self.lang,
            "trace": self.trace,
        }
        optional_values = {
            "sysid": self.sysid,
            "mshost": self.mshost,
            "group": self.group,
            "snc_mode": self.snc_mode,
            "snc_qop": self.snc_qop,
            "snc_partnername": self.snc_partnername,
            "snc_myname": self.snc_myname,
            "dest": self.dest,
        }
        params.update({key: value for key, value in optional_values.items() if value})
        return params


@dataclass
class InspectionCharacteristicResult:
    inspchar: str
    evaluation: str
    mean_value: str
    original_input: str
    parameter_name: Optional[str] = None
    closed: Optional[str] = None
    evaluated: Optional[str] = None
    code_group: Optional[str] = None
    code: Optional[str] = None
    text: Optional[str] = None


@dataclass
class UsageDecisionData:
    selected_set: str
    plant: str
    code_group: str
    code: str
    force_completion: str = "X"


@dataclass
class LimsInspectionPayload:
    inspection_lot: str
    inspection_operation: str
    characteristics: List[InspectionCharacteristicResult]
    usage_decision: UsageDecisionData
    correlation_id: Optional[str] = None
    inspection_point: Dict[str, Any] = field(default_factory=dict)
    source_system: Optional[str] = None


@dataclass
class SapMessage:
    type: str
    id: str
    number: str
    message: str
    parameter: Optional[str] = None
    row: Optional[str] = None
    field: Optional[str] = None
    log_no: Optional[str] = None
    log_msg_no: Optional[str] = None

    @property
    def is_error(self) -> bool:
        return (self.type or "").upper() in {"A", "E", "X"}

    def readable_text(self) -> str:
        parts = [part for part in [self.type, self.id, self.number] if part]
        prefix = "/".join(parts)
        return f"{prefix}: {self.message}".strip(": ")


@dataclass
class SapStepResult:
    step: str
    success: bool
    messages: List[SapMessage] = field(default_factory=list)
    sap_payload: Dict[str, Any] = field(default_factory=dict)


@dataclass
class SapIntegrationResponse:
    success: bool
    correlation_id: str
    inspection_lot: str
    inspection_operation: str
    results_posted: bool
    usage_decision_posted: bool
    message: str
    steps: List[SapStepResult]
    sap_messages: List[SapMessage]
    error_code: Optional[str] = None
    error_details: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data["sap_messages_readable"] = [message.readable_text() for message in self.sap_messages]
        for step in data["steps"]:
            step["messages_readable"] = [
                f"{message['type']}/{message['id']}/{message['number']}: {message['message']}".strip(": ")
                for message in step["messages"]
            ]
        return data


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": datetime.utcnow().isoformat(timespec="milliseconds") + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if hasattr(record, "correlation_id"):
            payload["correlation_id"] = getattr(record, "correlation_id")
        if hasattr(record, "event"):
            payload["event"] = getattr(record, "event")
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, ensure_ascii=True)


def configure_logging() -> None:
    if LOGGER.handlers:
        return

    level_name = os.getenv("SAP_PYTHON_LOG_LEVEL", "INFO").upper()
    level = getattr(logging, level_name, logging.INFO)
    log_dir = Path(os.getenv("SAP_PYTHON_LOG_DIR", str(Path(__file__).resolve().parent)))
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / os.getenv("SAP_PYTHON_LOG_FILE", "sap_lims_integration.log")

    formatter = JsonFormatter()
    file_handler = logging.FileHandler(log_file, encoding="utf-8")
    file_handler.setFormatter(formatter)
    file_handler.setLevel(level)

    LOGGER.setLevel(level)
    LOGGER.addHandler(file_handler)
    if get_env_value("SAP_PYTHON_LOG_STDERR", "false").lower() == "true":
        stream_handler = logging.StreamHandler(sys.stderr)
        stream_handler.setFormatter(formatter)
        stream_handler.setLevel(level)
        LOGGER.addHandler(stream_handler)
    LOGGER.propagate = False


def get_env_value(name: str, default: str = "") -> str:
    value = os.getenv(name)
    if value is None:
        return default
    normalized = str(value).strip()
    return normalized if normalized else default


def get_env_list(name: str, default_csv: str) -> List[str]:
    raw = get_env_value(name, default_csv)
    return [part.strip() for part in raw.split(",") if part.strip()]


def normalize_sap_date(value: Any) -> str:
    raw = str(value or "").strip()
    if not raw:
        return ""

    for fmt in ("%Y%m%d", "%Y-%m-%d", "%d.%m.%Y", "%d-%m-%Y", "%d/%m/%Y"):
        try:
            return datetime.strptime(raw, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue

    digits = "".join(ch for ch in raw if ch.isdigit())
    if len(digits) == 8:
        for fmt in ("%Y%m%d", "%d%m%Y"):
            try:
                return datetime.strptime(digits, fmt).strftime("%Y-%m-%d")
            except ValueError:
                continue

    return raw


def to_sap_filter_date(value: Any) -> str:
    normalized = normalize_sap_date(value)
    return normalized.replace("-", "") if normalized else ""


def escape_sap_value(value: Any) -> str:
    return str(value or "").replace("'", "''")


def build_equals_option(field_name: str, value: Any) -> str:
    return f"{field_name} = '{escape_sap_value(value)}'"


def build_between_option(field_name: str, low_value: Any, high_value: Any) -> str:
    return (
        f"{field_name} >= '{escape_sap_value(low_value)}' AND "
        f"{field_name} <= '{escape_sap_value(high_value)}'"
    )


def unique_preserve_order(items: Iterable[Any]) -> List[str]:
    seen = set()
    result: List[str] = []
    for item in items:
        normalized = str(item or "").strip()
        if not normalized:
            continue
        lowered = normalized.lower()
        if lowered in seen:
            continue
        seen.add(lowered)
        result.append(normalized)
    return result


def unique_sorted_values(values: Iterable[Any]) -> List[str]:
    return sorted(unique_preserve_order(values))


def unique_sorted_dates(values: Iterable[Any]) -> List[str]:
    normalized = [normalize_sap_date(value) for value in values]
    return sorted({value for value in normalized if value}, reverse=True)


def make_options(option_texts: Sequence[str]) -> List[Dict[str, str]]:
    return [{"TEXT": text} for text in option_texts if str(text or "").strip()]


def read_table_rows(
    conn: Connection,
    table_name: str,
    field_names: Sequence[str],
    *,
    options: Optional[Sequence[str]] = None,
    batch_size: int = 500,
    max_rows: Optional[int] = None,
) -> List[Dict[str, str]]:
    requested_fields = [field for field in field_names if str(field or "").strip()]
    if not requested_fields:
        return []

    rows: List[Dict[str, str]] = []
    row_skips = 0

    while True:
        current_batch_size = batch_size
        if max_rows is not None:
            remaining = max_rows - len(rows)
            if remaining <= 0:
                break
            current_batch_size = min(current_batch_size, remaining)

        result = conn.call(
            "RFC_READ_TABLE",
            QUERY_TABLE=table_name,
            DELIMITER=DELIMITER,
            FIELDS=[{"FIELDNAME": field} for field in requested_fields],
            OPTIONS=make_options(options or []),
            ROWCOUNT=current_batch_size,
            ROWSKIPS=row_skips,
        )

        data_rows = result.get("DATA", [])
        for item in data_rows:
            parts = item.get("WA", "").split(DELIMITER)
            padded_parts = parts + [""] * max(0, len(requested_fields) - len(parts))
            rows.append(
                {
                    requested_fields[index]: padded_parts[index].strip()
                    for index in range(len(requested_fields))
                }
            )

        if len(data_rows) < current_batch_size:
            break
        row_skips += current_batch_size

    return rows


def read_table(conn: Connection, table_name: str, field_name: str, batch_size: int = 500) -> List[str]:
    rows = read_table_rows(conn, table_name, [field_name], batch_size=batch_size)
    return [row.get(field_name, "") for row in rows if row.get(field_name, "")]


def read_table_safe(conn: Connection, table_name: str, field_name: str) -> tuple[List[str], Optional[str]]:
    try:
        return read_table(conn, table_name, field_name), None
    except Exception as ex:  # pragma: no cover - runtime integration
        return [], str(ex)


def read_first_filtered_row(
    conn: Connection,
    table_name: str,
    field_names: Sequence[str],
    *,
    options: Optional[Sequence[str]] = None,
) -> Optional[Dict[str, str]]:
    rows = read_table_rows(conn, table_name, field_names, options=options, max_rows=1)
    return rows[0] if rows else None


def read_row_by_filters(
    conn: Connection,
    table_name: str,
    field_names: Sequence[str],
    filters: Dict[str, Any],
) -> Optional[Dict[str, str]]:
    options = [
        build_equals_option(field_name, value)
        for field_name, value in filters.items()
        if str(field_name or "").strip() and str(value or "").strip()
    ]
    return read_first_filtered_row(conn, table_name, field_names, options=options)


def read_single_field_by_filters(
    conn: Connection,
    table_name: str,
    field_name: str,
    filters: Dict[str, Any],
) -> str:
    row = read_row_by_filters(conn, table_name, [field_name], filters)
    return str((row or {}).get(field_name, "")).strip()


def read_matching_row_by_date_and_truck(
    conn: Connection,
    table_name: str,
    date_field: str,
    truck_field: str,
    field_names: Sequence[str],
    selected_date: str,
    truck_no: str,
) -> Optional[Dict[str, str]]:
    requested_fields = unique_preserve_order([date_field, truck_field, *field_names])
    options: List[str] = []
    sap_date = to_sap_filter_date(selected_date)
    if date_field and sap_date:
        options.append(build_equals_option(date_field, sap_date))

    rows = read_table_rows(conn, table_name, requested_fields, options=options)
    normalized_truck = str(truck_no or "").strip().lower()
    for row in rows:
        if str(row.get(truck_field, "")).strip().lower() == normalized_truck:
            return row
    return None


def read_matching_row_by_date_range_and_truck(
    conn: Connection,
    table_name: str,
    date_field: str,
    truck_field: str,
    field_names: Sequence[str],
    from_date: str,
    to_date: str,
    truck_no: str,
) -> Optional[Dict[str, str]]:
    requested_fields = unique_preserve_order([date_field, truck_field, *field_names])
    options: List[str] = []
    sap_from_date = to_sap_filter_date(from_date)
    sap_to_date = to_sap_filter_date(to_date)
    if date_field and sap_from_date and sap_to_date:
        options.append(build_between_option(date_field, sap_from_date, sap_to_date))

    rows = read_table_rows(conn, table_name, requested_fields, options=options)
    normalized_truck = str(truck_no or "").strip().lower()
    for row in rows:
        if str(row.get(truck_field, "")).strip().lower() == normalized_truck:
            return row
    return None


def read_first_matching_field_by_date_and_truck(
    conn: Connection,
    table_name: str,
    date_field: str,
    truck_field: str,
    candidate_fields: Sequence[str],
    selected_date: str,
    truck_no: str,
) -> tuple[str, str, List[str]]:
    errors: List[str] = []

    for field_name in unique_preserve_order(candidate_fields):
        try:
            row = read_matching_row_by_date_and_truck(
                conn,
                table_name,
                date_field,
                truck_field,
                [field_name],
                selected_date,
                truck_no,
            )
            if row:
                value = str(row.get(field_name, "")).strip()
                if value:
                    return value, field_name, errors
        except Exception as ex:  # pragma: no cover - runtime integration
            errors.append(f"{table_name}.{field_name}: {ex}")

    return "", "", errors


def read_first_matching_field_by_date_range_and_truck(
    conn: Connection,
    table_name: str,
    date_field: str,
    truck_field: str,
    candidate_fields: Sequence[str],
    from_date: str,
    to_date: str,
    truck_no: str,
) -> tuple[str, str, List[str]]:
    errors: List[str] = []

    for field_name in unique_preserve_order(candidate_fields):
        try:
            row = read_matching_row_by_date_range_and_truck(
                conn,
                table_name,
                date_field,
                truck_field,
                [field_name],
                from_date,
                to_date,
                truck_no,
            )
            if row:
                value = str(row.get(field_name, "")).strip()
                if value:
                    return value, field_name, errors
        except Exception as ex:  # pragma: no cover - runtime integration
            errors.append(f"{table_name}.{field_name}: {ex}")

    return "", "", errors


def parse_decimal_string(value: Any, field_name: str) -> str:
    raw = str(value or "").strip()
    if not raw:
        raise SapIntegrationError(
            f"{field_name} is required.",
            code="VALIDATION_ERROR",
            details={"field": field_name},
        )

    normalized = raw.replace(",", "")
    try:
        decimal_value = Decimal(normalized)
    except InvalidOperation as ex:
        raise SapIntegrationError(
            f"{field_name} must be numeric.",
            code="VALIDATION_ERROR",
            details={"field": field_name, "value": raw},
        ) from ex

    if decimal_value == decimal_value.to_integral():
        return str(decimal_value.quantize(Decimal("1")))
    return format(decimal_value.normalize(), "f")


def build_connection_config() -> SapConnectionConfig:
    required_env = {
        "SAP_USER": get_env_value("SAP_USER", LEGACY_FALLBACK_CONNECTION["SAP_USER"]),
        "SAP_PASSWD": get_env_value("SAP_PASSWD", LEGACY_FALLBACK_CONNECTION["SAP_PASSWD"]),
        "SAP_ASHOST": get_env_value("SAP_ASHOST", LEGACY_FALLBACK_CONNECTION["SAP_ASHOST"]),
        "SAP_SYSNR": get_env_value("SAP_SYSNR", LEGACY_FALLBACK_CONNECTION["SAP_SYSNR"]),
        "SAP_CLIENT": get_env_value("SAP_CLIENT", LEGACY_FALLBACK_CONNECTION["SAP_CLIENT"]),
    }
    missing = [key for key, value in required_env.items() if not value]
    if missing:
        raise SapIntegrationError(
            "Missing SAP connection configuration.",
            code="CONFIG_ERROR",
            details={"missing_environment_variables": missing},
        )

    return SapConnectionConfig(
        user=required_env["SAP_USER"],
        passwd=required_env["SAP_PASSWD"],
        ashost=required_env["SAP_ASHOST"],
        sysnr=required_env["SAP_SYSNR"],
        client=required_env["SAP_CLIENT"],
        lang=get_env_value("SAP_LANG", LEGACY_FALLBACK_CONNECTION["SAP_LANG"]),
        trace=get_env_value("SAP_TRACE", "0"),
        sysid=get_env_value("SAP_SYSID") or None,
        mshost=get_env_value("SAP_MSHOST") or None,
        group=get_env_value("SAP_GROUP") or None,
        snc_mode=get_env_value("SAP_SNC_MODE") or None,
        snc_qop=get_env_value("SAP_SNC_QOP") or None,
        snc_partnername=get_env_value("SAP_SNC_PARTNERNAME") or None,
        snc_myname=get_env_value("SAP_SNC_MYNAME") or None,
        dest=get_env_value("SAP_DEST") or None,
    )


@contextmanager
def sap_connection(config: SapConnectionConfig) -> Iterable[Connection]:
    if Connection is None:
        raise SapIntegrationError(
            "pyrfc is not installed in the Python environment.",
            code="DEPENDENCY_ERROR",
        )

    conn: Optional[Connection] = None
    try:
        conn = Connection(**config.to_pyrfc_params())
        yield conn
    except (CommunicationError, LogonError) as ex:
        raise SapIntegrationError(
            "Unable to connect to SAP.",
            code="SAP_CONNECTION_ERROR",
            details={"exception_type": type(ex).__name__, "reason": str(ex)},
        ) from ex
    finally:
        if conn is not None:
            try:
                conn.close()
            except Exception:
                pass


def extract_message_from_row(row: Dict[str, Any]) -> Optional[SapMessage]:
    upper = {str(key).upper(): value for key, value in row.items()}
    if "TYPE" not in upper and "MESSAGE" not in upper:
        return None

    return SapMessage(
        type=str(upper.get("TYPE", "")).strip(),
        id=str(upper.get("ID", "")).strip(),
        number=str(upper.get("NUMBER", "")).strip(),
        message=str(upper.get("MESSAGE", "")).strip(),
        parameter=str(upper.get("PARAMETER", "")).strip() or None,
        row=str(upper.get("ROW", "")).strip() or None,
        field=str(upper.get("FIELD", "")).strip() or None,
        log_no=str(upper.get("LOG_NO", "")).strip() or None,
        log_msg_no=str(upper.get("LOG_MSG_NO", "")).strip() or None,
    )


def deduplicate_messages(messages: Sequence[SapMessage]) -> List[SapMessage]:
    seen = set()
    result: List[SapMessage] = []
    for message in messages:
        key = (
            message.type,
            message.id,
            message.number,
            message.message,
            message.parameter,
            message.row,
            message.field,
        )
        if key in seen:
            continue
        seen.add(key)
        result.append(message)
    return result


def parse_sap_messages(payload: Any) -> List[SapMessage]:
    messages: List[SapMessage] = []

    def walk(value: Any) -> None:
        if isinstance(value, dict):
            maybe_message = extract_message_from_row(value)
            if maybe_message:
                messages.append(maybe_message)
            for child in value.values():
                walk(child)
        elif isinstance(value, list):
            for item in value:
                walk(item)

    walk(payload)
    return deduplicate_messages(messages)


def has_error_messages(messages: Sequence[SapMessage]) -> bool:
    return any(message.is_error for message in messages)


def has_lock_messages(messages: Sequence[SapMessage]) -> bool:
    for message in messages:
        text = f"{message.id} {message.number} {message.message}".lower()
        if "blocked by user" in text or "locked by user" in text:
            return True
        if (message.id or "").upper() == "QI" and (message.number or "").strip() == "104":
            return True
    return False


def validate_payload(payload: LimsInspectionPayload) -> None:
    missing_fields = []
    if not payload.inspection_lot.strip():
        missing_fields.append("inspection_lot")
    if not payload.inspection_operation.strip():
        missing_fields.append("inspection_operation")
    if not payload.characteristics:
        missing_fields.append("characteristics")

    usage_decision = payload.usage_decision
    if not usage_decision.selected_set.strip():
        missing_fields.append("usage_decision.selected_set")
    if not usage_decision.plant.strip():
        missing_fields.append("usage_decision.plant")
    if not usage_decision.code_group.strip():
        missing_fields.append("usage_decision.code_group")
    if not usage_decision.code.strip():
        missing_fields.append("usage_decision.code")

    if missing_fields:
        raise SapIntegrationError(
            "Payload validation failed.",
            code="VALIDATION_ERROR",
            details={"missing_fields": missing_fields},
        )

    for index, characteristic in enumerate(payload.characteristics):
        prefix = f"characteristics[{index}]"
        if not characteristic.inspchar.strip():
            raise SapIntegrationError(
                f"{prefix}.inspchar is required.",
                code="VALIDATION_ERROR",
                details={"field": f"{prefix}.inspchar"},
            )
        if not characteristic.evaluation.strip():
            raise SapIntegrationError(
                f"{prefix}.evaluation is required.",
                code="VALIDATION_ERROR",
                details={"field": f"{prefix}.evaluation"},
            )
        parse_decimal_string(characteristic.mean_value, f"{prefix}.mean_value")
        parse_decimal_string(characteristic.original_input, f"{prefix}.original_input")


def parse_payload(data: Dict[str, Any]) -> LimsInspectionPayload:
    characteristics_raw = data.get("characteristics") or []
    usage_decision_raw = data.get("usage_decision") or {}

    payload = LimsInspectionPayload(
        inspection_lot=str(data.get("inspection_lot", "")).strip(),
        inspection_operation=str(data.get("inspection_operation", "")).strip(),
        characteristics=[
            InspectionCharacteristicResult(
                inspchar=str(item.get("inspchar", "")).strip(),
                evaluation=str(item.get("evaluation", "")).strip(),
                mean_value=str(item.get("mean_value", "")).strip(),
                original_input=str(item.get("original_input", "")).strip(),
                parameter_name=str(item.get("parameter_name", "")).strip() or None,
                closed=str(item.get("closed", "")).strip() or None,
                evaluated=str(item.get("evaluated", "")).strip() or None,
                code_group=str(item.get("code_group", "")).strip() or None,
                code=str(item.get("code", "")).strip() or None,
                text=str(item.get("text", "")).strip() or None,
            )
            for item in characteristics_raw
        ],
        usage_decision=UsageDecisionData(
            selected_set=str(usage_decision_raw.get("selected_set", "")).strip(),
            plant=str(usage_decision_raw.get("plant", "")).strip(),
            code_group=str(usage_decision_raw.get("code_group", "")).strip(),
            code=str(usage_decision_raw.get("code", "")).strip(),
            force_completion=str(usage_decision_raw.get("force_completion", "X")).strip() or "X",
        ),
        correlation_id=str(data.get("correlation_id", "")).strip() or None,
        inspection_point=dict(data.get("inspection_point") or {}),
        source_system=str(data.get("source_system", "")).strip() or None,
    )
    validate_payload(payload)
    return payload


def load_json_payload(args: argparse.Namespace) -> Dict[str, Any]:
    if args.payload_json:
        return json.loads(args.payload_json)
    if args.payload_file:
        payload_path = Path(args.payload_file)
        return json.loads(payload_path.read_text(encoding="utf-8"))

    raw_stdin = sys.stdin.read().strip()
    if raw_stdin:
        return json.loads(raw_stdin)

    raise SapIntegrationError(
        "No payload supplied. Use --payload-file, --payload-json, or stdin.",
        code="VALIDATION_ERROR",
    )


class SapLimsIntegrationService:
    def __init__(self, connection_config: SapConnectionConfig) -> None:
        self._connection_config = connection_config

    def process_lab_results(self, payload: LimsInspectionPayload) -> SapIntegrationResponse:
        correlation_id = payload.correlation_id or str(uuid.uuid4())
        extra = {"correlation_id": correlation_id}
        LOGGER.info("Starting SAP LIMS result posting.", extra={**extra, "event": "sap_lims_start"})

        steps: List[SapStepResult] = []

        with sap_connection(self._connection_config) as conn:
            result_recording = self._record_results(conn, payload)
            steps.append(result_recording)
            if not result_recording.success:
                if has_lock_messages(result_recording.messages):
                    rollback_step = self._rollback(conn, "rollback_after_lock")
                    steps.append(rollback_step)

                    retry_recording = self._record_results(conn, payload)
                    steps.append(retry_recording)
                    if retry_recording.success:
                        result_recording = retry_recording
                    else:
                        raise SapIntegrationError(
                            "Inspection characteristic result posting failed.",
                            code="RESULT_POSTING_FAILED",
                            sap_messages=flatten_step_messages(steps),
                        )
                else:
                    rollback_step = self._rollback(conn, "rollback_after_result_failure")
                    steps.append(rollback_step)
                    raise SapIntegrationError(
                        "Inspection characteristic result posting failed.",
                        code="RESULT_POSTING_FAILED",
                        sap_messages=flatten_step_messages(steps),
                    )

            result_commit = self._commit(conn, "commit_results")
            steps.append(result_commit)
            if not result_commit.success:
                raise SapIntegrationError(
                    "Commit after result recording failed.",
                    code="RESULT_COMMIT_FAILED",
                    sap_messages=flatten_step_messages(steps),
                )

            usage_decision = self._set_usage_decision(conn, payload)
            steps.append(usage_decision)
            if not usage_decision.success:
                raise SapIntegrationError(
                    "Usage decision posting failed.",
                    code="USAGE_DECISION_FAILED",
                    sap_messages=flatten_step_messages(steps),
                )

            usage_commit = self._commit(conn, "commit_usage_decision")
            steps.append(usage_commit)
            if not usage_commit.success:
                raise SapIntegrationError(
                    "Commit after usage decision failed.",
                    code="USAGE_DECISION_COMMIT_FAILED",
                    sap_messages=flatten_step_messages(steps),
                )

        all_messages = flatten_step_messages(steps)
        LOGGER.info("SAP LIMS result posting completed successfully.", extra={**extra, "event": "sap_lims_success"})
        return SapIntegrationResponse(
            success=True,
            correlation_id=correlation_id,
            inspection_lot=payload.inspection_lot,
            inspection_operation=payload.inspection_operation,
            results_posted=True,
            usage_decision_posted=True,
            message="Inspection results and usage decision posted successfully.",
            steps=steps,
            sap_messages=all_messages,
        )

    def _record_results(self, conn: Connection, payload: LimsInspectionPayload) -> SapStepResult:
        inspoint_data = {
            "INSPLOT": payload.inspection_lot,
            "INSPOPER": payload.inspection_operation,
        }
        inspoint_data.update(
            {
                key.upper(): value
                for key, value in payload.inspection_point.items()
                if str(key or "").strip() and value is not None
            }
        )

        char_results = []
        for characteristic in payload.characteristics:
            row = {
                "INSPLOT": payload.inspection_lot,
                "INSPOPER": payload.inspection_operation,
                "INSPCHAR": characteristic.inspchar,
                "EVALUATION": characteristic.evaluation,
                "MEAN_VALUE": parse_decimal_string(characteristic.mean_value, "mean_value"),
                "ORIGINAL_INPUT": parse_decimal_string(characteristic.original_input, "original_input"),
            }
            if characteristic.closed:
                row["CLOSED"] = characteristic.closed
            if characteristic.evaluated:
                row["EVALUATED"] = characteristic.evaluated
            if characteristic.code_group:
                row["CODEGROUP"] = characteristic.code_group
            if characteristic.code:
                row["CODE"] = characteristic.code
            if characteristic.text:
                row["CHAR_TEXT"] = characteristic.text
            char_results.append(row)

        # Step 1: post inspection characteristic results for the inspection lot operation.
        response = conn.call(
            "BAPI_INSPOPER_RECORDRESULTS",
            INSPLOT=payload.inspection_lot,
            INSPOPER=payload.inspection_operation,
            INSPPOINTDATA=inspoint_data,
            CHAR_RESULTS=char_results,
        )
        messages = parse_sap_messages(response)
        return SapStepResult(
            step="record_results",
            success=not has_error_messages(messages),
            messages=messages,
            sap_payload={"INSPLOT": payload.inspection_lot, "INSPOPER": payload.inspection_operation},
        )

    def _commit(self, conn: Connection, step_name: str) -> SapStepResult:
        # Step 2 or 4: persist the previous BAPI changes synchronously in SAP.
        response = conn.call("BAPI_TRANSACTION_COMMIT", WAIT="X")
        messages = parse_sap_messages(response)
        return SapStepResult(
            step=step_name,
            success=not has_error_messages(messages),
            messages=messages,
            sap_payload={"WAIT": "X"},
        )

    def _rollback(self, conn: Connection, step_name: str) -> SapStepResult:
        response = conn.call("BAPI_TRANSACTION_ROLLBACK")
        messages = parse_sap_messages(response)
        return SapStepResult(
            step=step_name,
            success=not has_error_messages(messages),
            messages=messages,
            sap_payload={},
        )

    def _set_usage_decision(self, conn: Connection, payload: LimsInspectionPayload) -> SapStepResult:
        ud_data = {
            "INSPLOT": payload.inspection_lot,
            "UD_SELECTED_SET": payload.usage_decision.selected_set,
            "UD_PLANT": payload.usage_decision.plant,
            "UD_CODE_GROUP": payload.usage_decision.code_group,
            "UD_CODE": payload.usage_decision.code,
            "UD_FORCE_COMPLETION": payload.usage_decision.force_completion,
        }
        # Step 3: post the usage decision only after result recording and commit succeed.
        response = conn.call(
            "BAPI_INSPLOT_SETUSAGEDECISION",
            NUMBER=payload.inspection_lot,
            UD_DATA=ud_data,
        )
        messages = parse_sap_messages(response)
        return SapStepResult(
            step="set_usage_decision",
            success=not has_error_messages(messages),
            messages=messages,
            sap_payload={"NUMBER": payload.inspection_lot},
        )


def flatten_step_messages(steps: Sequence[SapStepResult]) -> List[SapMessage]:
    messages: List[SapMessage] = []
    for step in steps:
        messages.extend(step.messages)
    return deduplicate_messages(messages)


def success_exit(payload: Any) -> int:
    print(json.dumps(payload, ensure_ascii=True))
    return 0


def failure_response(
    *,
    correlation_id: str,
    inspection_lot: str = "",
    inspection_operation: str = "",
    message: str,
    error_code: str,
    sap_messages: Optional[Sequence[SapMessage]] = None,
    error_details: Optional[Dict[str, Any]] = None,
    steps: Optional[Sequence[SapStepResult]] = None,
) -> Dict[str, Any]:
    response = SapIntegrationResponse(
        success=False,
        correlation_id=correlation_id,
        inspection_lot=inspection_lot,
        inspection_operation=inspection_operation,
        results_posted=any(step.step == "commit_results" and step.success for step in steps or []),
        usage_decision_posted=any(step.step == "commit_usage_decision" and step.success for step in steps or []),
        message=message,
        steps=list(steps or []),
        sap_messages=list(sap_messages or []),
        error_code=error_code,
        error_details=error_details or {},
    )
    return response.to_dict()


def resolve_business_partner_name(conn: Connection, partner_number: str) -> str:
    partner_number = str(partner_number or "").strip()
    if not partner_number:
        return ""

    lookups = [
        ("LFA1", "LIFNR", "NAME1"),
        ("KNA1", "KUNNR", "NAME1"),
        ("BUT000", "PARTNER", "NAME_ORG1"),
    ]
    for table_name, key_field, name_field in lookups:
        try:
            value = read_single_field_by_filters(
                conn,
                table_name,
                name_field,
                {key_field: partner_number},
            )
            if value:
                return value
        except Exception:
            continue
    return ""


def resolve_material_code(conn: Connection, reference_document: str) -> str:
    reference_document = str(reference_document or "").strip()
    if not reference_document:
        return ""

    lookups = [
        ("EKPO", "EBELN", "MATNR"),
        ("VBAP", "VBELN", "MATNR"),
    ]
    for table_name, key_field, material_field in lookups:
        try:
            value = read_single_field_by_filters(
                conn,
                table_name,
                material_field,
                {key_field: reference_document},
            )
            if value:
                return value
        except Exception:
            continue
    return ""


def resolve_inspection_lot(
    conn: Connection,
    *,
    selected_date: str,
    truck_no: str,
    primary_table: str,
    primary_date_field: str,
    primary_truck_field: str,
    material_code: str,
    po_number: str,
) -> tuple[str, List[str]]:
    errors: List[str] = []
    detail_lot_fields = get_env_list(
        "SAP_DETAIL_INSPECTION_LOT_FIELDS",
        get_env_value("SAP_DETAIL_INSPECTION_LOT_FIELD", "PRUEFLOS,INSPLOT"),
    )

    for lot_field in detail_lot_fields:
        try:
            inspection_row = read_matching_row_by_date_and_truck(
                conn,
                primary_table,
                primary_date_field,
                primary_truck_field,
                [lot_field],
                selected_date,
                truck_no,
            )
            if not inspection_row:
                inspection_fields = [primary_truck_field]
                if primary_date_field:
                    inspection_fields.append(primary_date_field)
                inspection_fields.append(lot_field)
                inspection_row = read_row_by_filters(
                    conn,
                    primary_table,
                    inspection_fields,
                    {primary_truck_field: truck_no},
                )
            if inspection_row:
                lot_value = str(inspection_row.get(lot_field, "")).strip()
                if lot_value:
                    return lot_value, errors
        except Exception as ex:
            errors.append(f"{primary_table}.{lot_field}: {ex}")

    qals_table = get_env_value("SAP_INSPECTION_LOT_TABLE", "QALS")
    qals_lot_field = get_env_value("SAP_INSPECTION_LOT_FIELD", "PRUEFLOS")
    qals_material_fields = get_env_list("SAP_INSPECTION_LOT_MATERIAL_FIELDS", "MATNR")
    qals_po_fields = get_env_list("SAP_INSPECTION_LOT_PO_FIELDS", "EBELN,VBELN")
    qals_date_fields = get_env_list("SAP_INSPECTION_LOT_DATE_FIELDS", "ENSTEHDAT,ERSTELDAT")

    def try_qals_lookup(filter_field: str, filter_value: str) -> str:
        filter_value = str(filter_value or "").strip()
        if not filter_field or not filter_value:
            return ""

        for date_field in qals_date_fields:
            try:
                row = read_row_by_filters(
                    conn,
                    qals_table,
                    [qals_lot_field, filter_field, date_field],
                    {
                        filter_field: filter_value,
                        date_field: to_sap_filter_date(selected_date),
                    },
                )
                if row:
                    lot_value = str(row.get(qals_lot_field, "")).strip()
                    if lot_value:
                        return lot_value
            except Exception as ex:
                errors.append(f"{qals_table}.{filter_field}/{date_field}: {ex}")

        try:
            row = read_row_by_filters(
                conn,
                qals_table,
                [qals_lot_field, filter_field],
                {filter_field: filter_value},
            )
            if row:
                lot_value = str(row.get(qals_lot_field, "")).strip()
                if lot_value:
                    return lot_value
        except Exception as ex:
            errors.append(f"{qals_table}.{filter_field}: {ex}")

        return ""

    for material_field in qals_material_fields:
        lot_value = try_qals_lookup(material_field, material_code)
        if lot_value:
            return lot_value, errors

    for po_field in qals_po_fields:
        lot_value = try_qals_lookup(po_field, po_number)
        if lot_value:
            return lot_value, errors

    return "", errors


def run_post_lims_results(args: argparse.Namespace) -> int:
    raw_payload = load_json_payload(args)
    payload = parse_payload(raw_payload)
    correlation_id = payload.correlation_id or str(uuid.uuid4())
    payload.correlation_id = correlation_id

    try:
        config = build_connection_config()
        service = SapLimsIntegrationService(config)
        response = service.process_lab_results(payload)
        return success_exit(response.to_dict())
    except SapIntegrationError as ex:
        LOGGER.error(
            "SAP LIMS posting failed.",
            extra={"correlation_id": correlation_id, "event": "sap_lims_failure"},
            exc_info=True,
        )
        failure = failure_response(
            correlation_id=correlation_id,
            inspection_lot=payload.inspection_lot,
            inspection_operation=payload.inspection_operation,
            message=str(ex),
            error_code=ex.code,
            sap_messages=ex.sap_messages,
            error_details=ex.details,
        )
        print(json.dumps(failure, ensure_ascii=True))
        return 1
    except (ABAPApplicationError, ABAPRuntimeError) as ex:
        LOGGER.error(
            "SAP ABAP error during posting.",
            extra={"correlation_id": correlation_id, "event": "sap_abap_failure"},
            exc_info=True,
        )
        failure = failure_response(
            correlation_id=correlation_id,
            inspection_lot=payload.inspection_lot,
            inspection_operation=payload.inspection_operation,
            message="SAP returned an ABAP error while processing the request.",
            error_code="SAP_ABAP_ERROR",
            error_details={
                "exception_type": type(ex).__name__,
                "key": getattr(ex, "key", ""),
                "message": str(ex),
            },
        )
        print(json.dumps(failure, ensure_ascii=True))
        return 1
    except Exception as ex:  # pragma: no cover - runtime integration
        LOGGER.error(
            "Unexpected SAP LIMS posting failure.",
            extra={"correlation_id": correlation_id, "event": "sap_unhandled_failure"},
            exc_info=True,
        )
        failure = failure_response(
            correlation_id=correlation_id,
            inspection_lot=payload.inspection_lot,
            inspection_operation=payload.inspection_operation,
            message="Unexpected error occurred while posting to SAP.",
            error_code="UNHANDLED_ERROR",
            error_details={"exception_type": type(ex).__name__, "message": str(ex)},
        )
        print(json.dumps(failure, ensure_ascii=True))
        return 1


def run_material_numbers(conn: Connection) -> int:
    table_name = get_env_value("SAP_MATERIAL_TABLE", "MARA")
    field_name = get_env_value("SAP_MATERIAL_FIELD", "MATNR")
    rows = unique_sorted_values(read_table(conn, table_name, field_name))
    payload = [{"MaterialNumber": row} for row in rows]
    return success_exit(payload)


def run_truck_numbers(conn: Connection) -> int:
    table_name = get_env_value("SAP_TRUCK_TABLE", "ZGATETRXN")
    field_name = get_env_value("SAP_TRUCK_FIELD", "TRUCK_NO")
    rows = unique_sorted_values(read_table(conn, table_name, field_name))
    return success_exit(rows)


def run_raw_material_dates(conn: Connection) -> int:
    date_table = get_env_value("SAP_RAW_LOOKUP_DATE_TABLE", "QALS")
    date_field = get_env_value("SAP_RAW_LOOKUP_DATE_FIELD", "ENSTEHDAT")
    date_values, date_err = read_table_safe(conn, date_table, date_field)
    errors: Dict[str, str] = {}
    if date_err:
        errors["dates"] = date_err
    payload = {"dates": unique_sorted_dates(date_values), "errors": errors}
    return success_exit(payload)


def run_filtered_trucks(conn: Connection, from_date: str, to_date: str) -> int:
    if not from_date or not to_date:
        raise SapIntegrationError("From date and To date are required for truck lookup.", code="VALIDATION_ERROR")

    sap_from_date = to_sap_filter_date(from_date)
    sap_to_date = to_sap_filter_date(to_date)

    if sap_from_date > sap_to_date:
        raise SapIntegrationError("From date cannot be later than To date.", code="VALIDATION_ERROR")

    lookup_sources = [
        (
            get_env_value("SAP_RAW_TRUCK_TABLE", "QALS"),
            get_env_value("SAP_RAW_TRUCK_FIELD", "TRUCK_NO"),
            get_env_value("SAP_RAW_TRUCK_DATE_FIELD", "ENSTEHDAT"),
            "primary",
        ),
        (
            get_env_value("SAP_TRUCK_TABLE", "ZGATETRXN"),
            get_env_value("SAP_TRUCK_FIELD", "TRUCK_NO"),
            get_env_value("SAP_DATE_FIELD", "RDATE"),
            "fallback",
        ),
    ]

    truck_values: List[str] = []
    errors: Dict[str, str] = {}

    for table_name, truck_field, date_field, label in lookup_sources:
        try:
            options = [build_between_option(date_field, sap_from_date, sap_to_date)]
            truck_rows = read_table_rows(conn, table_name, [truck_field], options=options)
            truck_values = [row.get(truck_field, "") for row in truck_rows]
            unique_trucks = unique_sorted_values(truck_values)
            if unique_trucks:
                payload = {"truckNumbers": unique_trucks, "errors": errors}
                return success_exit(payload)
        except Exception as ex:  # pragma: no cover - runtime integration
            errors[f"{label}:{table_name}.{truck_field}"] = str(ex)

    payload = {"truckNumbers": unique_sorted_values(truck_values), "errors": errors}
    return success_exit(payload)


def run_raw_record(conn: Connection, from_date: str, to_date: str, truck_no: str) -> int:
    if not from_date or not to_date or not truck_no:
        raise SapIntegrationError(
            "From date, To date and truck number are required for record lookup.",
            code="VALIDATION_ERROR",
        )

    primary_table = get_env_value("SAP_DETAIL_TABLE", "ZGATETRXN")
    primary_date_field = get_env_value("SAP_DETAIL_DATE_FIELD", get_env_value("SAP_DATE_FIELD", "RDATE"))
    primary_truck_field = get_env_value("SAP_DETAIL_TRUCK_FIELD", get_env_value("SAP_TRUCK_FIELD", "TRUCK_NO"))
    field_map = {
        "transporter": get_env_list("SAP_DETAIL_TRANSPORTER_FIELDS", get_env_value("SAP_DETAIL_TRANSPORTER_FIELD", "TRANSPORTER,TRANSPORTER_NAME")),
        "partyName": get_env_list("SAP_DETAIL_PARTY_FIELDS", get_env_value("SAP_DETAIL_PARTY_FIELD", "BUS_PARTNER,LIFNR,VENDOR")),
        "poNumber": get_env_list("SAP_DETAIL_PO_FIELDS", get_env_value("SAP_DETAIL_PO_FIELD", "EBELN,REF_DOC_NO,XBLNR")),
        "materialCode": get_env_list("SAP_DETAIL_MATERIAL_FIELDS", get_env_value("SAP_DETAIL_MATERIAL_FIELD", "MATNR,MATERIAL,REF_DOC_NO")),
        "gateNumber": get_env_list("SAP_DETAIL_GATE_FIELDS", get_env_value("SAP_DETAIL_GATE_FIELD", "GENTRY,GATE_NO")),
        "quantity": get_env_list("SAP_DETAIL_QUANTITY_FIELDS", get_env_value("SAP_DETAIL_QUANTITY_FIELD", "NT_CHALLAN,MENGE,QTY")),
    }

    record = {
        "found": False,
        "date": normalize_sap_date(to_date),
        "truckNo": str(truck_no or "").strip(),
        "inspectionLot": "",
        "transporter": "",
        "partyName": "",
        "poNumber": "",
        "materialCode": "",
        "gateNumber": "",
        "quantity": "",
        "errors": {},
    }

    try:
        truck_exists = read_matching_row_by_date_range_and_truck(
            conn,
            primary_table,
            primary_date_field,
            primary_truck_field,
            [],
            from_date,
            to_date,
            truck_no,
        )

        if not truck_exists:
            truck_exists = read_row_by_filters(
                conn,
                primary_table,
                [primary_truck_field],
                {primary_truck_field: truck_no},
            )

        if truck_exists:
            record["found"] = True

            for response_key, field_names in field_map.items():
                value, resolved_field, field_errors = read_first_matching_field_by_date_range_and_truck(
                    conn,
                    primary_table,
                    primary_date_field,
                    primary_truck_field,
                    field_names,
                    from_date,
                    to_date,
                    truck_no,
                )
                if not value:
                    for error in field_errors:
                        record["errors"][f"{response_key}:{error.split(':', 1)[0]}"] = error.split(": ", 1)[1] if ": " in error else error
                record[response_key] = value

            partner_number = record["partyName"]
            reference_document = record["poNumber"] or record["materialCode"]
            resolved_party_name = resolve_business_partner_name(conn, partner_number)
            if resolved_party_name:
                record["partyName"] = resolved_party_name
            resolved_material_code = resolve_material_code(conn, reference_document)
            if resolved_material_code:
                record["materialCode"] = resolved_material_code

            inspection_lot, inspection_errors = resolve_inspection_lot(
                conn,
                selected_date=to_date,
                truck_no=truck_no,
                primary_table=primary_table,
                primary_date_field=primary_date_field,
                primary_truck_field=primary_truck_field,
                material_code=record["materialCode"],
                po_number=record["poNumber"],
            )
            if inspection_lot:
                record["inspectionLot"] = inspection_lot
            elif inspection_errors:
                record["errors"]["inspectionLot"] = " | ".join(unique_preserve_order(inspection_errors))
    except Exception as ex:  # pragma: no cover - runtime integration
        record["errors"]["record"] = str(ex)

    return success_exit(record)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--mode",
        choices=[
            "material-numbers",
            "truck-numbers",
            "raw-lookups",
            "raw-trucks",
            "raw-record",
            "post-lims-results",
        ],
        default="material-numbers",
    )
    parser.add_argument("--date", default="")
    parser.add_argument("--from-date", default="")
    parser.add_argument("--to-date", default="")
    parser.add_argument("--truck", default="")
    parser.add_argument("--payload-file", default="")
    parser.add_argument("--payload-json", default="")
    return parser


def main() -> int:
    configure_logging()
    args = build_parser().parse_args()

    if args.mode == "post-lims-results":
        return run_post_lims_results(args)

    try:
        config = build_connection_config()
        with sap_connection(config) as conn:
            if args.mode == "raw-lookups":
                return run_raw_material_dates(conn)
            if args.mode == "raw-trucks":
                return run_filtered_trucks(conn, args.from_date, args.to_date)
            if args.mode == "raw-record":
                return run_raw_record(conn, args.from_date, args.to_date, args.truck)
            if args.mode == "truck-numbers":
                return run_truck_numbers(conn)
            return run_material_numbers(conn)
    except SapIntegrationError as ex:
        LOGGER.error("SAP operation failed.", extra={"event": "sap_general_failure"}, exc_info=True)
        error_payload = {
            "success": False,
            "message": str(ex),
            "errorCode": ex.code,
            "details": ex.details,
            "sapMessages": [asdict(message) for message in ex.sap_messages],
        }
        print(json.dumps(error_payload, ensure_ascii=True))
        return 1
    except Exception as ex:  # pragma: no cover - runtime integration
        LOGGER.error("Unexpected SAP operation failure.", extra={"event": "sap_unhandled_failure"}, exc_info=True)
        print(
            json.dumps(
                {
                    "success": False,
                    "message": "Unexpected SAP integration error.",
                    "errorCode": "UNHANDLED_ERROR",
                    "details": {"exception_type": type(ex).__name__, "message": str(ex)},
                },
                ensure_ascii=True,
            )
        )
        return 1


if __name__ == "__main__":
    sys.exit(main())
