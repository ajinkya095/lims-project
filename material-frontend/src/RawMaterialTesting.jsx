import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFlask,
  FaWarehouse,
  FaSnowflake,
  FaIndustry,
  FaTruck,
  FaBox,
  FaChartBar,
  FaShieldAlt,
  FaUserPlus,
} from "react-icons/fa";
import {
  fetchCoalDraft,
  fetchCoalDrafts,
  saveCoalDraft,
} from "./services/rawCoalDraftService";
import {
  fetchFormDraft,
  fetchFormDrafts,
  saveFormDraft,
} from "./services/formDraftService";

// --- 1. Field Definitions (Outside the component to keep it clean) ---

const coalFields = [
  { label: "From date", key: "fromDate", type: "date" },
  { label: "To date", key: "entryDate", type: "date" },
  { label: "Truck No", key: "truckNo", type: "text" },
  { label: "Material Code", key: "materialCode", type: "text" },
  { label: "Gate Number", key: "gateNumber", type: "text" },
  { label: "PO Number", key: "poNumber", type: "text" },
  { label: "Party", key: "party", type: "text" },
  { label: "Transporter", key: "transporter", type: "text" },
  { label: "QTY", key: "qtymt", type: "number" },  
  { label: "Source", key: "source", type: "text" },
  { label: "Category", key: "category", type: "text" },
  
  { label: " -3 MM", key: "minus3mm", type: "number" },
  { label: " -4 MM", key: "minus4mm", type: "number" },
  { label: " -6 MM", key: "minus6mm", type: "number" },
  { label: " -1 MM", key: "minus1mm", type: "number" },
  { label: " STONES", key: "stones", type: "number" },
  { label: " C.SHALE", key: "cshale", type: "number" },
  { label: " % S", key: "sulphurPct", type: "number" },
  { label: "Inherent Moisture (IM)", key: "im", type: "number" },
  { label: "Total Moisture (TM)", key: "tm", type: "number" },
  { label: "Volatile Matter (VM)", key: "vm", type: "number" },
  { label: "ASH", key: "ash", type: "number" },
  { label: "Fixed Carbon Air Dried Basis (FC ADB)", key: "fcadb", type: "number" },
  { label: "Fixed Carbon Dry Basis (FC DB)", key: "fcdb", type: "number" },
  { label: "Gross Calorific Value As Received Basis (GCV ARB)", key: "gcvarb", type: "number" },
  { label: "Gross Calorific Value Air Dried Basis (GCV ADB)", key: "gcvadb", type: "number" },
  { label: "Remarks", key: "remarks", type: "text" },
];

const pelletsFields = [
  { label: "From date", key: "fromDate", type: "date" },
  { label: "To date", key: "entryDate", type: "date" }, // ✅ MONTHNAME
  { label: "Truck No", key: "truckNo", type: "text" },
  { label: "Material Code", key: "materialCode", type: "text" },
  { label: "Gate Number", key: "gateNumber", type: "text" },
  { label: "PO Number", key: "poNumber", type: "text" },
  { label: "Supplier", key: "supplier", type: "text" },
  { label: "QTY (MT)", key: "qtyMT", type: "number" },

  { label: "+30 MM", key: "p30mm", type: "number" },
  { label: "+25 MM", key: "p25mm", type: "number" },
  { label: "+22 MM", key: "p22mm", type: "number" },
  { label: "+20 MM", key: "p20mm", type: "number" },
  { label: "+18 MM", key: "p18mm", type: "number" },
  { label: "+15 MM", key: "p15mm", type: "number" },
  { label: "+12 MM", key: "p12mm", type: "number" },
  { label: "+10 MM", key: "p10mm", type: "number" },
  { label: "+8 MM", key: "p8mm", type: "number" },
  { label: "+5 MM", key: "p5mm", type: "number" },
  { label: "+3 MM", key: "p3mm", type: "number" },
  { label: "-3 MM", key: "m3mm", type: "number" },

  { label: "Oversize", key: "oversize", type: "number" },
  { label: "Undersize", key: "undersize", type: "number" },
  { label: "MPS", key: "mps", type: "number" },
  { label: "LAT BD", key: "latbd", type: "number" },

  { label: "Unshaped %", key: "unshapePct", type: "number" }, // ✅ UNSHAPEPCT
  { label: "Unfired %", key: "unfiredPct", type: "number" }, // ✅ UNFIREDEPCT

  { label: "Ti %", key: "tiPct", type: "number" },
  { label: "Al %", key: "aiPct", type: "number" },
  { label: "Fe(T) %", key: "feTPct", type: "number" },
  { label: "LOI %", key: "loiPct", type: "number" },
  { label: "SiO2 %", key: "sio2Pct", type: "number" },
  { label: "Al2O3 %", key: "al2o3Pct", type: "number" },
  { label: "P %", key: "pPct", type: "number" },
  { label: "Remarks", key: "remarks", type: "text" },
];

const ironOreFields = [
  { label: "From date", key: "fromDate", type: "date" },
  { label: "To date", key: "entryDate", type: "date" },

  { label: "Truck No", key: "truckNo", type: "text" },
  { label: "Material Code", key: "materialCode", type: "text" },
  { label: "Gate Number", key: "gateNumber", type: "text" },
  { label: "PO Number", key: "poNumber", type: "text" },
  { label: "Supplier / Source", key: "supplierSource", type: "text" },
  { label: "QTY", key: "qty", type: "number" },
  { label: "No of Sample", key: "sampleNo", type: "number" },

  { label: "% Moisture", key: "moisturePct", type: "number" },

  { label: "+30", key: "plus30", type: "number" },
  { label: "+25", key: "plus25", type: "number" },
  { label: "+22", key: "plus22", type: "number" },
  { label: "+20", key: "plus20", type: "number" },
  { label: "+18", key: "plus18", type: "number" },
  { label: "+15", key: "plus15", type: "number" },
  { label: "+12", key: "plus12", type: "number" },
  { label: "+10", key: "plus10", type: "number" },
  { label: "+8", key: "plus8", type: "number" },
  { label: "+5", key: "plus5", type: "number" },
  { label: "+3", key: "plus3", type: "number" },
  { label: "+1", key: "plus1", type: "number" },
  { label: "-1", key: "minus1", type: "number" },

  { label: "Over Size", key: "oversize", type: "number" },
  { label: "Under Size", key: "undersize", type: "number" },
  { label: "MPS", key: "mps", type: "number" },

  { label: "Laterite", key: "laterite", type: "number" },
  { label: "Blue Dust", key: "blueDust", type: "number" },
  { label: "Shale / Stone", key: "shaleStone", type: "number" },

  { label: "Tumbler Index", key: "tumblerIndex", type: "number" },
  { label: "Accretion Index", key: "accretionIndex", type: "number" },
  { label: "% Fe(T)", key: "feTotal", type: "number" },
  { label: "% LOI", key: "loi", type: "number" },
  { label: "% SiO2", key: "sio2", type: "number" },
  { label: "% Al2O3", key: "al2o3", type: "number" },
  { label: "% P", key: "phosphorus", type: "number" },
  { label: "Remarks", key: "remarks", type: "text" },
];

const dolomiteFields = [
  { label: "From date", key: "fromDate", type: "date" },
  { label: "To date", key: "entryDate", type: "date" },

  { label: "Truck No", key: "truckNo", type: "text" },
  { label: "Material Code", key: "materialCode", type: "text" },
  { label: "Gate Number", key: "gateNumber", type: "text" },
  { label: "PO Number", key: "poNumber", type: "text" },
  { label: "QTY", key: "qty", type: "number" },
  { label: "Source", key: "source", type: "text" },
  { label: "Size", key: "size", type: "text" },


  { label: "% Moisture", key: "moisturePct", type: "number" },

  { label: "+8 mm", key: "plus8mm", type: "number" },
  { label: "+6 mm", key: "plus6mm", type: "number" },
  { label: "+2 mm", key: "plus2mm", type: "number" },
  { label: "+1 mm", key: "plus1mm", type: "number" },
  { label: "-1 mm", key: "minus1mm", type: "number" },

  { label: "CaO %", key: "caoPct", type: "number" },
  { label: "MgO %", key: "mgoPct", type: "number" },
  { label: "% Silica", key: "silicaPct", type: "number" },
  { label: "LOI %", key: "loiPct", type: "number" },
  { label: "Remarks", key: "remarks", type: "text" },
];

const coalStockFields = [
  { label: "25mm", key: "MM25" },
  { label: "22mm", key: "MM22" },
  { label: "20mm", key: "MM20" },
  { label: "18mm", key: "MM18" },
  { label: "15mm", key: "MM15" },
  { label: "12mm", key: "MM12" },
  { label: "10mm", key: "MM10" },
  { label: "8mm", key: "MM8" },
  { label: "6mm", key: "MM6" },
  { label: "5mm", key: "MM5" },
  { label: "3mm", key: "MM3" },
  { label: "1mm", key: "MM1" },
  { label: "-1mm", key: "Minus1mm" },
  { label: "TM", key: "TM" },
  { label: "VM", key: "VM" },
  { label: "ASH", key: "ASH" },
  { label: "FC", key: "FC" },
  { label: "MPS", key: "MPS" },
];

const ironFields = ["TM", "FET", "LOI", "Plus18mm", "Minus8mm", "MPS"];
const stockIronOreFields = [
  { label: "TM", key: "TM" },
  { label: "FET", key: "FET" },
  { label: "LOI", key: "LOI" },
  { label: "+18MM", key: "Plus18mm" },
  { label: "-18MM", key: "Minus8mm" },
  { label: "MPS", key: "MPS" },
];

const dolomiteStockFields = [
  { label: "TM", key: "TM" },
  { label: "+6 mm", key: "Plus6mm" },
  { label: "-1 mm", key: "Minus1mm" },
  { label: "MPS", key: "MPS" },
];

const charcoalStockFields = [
  { label: "FC", key: "FC" },
  { label: "-1 mm", key: "Minus1mm" },
];

const stockFieldSectionsByMaterial = {
  Coal: [
    {
      title: "Sizing Analysis",
      fields: coalStockFields.filter((field) =>
        [
          "MM25",
          "MM22",
          "MM20",
          "MM18",
          "MM15",
          "MM12",
          "MM10",
          "MM8",
          "MM6",
          "MM5",
          "MM3",
          "MM1",
          "Minus1mm",
        ].includes(field.key),
      ),
    },
    {
      title: "Proximate Analysis",
      fields: coalStockFields.filter((field) =>
        ["TM", "VM", "ASH", "FC", "MPS"].includes(field.key),
      ),
    },
  ],
  IronOre: [
    {
      title: "Chemical Analysis",
      fields: stockIronOreFields.filter((field) =>
        ["TM", "FET", "LOI"].includes(field.key),
      ),
    },
    {
      title: "Sizing Analysis",
      fields: stockIronOreFields.filter((field) =>
        ["Plus18mm", "Minus8mm", "MPS"].includes(field.key),
      ),
    },
  ],
  Dolomite: [
    {
      title: "Moisture Analysis",
      fields: dolomiteStockFields.filter((field) => ["TM"].includes(field.key)),
    },
    {
      title: "Sizing Analysis",
      fields: dolomiteStockFields.filter((field) =>
        ["Plus6mm", "Minus1mm", "MPS"].includes(field.key),
      ),
    },
  ],
  Charcoal: [
    {
      title: "Chemical Analysis",
      fields: charcoalStockFields.filter((field) => ["FC"].includes(field.key)),
    },
    {
      title: "Sizing Analysis",
      fields: charcoalStockFields.filter((field) =>
        ["Minus1mm"].includes(field.key),
      ),
    },
  ],
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "http://192.168.3.45:7067";
const SAP_RAW_LOOKUPS_ENDPOINT = `${API_BASE_URL}/api/sap/raw-material-lookups`;
const SAP_TRUCK_LOOKUPS_ENDPOINT = `${API_BASE_URL}/api/sap/raw-material-trucks`;
const SAP_RECORD_LOOKUP_ENDPOINT = `${API_BASE_URL}/api/sap/raw-material-record`;
const RAW_COAL_AUTO_SAVE_INTERVAL_MS = 30000;

const toDateInputValue = (value) => {
  if (!value) return "";

  const normalized = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(normalized)) {
    return normalized.slice(0, 10);
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDraftStatusTime = (value) => {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const parseSapLockDetails = (messages = [], sapMessage = "") => {
  const allMessages = [
    ...(Array.isArray(messages) ? messages : []),
    ...(sapMessage ? [sapMessage] : []),
  ].filter(Boolean);

  const confirmationNumbers = [];
  let blockedByUser = "";

  allMessages.forEach((message) => {
    const text = String(message);
    const confirmationMatches = [
      ...text.matchAll(/confirmation number\s+(\d+)/gi),
    ];

    confirmationMatches.forEach((match) => {
      if (match?.[1]) confirmationNumbers.push(match[1]);
    });

    const blockedUserMatch = text.match(/blocked by user\s+([A-Z0-9_@.-]+)/i);
    if (blockedUserMatch?.[1] && !blockedByUser) {
      blockedByUser = blockedUserMatch[1];
    }
  });

  const uniqueConfirmationNumbers = [...new Set(confirmationNumbers)].sort();
  const isSapLockError =
    uniqueConfirmationNumbers.length > 0 ||
    allMessages.some((message) => /blocked by user/i.test(String(message)));

  return {
    isSapLockError,
    blockedByUser,
    confirmationNumbers: uniqueConfirmationNumbers,
    confirmationRange:
      uniqueConfirmationNumbers.length > 1
        ? `${uniqueConfirmationNumbers[0]} to ${
          uniqueConfirmationNumbers[uniqueConfirmationNumbers.length - 1]
        }`
        : uniqueConfirmationNumbers[0] || "",
  };
};

const getMonthNameFromEntryDate = (entryDate) => {
  if (!entryDate) return "";

  const parsedDate = new Date(entryDate);
  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toLocaleString("en-US", { month: "long" });
};

const getRawMaterialFieldDefinitions = (material) => {
  if (material === "COAL") return coalFields;
  if (material === "PELLETS") return pelletsFields;
  if (material === "IRON_ORE") return ironOreFields;
  if (material === "DOLOMITE") return dolomiteFields;
  return [];
};

const createEmptyRawMaterialForm = (material, defaults = {}) => {
  const fields = getRawMaterialFieldDefinitions(material);
  const emptyFields = Object.fromEntries(fields.map((field) => [field.key, ""]));

  return {
    coalId: "",
    pelletId: "",
    ironOreId: "",
    dolomiteId: "",
    status: "Pending",
    ...emptyFields,
    ...defaults,
  };
};

const RawMaterialTesting = () => {

  const [menuOpen, setMenuOpen] = useState(true);
  const navigate = useNavigate();

  const [permissions, setPermissions] = useState(null);
  const [source, setSource] = useState("");
  const [activeModule, setActiveModule] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [qualityFormData, setQualityFormData] = useState({});
  const [isCoalImageUploading, setIsCoalImageUploading] = useState(false);
  const [showCoalOtherFields, setShowCoalOtherFields] = useState(false);

  const [animKey, setAnimKey] = useState(0);
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [gradeChart, setGradeChart] = useState({ A: 0, B: 0, C: 0, D: 0 });
  const [gradeTooltip, setGradeTooltip] = useState(null);
  const [truckNumbers, setTruckNumbers] = useState([]);
  const [sapDates, setSapDates] = useState([]);
  const [sapLookupsLoading, setSapLookupsLoading] = useState(false);
  const [sapTruckLoading, setSapTruckLoading] = useState(false);
  const [sapRecordLoading, setSapRecordLoading] = useState(false);
  const [sapLookupsError, setSapLookupsError] = useState("");

  const clearSapDependentFields = (formData = {}) => ({
    ...formData,
    truckNo: "",
    inspectionLot: "",
    transporter: "",
    party: "",
    partyName: "",
    materialCode: "",
    gateNumber: "",
    poNumber: "",
    qty: "",
    qtyMT: "",
    qtymt: "",
  });

  const applySapRecordToForm = (formData = {}, record = {}) => {
    const quantity = record?.quantity ?? "";
    return {
      ...formData,
      truckNo: record?.truckNo ?? "",
      inspectionLot: record?.inspectionLot ?? "",
      transporter: record?.transporter ?? "",
      party: record?.partyName ?? "",
      partyName: record?.partyName ?? "",
      materialCode: record?.materialCode ?? "",
      gateNumber: record?.gateNumber ?? "",
      poNumber: record?.poNumber ?? "",
      qty: quantity,
      qtyMT: quantity,
      qtymt: quantity,
    };
  };

  useEffect(() => {
    const stored = localStorage.getItem("permissions");
    try {
      setPermissions(stored ? JSON.parse(stored) : {});
    } catch {
      setPermissions({});
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchSapLookups = async () => {
      setSapLookupsLoading(true);
      setSapLookupsError("");

      try {
        const response = await fetch(SAP_RAW_LOOKUPS_ENDPOINT, {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          let detail = "";
          try {
            const errorBody = await response.json();
            detail = errorBody?.detail || errorBody?.message || errorBody?.title || "";
          } catch {
            detail = "";
          }
          throw new Error(
            detail
              ? `Lookup API failed (${response.status}): ${String(detail).slice(0, 140)}`
              : `Lookup API failed (${response.status})`,
          );
        }

        const data = await response.json();
        if (!data || typeof data !== "object") {
          throw new Error("Lookup API returned invalid format.");
        }

        if (cancelled) return;

        setSapDates(Array.isArray(data.dates) ? data.dates : []);
        if (data.errors && typeof data.errors === "object" && Object.keys(data.errors).length > 0) {
          setSapLookupsError("Some SAP date sources failed. Loaded available values only.");
        }
      } catch (error) {
        if (cancelled) return;

        setTruckNumbers([]);
        setSapDates([]);
        setSapLookupsError(error instanceof Error ? error.message : "Unable to load SAP dates.");
      } finally {
        if (!cancelled) {
          setSapLookupsLoading(false);
        }
      }
    };

    fetchSapLookups();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (activeModule !== "") return;
    setDashboardLoading(true);
    Promise.all([
      fetch(`${API_BASE_URL}/api/production/dashboard-summary`).then(
        (r) => r.json(),
      ),
      fetch(`${API_BASE_URL}/api/production/get-all-data`).then((r) =>
        r.json(),
      ),
    ])
      .then(([summary, allData]) => {
        setDashboard(summary);

        const counts = { A: 0, B: 0, C: 0, D: 0 };
        const list = Array.isArray(allData?.production)
          ? allData.production
          : [];

        list.forEach((row) => {
          const src = String(row?.source ?? row?.Source ?? "").toUpperCase();
          if (src !== "CD" && src !== "PH") return;

          const rawGrade = String(row?.grade ?? row?.Grade ?? "")
            .trim()
            .toUpperCase();
          if (["A", "B", "C", "D"].includes(rawGrade)) {
            counts[rawGrade] += 1;
          }
        });
        setGradeChart(counts);
      })
      .catch(() => {
        setDashboard(null);
        setGradeChart({ A: 0, B: 0, C: 0, D: 0 });
      })
      .finally(() => setDashboardLoading(false));
  }, [activeModule]);
  const [stockMaterial, setStockMaterial] = useState("");
  const [stockBelts, setStockBelts] = useState([
    "Belt 1",
    "Belt 2",
    "Belt 3",
    "Belt 4",
  ]);
  const [showCustomStockBelt, setShowCustomStockBelt] = useState(false);
  const [customStockBelt, setCustomStockBelt] = useState("");
  const [stockFormData, setStockFormData] = useState({
    kiln: "",
    belt: "",
    status: "Pending",
    MM25: "",
    MM22: "",
    MM20: "",
    MM18: "",
    MM15: "",
    MM12: "",
    MM10: "",
    MM8: "",
    MM6: "",
    MM5: "",
    MM3: "",
    MM1: "",
    Minus1mm: "",
    TM: "",
    VM: "",
    ASH: "",
    Plus6mm: "",
    MPS: "",
    FC: "",
  });

  const resolveCurrentUserId = () => {
    const candidates = [
      localStorage.getItem("userId"),
      localStorage.getItem("userName"),
    ];

    for (const value of candidates) {
      const normalized = String(value ?? "").trim();
      const lowered = normalized.toLowerCase();
      if (normalized && lowered !== "null" && lowered !== "undefined") {
        return normalized;
      }
    }

    return "";
  };

  const userId = resolveCurrentUserId();
  const filledByDisplay = userId;
  const isSuperAdmin = userId.toLowerCase() === "ajn@lloyds.in";
  const activeModuleRef = useRef("");
  const selectedMaterialRef = useRef("");
  const stockMaterialRef = useRef("");
  const sourceRef = useRef("");
  const qualityFormDataRef = useRef({});
  const stockFormDataRef = useRef({});
  const prodFormDataRef = useRef({});
  const dispatchFormDataRef = useRef({});
  const rawDraftSavePromiseRef = useRef(null);

  const isFilledValue = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === "number") return !Number.isNaN(value);
    if (typeof value === "string") return value.trim() !== "";
    return true;
  };

  const hasFilledObjectFields = (obj, ignoreKeys = []) => {
    const ignore = new Set(ignoreKeys);
    return Object.entries(obj || {}).some(
      ([key, value]) => !ignore.has(key) && isFilledValue(value),
    );
  };

  const shouldPersistCoalDraft = (formData = qualityFormDataRef.current || qualityFormData) => (
    activeModuleRef.current === "quality" &&
    selectedMaterialRef.current === "COAL" &&
    hasFilledObjectFields(formData, [
      "status",
      "monthName",
      "coalId",
      "pelletId",
      "ironOreId",
      "dolomiteId",
      "id",
      "filledBy",
      "FilledBy",
    ])
  );

  const normalizeCoalDraftForm = (draftData = {}) => {
    const normalizedDraft = Object.fromEntries(
      Object.entries(draftData || {}).map(([key, value]) => [key, value ?? ""]),
    );

    const nextEntryDate = toDateInputValue(
      normalizedDraft.entryDate || normalizedDraft.EntryDate,
    );
    const nextFromDate = toDateInputValue(
      normalizedDraft.fromDate || normalizedDraft.FromDate,
    );

    return createEmptyRawMaterialForm("COAL", {
      ...normalizedDraft,
      coalId: normalizedDraft.coalId || normalizedDraft.CoalId || "",
      fromDate: nextFromDate,
      entryDate: nextEntryDate,
      monthName:
        normalizedDraft.monthName ||
        normalizedDraft.MonthName ||
        getMonthNameFromEntryDate(nextEntryDate),
      filledBy:
        normalizedDraft.filledBy ||
        normalizedDraft.FilledBy ||
        filledByDisplay ||
        userId ||
        "",
      FilledBy:
        normalizedDraft.FilledBy ||
        normalizedDraft.filledBy ||
        filledByDisplay ||
        userId ||
        "",
      status: normalizedDraft.status || normalizedDraft.Status || "DRAFT",
    });
  };
  const userIdQuery = userId ? `?userId=${encodeURIComponent(userId)}` : "";

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/production/stock-belt-options`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) {
          setStockBelts(list);
        }
      })
      .catch(() => { });
  }, []);

  const effectivePermissions =
    userId === "ajn@lloyds.in"
      ? {
        pages: {
          rawMaterial: true,
          production: true,
          reports: true,
          managerApproval: true,
          dispatch: true,
          stockHouse: true,
        },
        rawMaterialModules: {
          coal: true,
          pellets: true,
          ironOre: true,
          dolomite: true,
        },
        actions: {
          save: true,
          approve: true,
          reject: true,
          edit: true,
        },
      }
      : permissions;

  // --- 2. Component State ---
  // const [userId, setUserId] = useState("");
  // const [password, setPassword] = useState("");
  const getCurrentSystemTime24 = () =>
    new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  const [prodFormData, setProdFormData] = useState({
    area: "",
    item: "",
    shift: "",
    time: "",
    feM: "",
    sulphur: "",
    carbon: "",
    nMag: "",
    overSize: "",
    underSize: "",
    magInChar: "",
    feMInChar: "",
    byProductId: "",
    byProductMaterial: "",
    byProductFc: "",
    byProductMinus1mm: "",
    binNo: "",
    grade: "",
    status: "Pending",
    remarks: "",
  });
  const [cdEntryMode, setCdEntryMode] = useState("finishedGoods");
  // Also missing from your code
  const [dispatchFormData, setDispatchFormData] = useState({
    material: "",
    truckNo: "",
    partyName: "",
    destination: "",
    materialSize: "",
    qty: "",
    feM: "",
    minus3mm: "",
    dispatchOfficer: "",
    remarks: "",
    status: "Pending",
  });

  const [isSaving, setIsSaving] = useState(false);
  //   const [isLoggedIn, setIsLoggedIn] = useState(
  //   !!localStorage.getItem("userId")
  // );
  const [editingItem, setEditingItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [tempEditData, setTempEditData] = useState(null);

  // --- 3. Helper Functions ---
  const validateRange = (value) => {
    if (value === "" || value === null) return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : Math.min(100, Math.max(0, num));
  };

  const fetchNextId = async (material) => {
    try {
      // Example: ${API_BASE_URL}/api/production/get-next-id?material=COAL
      const res = await fetch(
        `${API_BASE_URL}/api/production/get-next-id?material=${material}`,
      );
      if (res.ok) {
        const baseIdRaw = await res.text();
        const baseId = String(baseIdRaw ?? "").trim();
        const nextId = await buildSequencedRawMaterialId(material, baseId);
        return nextId;
      }
    } catch (err) {
      console.error("Error fetching ID:", err);
    }

    return "";
  };

  const getRawMaterialIdKey = (material) =>
    material === "COAL"
      ? "coalId"
      : material === "PELLETS"
        ? "pelletId"
        : material === "IRON_ORE"
          ? "ironOreId"
          : material === "DOLOMITE"
            ? "dolomiteId"
            : "coalId";

  const getCurrentRawMaterialEntryId = () => {
    const key = getRawMaterialIdKey(selectedMaterial);
    return qualityFormData?.[key] || "";
  };

  const getRawDirtyTrackingSnapshot = (
    material = selectedMaterial,
    formData = qualityFormData,
  ) => {
    const fields = getRawMaterialFieldDefinitions(material);
    const idKey = getRawMaterialIdKey(material);
    const snapshot = Object.fromEntries(
      fields.map((field) => [field.key, formData?.[field.key] ?? ""]),
    );

    snapshot[idKey] = formData?.[idKey] ?? "";
    snapshot.fromDate = formData?.fromDate ?? "";
    snapshot.monthName = formData?.monthName ?? "";
    snapshot.entryDate = formData?.entryDate ?? "";
    return JSON.stringify(snapshot);
  };

  const getCurrentRawFormData = () => qualityFormDataRef.current || qualityFormData || {};

  const isRawEntryDirtyNow = (
    material = selectedMaterialRef.current || selectedMaterial,
    formData = getCurrentRawFormData(),
  ) => {
    if (!material) return false;
    if (!["new", "draft"].includes(rawEntryModeRef.current)) return false;

    const currentSnapshot = getRawDirtyTrackingSnapshot(material, formData);
    return (
      currentSnapshot !== rawBaselineRef.current &&
      hasFilledObjectFields(formData, [
        "status",
        "monthName",
        "entryDate",
        "coalId",
        "pelletId",
        "ironOreId",
        "dolomiteId",
        "id",
      ])
    );
  };

  const markRawEntryBaseline = (
    material,
    formData,
    mode = "new",
  ) => {
    rawEntryModeRef.current = mode;
    rawBaselineRef.current = getRawDirtyTrackingSnapshot(material, formData);
    rawDirtyRef.current = false;
    setIsDirty(false);
  };

  const ensureRawMaterialEntryId = async (material, formData = qualityFormData) => {
    const idKey = getRawMaterialIdKey(material);
    const existingId = String(formData?.[idKey] ?? "").trim();
    if (existingId) return { idKey, entryId: existingId };

    const generatedId = await fetchNextId(material);
    return { idKey, entryId: String(generatedId ?? "").trim() };
  };

  const getCoalDraftPayload = async (
    formData = getCurrentRawFormData(),
    { allowFetchId = true } = {},
  ) => {
    const idKey = getRawMaterialIdKey("COAL");
    let entryId = String(formData?.[idKey] ?? "").trim();

    if (!entryId && allowFetchId) {
      const ensured = await ensureRawMaterialEntryId("COAL", formData);
      entryId = ensured.entryId;
    }

    if (!entryId) {
      return null;
    }

    return {
      ...formData,
      [idKey]: entryId,
      fromDate: formData?.fromDate || null,
      entryDate: formData?.entryDate || null,
      monthName:
        formData?.monthName ||
        getMonthNameFromEntryDate(formData?.entryDate),
      status: "DRAFT",
      filledBy: formData?.filledBy || filledByDisplay || userId || null,
      FilledBy: formData?.FilledBy || filledByDisplay || userId || null,
    };
  };

  const loadCoalDrafts = async () => {
    if (!userId) {
      setCoalDrafts([]);
      return [];
    }

    setCoalDraftsLoading(true);

    try {
      const token = localStorage.getItem("token") || "";
      const drafts = await fetchCoalDrafts({
        token,
        userId,
      });

      const normalizedDrafts = Array.isArray(drafts) ? drafts : [];
      setCoalDrafts(normalizedDrafts);
      return normalizedDrafts;
    } catch (error) {
      console.error("Unable to load coal drafts:", error);
      setCoalDrafts([]);
      return [];
    } finally {
      setCoalDraftsLoading(false);
    }
  };

  const openCoalDraft = async (entryId) => {
    const normalizedEntryId = String(entryId || "").trim();
    if (!normalizedEntryId) return;

    try {
      const token = localStorage.getItem("token") || "";
      const draft = await fetchCoalDraft({
        entryId: normalizedEntryId,
        token,
        userId,
      });

      if (!draft?.coalId) return;

      const draftForm = normalizeCoalDraftForm(draft);
      setSelectedMaterial("COAL");
      setQualityFormData(draftForm);
      setShowCoalOtherFields(false);
      setRawDraftStatus({
        tone: "restored",
        message: "Draft opened for editing.",
        entryId: draft.coalId,
        lastSavedAt: draft.lastSavedAt || "",
      });
      markRawEntryBaseline("COAL", draftForm, "draft");
    } catch (error) {
      console.error("Unable to open coal draft:", error);
      setRawDraftStatus({
        tone: "error",
        message: "Unable to open the selected draft.",
        entryId: normalizedEntryId,
        lastSavedAt: "",
      });
    }
  };

  const getGenericDraftModuleKey = () => {
    if (activeModuleRef.current === "quality") {
      const material = selectedMaterialRef.current;
      if (material === "PELLETS") return "RAW_PELLETS";
      if (material === "IRON_ORE") return "RAW_IRON_ORE";
      if (material === "DOLOMITE") return "RAW_DOLOMITE";
      return "";
    }

    if (activeModuleRef.current === "stockhouse") {
      const material = stockMaterialRef.current;
      if (material === "Coal") return "STOCK_COAL";
      if (material === "IronOre") return "STOCK_IRON_ORE";
      if (material === "Dolomite") return "STOCK_DOLOMITE";
      if (material === "Charcoal") return "STOCK_CHARCOAL";
      return "";
    }

    if (activeModuleRef.current === "production" && sourceRef.current) {
      return `PRODUCTION_${sourceRef.current}`;
    }

    if (activeModuleRef.current === "dispatch") {
      return "DISPATCH";
    }

    return "";
  };

  const getGenericDraftDisplayName = (moduleKey) => {
    if (moduleKey === "RAW_PELLETS") return "Pellets";
    if (moduleKey === "RAW_IRON_ORE") return "Iron Ore";
    if (moduleKey === "RAW_DOLOMITE") return "Dolomite";
    if (moduleKey === "STOCK_COAL") return "Stock House Coal";
    if (moduleKey === "STOCK_IRON_ORE") return "Stock House Iron Ore";
    if (moduleKey === "STOCK_DOLOMITE") return "Stock House Dolomite";
    if (moduleKey === "STOCK_CHARCOAL") return "Stock House Charcoal";
    if (moduleKey === "PRODUCTION_PH") return "Product House";
    if (moduleKey === "PRODUCTION_CD") return "Cooler Discharge";
    if (moduleKey === "DISPATCH") return "Dispatch";
    return "Draft";
  };

  const loadGenericDrafts = async (moduleKey = getGenericDraftModuleKey()) => {
    if (!moduleKey || !userId) {
      setModuleDrafts([]);
      return [];
    }

    setModuleDraftsLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const drafts = await fetchFormDrafts({ moduleKey, token, userId });
      const normalizedDrafts = Array.isArray(drafts) ? drafts : [];
      setModuleDrafts(normalizedDrafts);
      return normalizedDrafts;
    } catch (error) {
      console.error("Unable to load module drafts:", error);
      setModuleDrafts([]);
      return [];
    } finally {
      setModuleDraftsLoading(false);
    }
  };

  const resetStockEntry = async (material = stockMaterialRef.current) => {
    if (!material) return;
    const response = await fetch(
      `${API_BASE_URL}/api/production/get-next-stock-id?material=${material}`,
    );
    const nextId = response.ok ? await response.text() : "";
    setStockFormData({
      id: nextId || "",
      entryDate: new Date().toISOString().split("T")[0],
      filledBy: filledByDisplay || userId || "",
      status: "Pending",
      kiln: "",
      belt: "",
      MM25: "",
      MM22: "",
      MM20: "",
      MM18: "",
      MM15: "",
      MM12: "",
      MM10: "",
      MM8: "",
      MM6: "",
      MM5: "",
      MM3: "",
      MM1: "",
      Minus1mm: "",
      TM: "",
      VM: "",
      ASH: "",
      FET: "",
      LOI: "",
      Plus18mm: "",
      Minus8mm: "",
      Plus6mm: "",
      MPS: "",
      FC: "",
      remarks: "",
    });
    setModuleDraftStatus({
      tone: "idle",
      message: `${getGenericDraftDisplayName(getGenericDraftModuleKey())} draft area is ready.`,
      entryId: nextId || "",
      lastSavedAt: "",
    });
  };

  const resetProductionEntry = async (currentSource = sourceRef.current) => {
    if (!currentSource) return;
    const response = await fetch(
      `${API_BASE_URL}/api/production/get-next-production-id?source=${currentSource}`,
    );
    const nextId = response.ok ? await response.text() : "";
    setProdFormData({
      area: "",
      item: "",
      shift: "",
      time: getCurrentSystemTime24().split(":").slice(0, 2).join(":"),
      feM: "",
      sulphur: "",
      carbon: "",
      nMag: "",
      overSize: "",
      underSize: "",
      magInChar: "",
      feMInChar: "",
      byProductId: "",
      byProductMaterial: "",
      byProductFc: "",
      byProductMinus1mm: "",
      binNo: "",
      grade: "",
      remarks: "",
      status: "Pending",
      productionCode: nextId || "",
    });
    setModuleDraftStatus({
      tone: "idle",
      message: `${getGenericDraftDisplayName(getGenericDraftModuleKey())} draft area is ready.`,
      entryId: nextId || "",
      lastSavedAt: "",
    });
  };

  const resetDispatchEntry = async () => {
    const response = await fetch(`${API_BASE_URL}/api/production/get-next-dispatch-id`);
    const nextId = response.ok ? await response.text() : "";
    setDispatchFormData((prev) => ({
      ...prev,
      dispatchCode: nextId || "",
      id: nextId || "",
      month: "",
      entryDate: "",
      material: "",
      truckNo: "",
      partyName: "",
      destination: "",
      materialSize: "",
      qty: "",
      feM: "",
      minus3mm: "",
      dispatchOfficer: "",
      remarks: "",
      status: "Pending",
    }));
    setModuleDraftStatus({
      tone: "idle",
      message: "Dispatch draft area is ready.",
      entryId: nextId || "",
      lastSavedAt: "",
    });
  };

  const saveCurrentGenericDraft = async ({
    reason = "manual",
    keepalive = false,
    force = false,
  } = {}) => {
    const moduleKey = getGenericDraftModuleKey();
    if (!moduleKey) return null;

    let entryId = "";
    let payloadJson = "";

    if (moduleKey.startsWith("RAW_")) {
      const material = selectedMaterialRef.current;
      const formData = qualityFormDataRef.current || {};
      if (!hasFilledObjectFields(formData, ["status", "coalId", "pelletId", "ironOreId", "dolomiteId", "filledBy", "FilledBy"])) return null;
      const idKey = getRawMaterialIdKey(material);
      entryId = String(formData?.[idKey] || "").trim();
      payloadJson = JSON.stringify({ material, formData });
    } else if (moduleKey.startsWith("STOCK_")) {
      const formData = stockFormDataRef.current || {};
      if (!hasFilledObjectFields(formData, ["id", "status", "filledBy"])) return null;
      entryId = String(formData?.id || "").trim();
      payloadJson = JSON.stringify({ stockMaterial: stockMaterialRef.current, formData });
    } else if (moduleKey.startsWith("PRODUCTION_")) {
      const formData = prodFormDataRef.current || {};
      if (!hasFilledObjectFields(formData, ["productionCode", "status", "byProductId"])) return null;
      entryId = String(formData?.productionCode || "").trim();
      payloadJson = JSON.stringify({ source: sourceRef.current, formData });
    } else if (moduleKey === "DISPATCH") {
      const formData = dispatchFormDataRef.current || {};
      if (!hasFilledObjectFields(formData, ["dispatchCode", "id", "status"])) return null;
      entryId = String(formData?.dispatchCode || formData?.id || "").trim();
      payloadJson = JSON.stringify({ formData });
    }

    if (!entryId) return null;

    const token = localStorage.getItem("token") || "";
    const result = await saveFormDraft({
      payload: {
        moduleKey,
        entryId,
        payloadJson,
        filledBy: filledByDisplay || userId || null,
      },
      token,
      userId,
      keepalive,
    });

    setModuleDraftStatus({
      tone: "saved",
      message: "Draft auto-saved.",
      entryId,
      lastSavedAt: result?.lastSavedAt || new Date().toISOString(),
    });
    await loadGenericDrafts(moduleKey);

    if (reason === "navigation" && !keepalive) {
      if (moduleKey.startsWith("STOCK_")) await resetStockEntry(stockMaterialRef.current);
      if (moduleKey.startsWith("PRODUCTION_")) await resetProductionEntry(sourceRef.current);
      if (moduleKey === "DISPATCH") await resetDispatchEntry();
      if (moduleKey.startsWith("RAW_")) await startNewRawMaterialEntry(selectedMaterialRef.current);
    }

    return result;
  };

  const openGenericDraft = async (draft) => {
    if (!draft?.moduleKey || !draft?.entryId) return;

    try {
      const token = localStorage.getItem("token") || "";
      const loadedDraft = await fetchFormDraft({
        moduleKey: draft.moduleKey,
        entryId: draft.entryId,
        token,
        userId,
      });

      const payload = JSON.parse(loadedDraft.payloadJson || "{}");

      if (draft.moduleKey.startsWith("RAW_")) {
        const material = payload?.material || selectedMaterialRef.current;
        const formData = createEmptyRawMaterialForm(material, payload?.formData || {});
        setSelectedMaterial(material);
        setQualityFormData(formData);
        markRawEntryBaseline(material, formData, "draft");
      } else if (draft.moduleKey.startsWith("STOCK_")) {
        setStockMaterial(payload?.stockMaterial || stockMaterialRef.current);
        setStockFormData(payload?.formData || {});
      } else if (draft.moduleKey.startsWith("PRODUCTION_")) {
        setSource(payload?.source || sourceRef.current);
        setProdFormData(payload?.formData || {});
      } else if (draft.moduleKey === "DISPATCH") {
        setDispatchFormData(payload?.formData || {});
      }

      setModuleDraftStatus({
        tone: "restored",
        message: "Draft opened for editing.",
        entryId: draft.entryId,
        lastSavedAt: draft.lastSavedAt || "",
      });
    } catch (error) {
      console.error("Unable to open generic draft:", error);
    }
  };

  const saveCurrentCoalDraft = async ({
    reason = "manual",
    keepalive = false,
    silent = true,
    force = false,
    resetAfterSave = false,
  } = {}) => {
    const currentMaterial = selectedMaterialRef.current || selectedMaterial;
    if (currentMaterial !== "COAL") return null;

    const formData = getCurrentRawFormData();
    if (!shouldPersistCoalDraft(formData)) return null;
    if (!force && !rawDirtyRef.current && reason !== "unload") return null;

    if (rawDraftSavePromiseRef.current && reason !== "unload") {
      return rawDraftSavePromiseRef.current;
    }

    const draftPromise = (async () => {
      const token = localStorage.getItem("token") || "";
      const payload = await getCoalDraftPayload(formData, {
        allowFetchId: !keepalive,
      });

      if (!payload?.coalId) return null;

      const draftResponse = await saveCoalDraft({
        payload,
        token,
        userId,
        keepalive,
      });

      const lastSavedAt = draftResponse?.lastSavedAt || new Date().toISOString();

      const nextFormData =
        String(formData?.coalId || "").trim() === payload.coalId
          ? { ...formData, coalId: payload.coalId, status: "DRAFT" }
          : formData;

      setRawDraftStatus({
        tone: "saved",
        message:
          reason === "manual"
            ? "Draft saved. A new Entry ID is ready for the next form."
            : "Draft auto-saved.",
        entryId: payload.coalId,
        lastSavedAt,
      });
      markRawEntryBaseline("COAL", nextFormData, "new");
      await loadCoalDrafts();

      if (resetAfterSave && reason === "manual") {
        await startNewRawMaterialEntry("COAL");
      } else {
        setQualityFormData((prev) => ({
          ...prev,
          coalId: payload.coalId,
        }));
      }

      return draftResponse;
    })();

    rawDraftSavePromiseRef.current = draftPromise;

    try {
      return await draftPromise;
    } catch (error) {
      setRawDraftStatus((prev) => ({
        ...prev,
        tone: "error",
        message: "Draft save failed. Final save still remains available.",
      }));
      if (!silent) {
        console.error(`Coal draft save failed during ${reason}:`, error);
      }
      return null;
    } finally {
      if (rawDraftSavePromiseRef.current === draftPromise) {
        rawDraftSavePromiseRef.current = null;
      }
    }
  };

  const saveActiveDraft = async (options = {}) => {
    if (
      activeModuleRef.current === "quality" &&
      selectedMaterialRef.current === "COAL"
    ) {
      return saveCurrentCoalDraft(options);
    }

    return saveCurrentGenericDraft(options);
  };

  const startNewRawMaterialEntry = async (material) => {
    if (!material) return;

    const idKey = getRawMaterialIdKey(material);
    const nextId = await fetchNextId(material);
    const freshForm = createEmptyRawMaterialForm(material, {
      [idKey]: nextId || "",
      fromDate: "",
      entryDate: "",
      monthName: "",
      filledBy: filledByDisplay || userId || "",
      FilledBy: filledByDisplay || userId || "",
    });

    setSelectedMaterial(material);
    setQualityFormData(freshForm);
    setShowCoalOtherFields(false);
    if (material === "COAL") {
      await loadCoalDrafts();
      setRawDraftStatus({
        tone: "idle",
        message: "Current form is a fresh Entry ID. Saved drafts stay below until submitted.",
        entryId: nextId || "",
        lastSavedAt: "",
      });
    } else {
      const rawModuleKey =
        material === "PELLETS"
          ? "RAW_PELLETS"
          : material === "IRON_ORE"
            ? "RAW_IRON_ORE"
            : material === "DOLOMITE"
              ? "RAW_DOLOMITE"
              : "";
      await loadGenericDrafts(rawModuleKey);
      setModuleDraftStatus({
        tone: "idle",
        message: `Current ${material.replaceAll("_", " ").toLowerCase()} form is using a fresh Entry ID.`,
        entryId: nextId || "",
        lastSavedAt: "",
      });
    }
    markRawEntryBaseline(material, freshForm, "new");
    return freshForm;
  };

  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (!source) return;

    if (source !== "CD") {
      setCdEntryMode("finishedGoods");
    }

    // Auto-fetch current system time in 24-hour format
    const currentTime = getCurrentSystemTime24().split(":").slice(0, 2).join(":");
    setProdFormData((prev) => ({
      ...prev,
      time: currentTime,
    }));

    if (source === "CD" && cdEntryMode === "byProduct") {
      fetch(
        `${API_BASE_URL}/api/production/get-next-byproduct-dolochar-id`,
      )
        .then((r) => r.text())
        .then((id) => {
          setProdFormData((prev) => ({
            ...prev,
            byProductId: id,
            status: "Pending",
          }));
        });
      return;
    }

    fetch(
      `${API_BASE_URL}/api/production/get-next-production-id?source=${source}`,
    )
      .then((r) => r.text())
      .then((id) => {
        setProdFormData((prev) => ({
          ...prev,
          productionCode: id,
          status: "Pending",
        }));
      });
  }, [source, cdEntryMode]);

  const handleStockChange = (name, value) => {
    // Prevent 'e' and 'E' characters (scientific notation)
    if (value.toLowerCase().includes('e')) {
      value = value.replace(/[eE]/g, '');
    }

    setStockFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const num = Number(value);
    if (value === "" || value === null || value === undefined) {
      setStockFieldErrors((prev) => ({ ...prev, [name]: "" }));
      return;
    }
    if (Number.isNaN(num)) return;

    if (num < 1 || num > 100) {
      setStockFieldErrors((prev) => ({ ...prev, [name]: "Exceeded Limit" }));
    } else {
      setStockFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const [openSamples, setOpenSamples] = useState(true);
  const [openReports, setOpenReports] = useState(true);
  const [openApproval, setOpenApproval] = useState(true);

  const [coalParties, setCoalParties] = useState([
    "CHIRMIRI",
    "TRAFIGURA PTE LTD",
    "MAKARDHOKDA",
    "GOKUL",
    "LOTUS",
  ]);
  const [showCustomParty, setShowCustomParty] = useState(false);
  const [customParty, setCustomParty] = useState("");

  const [formData, setFormData] = useState({
    field1: "",
    field2: "",
    field3: "",
  });

  const [isCustomSource, setIsCustomSource] = useState(false);

  const buildStockPayload = () => {
    const stockEntryDate =
      stockFormData.entryDate || new Date().toISOString().split("T")[0];
    const stockFilledBy =
      stockFormData.filledBy || filledByDisplay || userId || null;
    const stockStatus = stockFormData.status || "Pending";
    const stockMeta = {
      // Send both key styles so backend DTOs bind reliably.
      Status: stockStatus,
      status: stockStatus,
      EntryDate: stockEntryDate,
      entryDate: stockEntryDate,
      FilledBy: stockFilledBy,
      filledBy: stockFilledBy,
    };

    // send only backend model fields
    if (stockMaterial === "Coal") {
      return {
        Id: stockFormData.id || null,
        ...stockMeta,
        Remarks: stockFormData.remarks || null,
        MM25: stockFormData.MM25 === "" ? null : Number(stockFormData.MM25),
        MM22: stockFormData.MM22 === "" ? null : Number(stockFormData.MM22),
        MM20: stockFormData.MM20 === "" ? null : Number(stockFormData.MM20),
        MM18: stockFormData.MM18 === "" ? null : Number(stockFormData.MM18),
        MM15: stockFormData.MM15 === "" ? null : Number(stockFormData.MM15),
        MM12: stockFormData.MM12 === "" ? null : Number(stockFormData.MM12),
        MM10: stockFormData.MM10 === "" ? null : Number(stockFormData.MM10),
        MM8: stockFormData.MM8 === "" ? null : Number(stockFormData.MM8),
        MM6: stockFormData.MM6 === "" ? null : Number(stockFormData.MM6),
        MM5: stockFormData.MM5 === "" ? null : Number(stockFormData.MM5),
        MM3: stockFormData.MM3 === "" ? null : Number(stockFormData.MM3),
        MM1: stockFormData.MM1 === "" ? null : Number(stockFormData.MM1),
        Minus1mm:
          stockFormData.Minus1mm === "" ? null : Number(stockFormData.Minus1mm),
        TM: stockFormData.TM === "" ? null : Number(stockFormData.TM),
        VM: stockFormData.VM === "" ? null : Number(stockFormData.VM),
        ASH: stockFormData.ASH === "" ? null : Number(stockFormData.ASH),
        FC: stockFormData.FC === "" ? null : Number(stockFormData.FC),
        MPS: stockFormData.MPS === "" ? null : Number(stockFormData.MPS),
      };
    }

    if (stockMaterial === "IronOre") {
      return {
        Id: stockFormData.id || null,
        ...stockMeta,
        Remarks: stockFormData.remarks || null,
        TM: stockFormData.TM === "" ? null : Number(stockFormData.TM),
        FET: stockFormData.FET === "" ? null : Number(stockFormData.FET),
        LOI: stockFormData.LOI === "" ? null : Number(stockFormData.LOI),
        Plus18mm:
          stockFormData.Plus18mm === "" ? null : Number(stockFormData.Plus18mm),
        Minus8mm:
          stockFormData.Minus8mm === "" ? null : Number(stockFormData.Minus8mm),
        MPS: stockFormData.MPS === "" ? null : Number(stockFormData.MPS),
      };
    }

    if (stockMaterial === "Dolomite") {
      return {
        Id: stockFormData.id || null,
        ...stockMeta,
        Remarks: stockFormData.remarks || null,
        TM: stockFormData.TM || null,
        Plus6mm: stockFormData.Plus6mm || null,
        Minus1mm: stockFormData.Minus1mm || null,
        MPS: stockFormData.MPS || null,
      };
    }

    if (stockMaterial === "Charcoal") {
      return {
        Id: stockFormData.id || null,
        ...stockMeta,
        Remarks: stockFormData.remarks || null,
        FC: stockFormData.FC || null,
        Minus1mm: stockFormData.Minus1mm || null,
      };
    }

    return null;
  };

  const getExceededLabels = (items) => {
    const labels = [];
    items.forEach(({ label, value }) => {
      if (value === "" || value === null || value === undefined) return;
      const num = Number(value);
      if (Number.isNaN(num)) return;
      if (num < 1 || num > 100) labels.push(label);
    });
    return labels;
  };

  const productionValidationRules = {
    CD: {
      sulphur: { label: "Sulphur", min: 0.001, max: 0.5, step: "0.001" },
      carbon: { label: "Carbon", min: 0.01, max: 0.5, step: "0.01" },
    },
    PH: {
      feM: { label: "Fe(M)", min: 10, max: 99, step: "0.01" },
      sulphur: { label: "Sulphur", min: 0.001, max: 0.5, step: "0.001" },
      carbon: { label: "Carbon", min: 0.01, max: 0.5, step: "0.01" },
      nMag: { label: "N Mag", min: 0, max: 50, step: "0.01" },
    },
  };

  const productionValidationKeys = Array.from(
    new Set(
      Object.values(productionValidationRules).flatMap((ruleSet) =>
        Object.keys(ruleSet),
      ),
    ),
  );

  const formatRangeValue = (value, step) => {
    const decimals = (step.split(".")[1] || "").length;
    return Number(value).toFixed(decimals);
  };

  const getProductionValidationRule = (fieldName, currentSource = source) =>
    productionValidationRules[currentSource]?.[fieldName];

  const validateProductionField = (
    fieldName,
    rawValue,
    currentSource = source,
  ) => {
    const rule = getProductionValidationRule(fieldName, currentSource);
    if (!rule || rawValue === "" || rawValue === null || rawValue === undefined) {
      return "";
    }

    const value = Number(rawValue);
    if (Number.isNaN(value)) {
      return `Enter a valid ${rule.label} value.`;
    }

    if (value < rule.min || value > rule.max) {
      return `Exceed Limit: ${rule.label} must be between ${formatRangeValue(
        rule.min,
        rule.step,
      )} and ${formatRangeValue(rule.max, rule.step)}.`;
    }

    return "";
  };

  const getProductionValidationErrors = (
    formData = prodFormData,
    currentSource = source,
  ) => {
    const errors = {};

    productionValidationKeys.forEach((fieldName) => {
      const error = validateProductionField(
        fieldName,
        formData?.[fieldName],
        currentSource,
      );

      if (error) {
        errors[fieldName] = error;
      }
    });

    return errors;
  };

  const getProductionFieldStep = (fieldName) =>
    getProductionValidationRule(fieldName)?.step || "0.01";

  const getStockExceededFields = () => {
    if (!stockMaterial) return [];

    if (stockMaterial === "Coal") {
      return getExceededLabels(
        coalStockFields.map((f) => ({
          label: f.label,
          value: stockFormData?.[f.key],
        })),
      );
    }

    if (stockMaterial === "IronOre") {
      return getExceededLabels(
        stockIronOreFields.map((f) => ({
          label: f.label,
          value: stockFormData?.[f.key],
        })),
      );
    }

    if (stockMaterial === "Dolomite") {
      return getExceededLabels(
        dolomiteStockFields.map((f) => ({
          label: f.label,
          value: stockFormData?.[f.key],
        })),
      );
    }

    if (stockMaterial === "Charcoal") {
      return getExceededLabels(
        charcoalStockFields.map((f) => ({
          label: f.label,
          value: stockFormData?.[f.key],
        })),
      );
    }

    return [];
  };

  const getProductionExceededFields = () => {
    const labels = Object.entries(getProductionValidationErrors()).map(
      ([fieldName]) => getProductionValidationRule(fieldName)?.label ?? fieldName,
    );

    if (
      source === "CD" &&
      cdEntryMode === "byProduct" &&
      prodFormData?.byProductMaterial
    ) {
      return labels.concat(
        getExceededLabels([
          { label: "By Product FC", value: prodFormData?.byProductFc },
          { label: "By Product -1MM", value: prodFormData?.byProductMinus1mm },
        ]),
      );
    }

    return labels;
  };

  const getDispatchExceededFields = () => {
    const fields = [
      { key: "qty", label: "QTY" },
      { key: "feM", label: "Fe(M)" },
      { key: "minus3mm", label: "-3mm" },
    ];

    return getExceededLabels(
      fields.map((f) => ({
        label: f.label,
        value: dispatchFormData?.[f.key],
      })),
    );
  };

  const getStockEndpoint = () => {
    if (stockMaterial === "Coal") return "save-stock-coal";
    if (stockMaterial === "IronOre") return "save-stock-ironore";
    if (stockMaterial === "Dolomite") return "save-stock-dolomite";
    if (stockMaterial === "Charcoal") return "save-stock-charcoal";
    return "";
  };

  const submitStock = async (allowExceed = false) => {
    const url = getStockEndpoint();
    const payload = buildStockPayload();

    if (!url || !payload) {
      alert("Select material");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/production/${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(userId ? { "X-User-Id": userId } : {}),
          ...(allowExceed ? { "X-Allow-Exceed": "true" } : {}),
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log("SERVER RESPONSE:", text);

      if (res.ok) {
        // Show consistent non-blocking success popup
        setSavedEntryId(text);
        setShowSuccessPopup(true);
        await loadGenericDrafts(getGenericDraftModuleKey());

        // Reset stock form and errors (non-blocking)
        setStockFormData({
          kiln: "",
          belt: "",
          status: "Pending",
          MM25: "",
          MM22: "",
          MM20: "",
          MM18: "",
          MM15: "",
          MM12: "",
          MM10: "",
          MM8: "",
          MM6: "",
          MM5: "",
          MM3: "",
          MM1: "",
          Minus1mm: "",
          TM: "",
          VM: "",
          ASH: "",
          Plus6mm: "",
          MPS: "",
          FC: "",
          remarks: "",
        });
        setStockFieldErrors({});
      } else {
        alert("Save Failed ❌ " + text);
      }
    } catch (err) {
      console.error(err);
      alert("Backend not reachable");
    }
  };

  const handleStockSubmit = () => {
    const exceeded = getStockExceededFields();
    if (exceeded.length > 0) {
      setExceedFields(exceeded);
      setExceedContext("stock");
      setShowExceedConfirm(true);
      return;
    }

    submitStock(false);
  };

  const getRawMaterialIdFromRow = (material, row) => {
    if (material === "COAL") return row?.coalId ?? row?.CoalId ?? row?.id;
    if (material === "PELLETS")
      return row?.pelletId ?? row?.PelletId ?? row?.id;
    if (material === "IRON_ORE")
      return row?.ironOreId ?? row?.IronOreId ?? row?.id;
    if (material === "DOLOMITE")
      return row?.dolomiteId ?? row?.DolomiteId ?? row?.id;
    return row?.id;
  };

  const buildSequencedRawMaterialId = async (material, baseId) => {
    if (!baseId) return "";

    // If backend already returns an ID with sequence, keep it unchanged.
    if (baseId.length > 11) return baseId;

    try {
      const allDataRes = await fetch(`${API_BASE_URL}/api/production/get-all-data`);

      const allData = allDataRes?.ok ? await allDataRes.json() : {};

      const rows =
        material === "COAL"
          ? [...(allData?.coal || []), ...(allData?.coalDrafts || [])]
          : material === "PELLETS"
            ? allData?.pellets
            : material === "IRON_ORE"
              ? allData?.ironOre
              : material === "DOLOMITE"
                ? allData?.dolomite
                : [];

      const allRows = Array.isArray(rows) ? rows : [];

      let maxSeq = 0;
      allRows.forEach((row) => {
        const rawId = String(
          getRawMaterialIdFromRow(material, row) ?? "",
        ).trim();
        if (!rawId.startsWith(baseId)) return;

        const suffix = rawId.slice(baseId.length);
        if (suffix === "") {
          maxSeq = Math.max(maxSeq, 0);
          return;
        }

        if (!/^\d+$/.test(suffix)) return;
        const seqNum = Number(suffix);
        if (Number.isFinite(seqNum)) {
          maxSeq = Math.max(maxSeq, seqNum);
        }
      });

      const nextSeq = String(maxSeq + 1).padStart(2, "0");
      return `${baseId}${nextSeq}`;
    } catch {
      // Safe fallback if any lookup fails.
      return `${baseId}01`;
    }
  };

  const [pendingTasks, setPendingTasks] = useState([]);

  const [coalSources, setCoalSources] = useState(["SECL", "WCL", "S A"]);
  const [showCustomSource, setShowCustomSource] = useState(false);
  const [customSource, setCustomSource] = useState("");

  const [pelletSuppliers, setPelletSuppliers] = useState(["KONSARI PELLET"]);
  const [showCustomPelletSupplier, setShowCustomPelletSupplier] = useState(false);
  const [customPelletSupplier, setCustomPelletSupplier] = useState("");

  const [ironOreSuppliers, setIronOreSuppliers] = useState(["SURJAGARH MINES"]);
  const [showCustomIronOreSupplier, setShowCustomIronOreSupplier] = useState(false);
  const [customIronOreSupplier, setCustomIronOreSupplier] = useState("");

  const [dolomiteSources, setDolomiteSources] = useState(["ESHAN MIN.", "ROOBLE", "JAGDAMBA MIN"]);
  const [showCustomDolomiteSource, setShowCustomDolomiteSource] = useState(false);
  const [customDolomiteSource, setCustomDolomiteSource] = useState("");

  const [dispatchMaterials, setDispatchMaterials] = useState(["SI PELLETS"]);
  const [showCustomDispatchMaterial, setShowCustomDispatchMaterial] = useState(false);
  const [customDispatchMaterial, setCustomDispatchMaterial] = useState("");

  const [dispatchParties, setDispatchParties] = useState(["BHAGYALAKSMI", "KALIKA"]);
  const [showCustomDispatchParty, setShowCustomDispatchParty] = useState(false);
  const [customDispatchParty, setCustomDispatchParty] = useState("");

  const [dispatchDestinations, setDispatchDestinations] = useState(["JALNA", "Bhiwandi"]);
  const [showCustomDispatchDestination, setShowCustomDispatchDestination] = useState(false);
  const [customDispatchDestination, setCustomDispatchDestination] = useState("");

  // --- Function to fetch items awaiting approval ---
  const fetchPendingData = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/production/get-pending`,
      );
      const data = await res.json();
      setPendingTasks(data);
    } catch (err) {
      console.error("Failed to load pending tasks");
    }
  };

  const [pendingData, setPendingData] = useState({
    coal: [],
    pellets: [],
    ironOre: [],
    dolomite: [],
    production: [],
    byProductDolochar: [],
    dispatch: [],
    stockCoal: [],
    stockIronOre: [],
    stockDolomite: [],
    stockCharcoal: [],
  });
  const [bulkActionKey, setBulkActionKey] = useState("");
  const [selectedPendingRows, setSelectedPendingRows] = useState({});

  const pendingLabelMap = {
    coal: "Raw Material Coal",
    pellets: "Raw Material Pellets",
    ironOre: "Raw Material Iron Ore",
    dolomite: "Raw Material Dolomite",
    production: "Production",
    byProductDolochar: "By Product Dolochar",
    dispatch: "Dispatch",
    stockCoal: "Stock House Coal",
    stockIronOre: "Stock House Iron Ore",
    stockDolomite: "Stock House Dolomite",
    stockCharcoal: "Stock House Charcoal",
  };

  const editFieldSchemaByModule = {
    coal: [
      "coalId",
      "monthName",
      "entryDate",
      "source",
      "party",
      "category",
      "transporter",
      "qtymt",
      "truckNo",
      "minus3mm",
      "minus4mm",
      "minus6mm",
      "minus1mm",
      "stones",
      "cshale",
      "sulphurPct",
      "im",
      "tm",
      "vm",
      "ash",
      "fcadb",
      "fcdb",
      "gcvarb",
      "gcvadb",
      "remarks",
      "status",
    ],
    pellets: [
      "pelletId",
      "monthName",
      "entryDate",
      "supplier",
      "qtyMT",
      "p30mm",
      "p25mm",
      "p22mm",
      "p20mm",
      "p18mm",
      "p15mm",
      "p12mm",
      "p10mm",
      "p8mm",
      "p5mm",
      "p3mm",
      "m3mm",
      "oversize",
      "undersize",
      "mps",
      "latbd",
      "unshapePct",
      "unfiredPct",
      "tiPct",
      "aiPct",
      "feTPct",
      "loiPct",
      "sio2Pct",
      "al2o3Pct",
      "pPct",
      "remarks",
      "status",
    ],
    ironOre: [
      "ironOreId",
      "monthName",
      "entryDate",
      "sampleNo",
      "supplierSource",
      "qty",
      "truckNo",
      "moisturePct",
      "plus30",
      "plus25",
      "plus22",
      "plus20",
      "plus18",
      "plus15",
      "plus12",
      "plus10",
      "plus8",
      "plus5",
      "plus3",
      "plus1",
      "minus1",
      "oversize",
      "undersize",
      "mps",
      "laterite",
      "blueDust",
      "shaleStone",
      "tiPct",
      "alPct",
      "feTPct",
      "loiPct",
      "sio2Pct",
      "al2o3Pct",
      "pPct",
      "remarks",
      "status",
    ],
    dolomite: [
      "dolomiteId",
      "monthName",
      "entryDate",
      "source",
      "size",
      "qty",
      "truckNo",
      "moisturePct",
      "plus8mm",
      "plus6mm",
      "plus2mm",
      "plus1mm",
      "minus1mm",
      "caoPct",
      "mgoPct",
      "silicaPct",
      "loiPct",
      "remarks",
      "status",
    ],
    production: [
      "productionCode",
      "source",
      "area",
      "item",
      "shift",
      "feM",
      "sulphur",
      "carbon",
      "nMag",
      "overSize",
      "underSize",
      "magInChar",
      "feMInChar",
      "binNo",
      "grade",
      "remarks",
      "status",
      "entryDate",
    ],
    byProductDolochar: [
      "id",
      "productionCode",
      "material",
      "fc",
      "minus1mm",
      "status",
      "entryDate",
    ],
    dispatch: [
      "id",
      "slNo",
      "month",
      "entryDate",
      "material",
      "truckNo",
      "partyName",
      "destination",
      "materialSize",
      "qty",
      "feM",
      "minus3mm",
      "dispatchOfficer",
      "remarks",
      "status",
      "createdDate",
    ],
    stockCoal: [
      "id",
      "MM25",
      "MM22",
      "MM20",
      "MM18",
      "MM15",
      "MM12",
      "MM10",
      "MM8",
      "MM6",
      "MM5",
      "MM3",
      "MM1",
      "Minus1mm",
      "TM",
      "VM",
      "ASH",
      "FC",
      "MPS",
      "remarks",
      "status",
      "entryDate",
    ],
    stockIronOre: [
      "id",
      "TM",
      "FET",
      "LOI",
      "Plus18mm",
      "Minus8mm",
      "MPS",
      "remarks",
      "status",
      "entryDate",
    ],
    stockDolomite: [
      "id",
      "TM",
      "Plus6mm",
      "Minus1mm",
      "MPS",
      "remarks",
      "status",
      "entryDate",
    ],
    stockCharcoal: [
      "id",
      "FC",
      "Minus1mm",
      "remarks",
      "status",
      "entryDate",
    ],
  };

  const getEditFieldSchema = (moduleName, item) => {
    const schema = editFieldSchemaByModule[moduleName] ?? [];
    const dynamicKeys = Object.keys(item || {}).filter((k) => k !== "module");
    const merged = [...schema];
    dynamicKeys.forEach((k) => {
      if (!merged.includes(k)) merged.push(k);
    });
    return merged;
  };

  const formatEditLabel = (key) => {
    return key
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/_/g, " ")
      .trim()
      .toUpperCase();
  };

  const getPendingDetails = (item, moduleKey) => {
    const firstNonEmpty = (vals) =>
      vals.find((v) => v !== undefined && v !== null && v !== "");
    const pick = (keys) => firstNonEmpty(keys.map((k) => item?.[k]));

    if (moduleKey === "production") {
      return pick(["source", "area", "item", "shift"]) ?? "N/A";
    }

    if (moduleKey === "byProductDolochar") {
      return pick(["material", "fc", "minus1mm", "productionCode"]) ?? "N/A";
    }

    if (moduleKey === "dispatch") {
      return pick(["material", "destination", "truckNo"]) ?? "N/A";
    }

    if (
      moduleKey === "stockCoal" ||
      moduleKey === "stockIronOre" ||
      moduleKey === "stockDolomite" ||
      moduleKey === "stockCharcoal"
    ) {
      return (
        pick([
          "kiln",
          "belt",
          "TM",
          "tm",
          "FET",
          "fet",
          "LOI",
          "loi",
          "Plus18mm",
          "plus18mm",
          "Minus8mm",
          "minus8mm",
          "MPS",
          "mps",
          "Plus6mm",
          "plus6mm",
          "Minus1mm",
          "minus1mm",
          "FC",
          "fc",
        ]) ?? "N/A"
      );
    }

    return pick(["materialType", "source", "party", "category"]) ?? "N/A";
  };

  const loggedUser = localStorage.getItem("userId");
  const loggedRole = localStorage.getItem("userRole");

  const normalizePendingData = (data) => {
    const base = {
      coal: [],
      pellets: [],
      ironOre: [],
      dolomite: [],
      production: [],
      byProductDolochar: [],
      dispatch: [],
      stockCoal: [],
      stockIronOre: [],
      stockDolomite: [],
      stockCharcoal: [],
    };

    const safe = { ...base, ...(data || {}) };
    Object.keys(base).forEach((k) => {
      if (!Array.isArray(safe[k])) safe[k] = [];
    });
    return safe;
  };

  const fetchAllPending = async () => {
    const res = await fetch(
      `${API_BASE_URL}/api/production/get-all-pending`,
    );
    const data = await res.json();
    setPendingData(normalizePendingData(data));
    setSelectedPendingRows({});
  };

  const getPendingItemId = (item) =>
    item.coalId ||
    item.pelletId ||
    item.ironOreId ||
    item.dolomiteId ||
    item.productionCode ||
    item.dispatchCode ||
    item.id;

  // Function to handle the Approval/Rejection click
  const handleStatusUpdate = async (id, module, newStatus) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/production/update-status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Id: id.toString(), // Convert to string for the API DTO
            Module: module,
            NewStatus: newStatus,
          }),
        },
      );

      if (response.ok) {
        setSuccessMsg(`Record ${newStatus} successfully!`);
        fetchAllPending(); // Refresh the list after action
      }
    } catch (error) {
      setErrorMsg("Error updating status");
    }
  };

  const togglePendingRowSelection = (moduleKey, itemId) => {
    setSelectedPendingRows((prev) => {
      const current = prev[moduleKey] || [];
      const next = current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId];

      return {
        ...prev,
        [moduleKey]: next,
      };
    });
  };

  const toggleSelectAllPendingRows = (moduleKey, tasks) => {
    const taskIds = tasks.map((item) => String(getPendingItemId(item)));
    setSelectedPendingRows((prev) => {
      const current = prev[moduleKey] || [];
      const allSelected =
        taskIds.length > 0 && taskIds.every((id) => current.includes(id));

      return {
        ...prev,
        [moduleKey]: allSelected ? [] : taskIds,
      };
    });
  };

  const handleBulkStatusUpdate = async (moduleKey, selectedIds, newStatus) => {
    const actionKey = `${moduleKey}:${newStatus}`;
    setBulkActionKey(actionKey);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const results = await Promise.all(
        selectedIds.map((itemId) =>
          fetch(`${API_BASE_URL}/api/production/update-status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              Id: String(itemId),
              Module: moduleKey.toUpperCase(),
              NewStatus: newStatus,
            }),
          }),
        ),
      );

      if (results.every((response) => response.ok)) {
        setSuccessMsg(
          `${selectedIds.length} ${pendingLabelMap[moduleKey] ?? moduleKey} record(s) ${newStatus.toLowerCase()} successfully!`,
        );
        fetchAllPending();
      } else {
        setErrorMsg(`Failed to ${newStatus.toLowerCase()} some records.`);
      }
    } catch (error) {
      setErrorMsg(`Error performing bulk ${newStatus.toLowerCase()}.`);
    } finally {
      setBulkActionKey("");
    }
  };

  // --- Function to Approve/Reject ---
  const handleApproval = async (id, newStatus) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/production/update-status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: id, status: newStatus }),
        },
      );
      if (res.ok) {
        setSuccessMsg(`Record ${newStatus}!`);
        fetchPendingData(); // Refresh the list
      }
    } catch (err) {
      setErrorMsg("Error updating status");
    }
  };
  const handleEditClick = (item, moduleKey) => {
    setTempEditData({ ...item, module: moduleKey });
    setEditMode(true);
  };

  const [coalTransporters, setCoalTransporters] = useState(["NSL", "By Road"]);

  const [showCustomTransporter, setShowCustomTransporter] = useState(false);
  const [customTransporter, setCustomTransporter] = useState("");

  const handleQualityChange = (field, value, type) => {
    // If numeric field, parse it; otherwise, keep as text
    const val =
      type === "number" ? (value === "" ? null : parseFloat(value)) : value;

    setQualityFormData((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const fetchSapTrucksByDateRange = async (fromDate, toDate) => {
    if (!fromDate || !toDate) {
      setTruckNumbers([]);
      return;
    }

    if (fromDate > toDate) {
      setTruckNumbers([]);
      setSapLookupsError("From date cannot be later than To date.");
      return;
    }

    setSapTruckLoading(true);
    setSapLookupsError("");

    try {
      const response = await fetch(
        `${SAP_TRUCK_LOOKUPS_ENDPOINT}?fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
        },
      );

      if (!response.ok) {
        let detail = "";
        try {
          const errorBody = await response.json();
          detail = errorBody?.detail || errorBody?.message || errorBody?.title || "";
        } catch {
          detail = "";
        }
        throw new Error(
          detail
            ? `Truck lookup failed (${response.status}): ${String(detail).slice(0, 140)}`
            : `Truck lookup failed (${response.status})`,
        );
      }

      const data = await response.json();
      const trucks = Array.isArray(data?.truckNumbers) ? data.truckNumbers : [];
      setTruckNumbers(trucks);
      if (trucks.length === 0) {
        setSapLookupsError("No data available for the selected date range");
      }
    } catch (error) {
      setTruckNumbers([]);
      setSapLookupsError(
        error instanceof Error ? error.message : "Unable to load truck numbers.",
      );
    } finally {
      setSapTruckLoading(false);
    }
  };

  const handleSapFromDateChange = async (selectedFromDate) => {
    setTruckNumbers([]);
    setSapLookupsError("");

    const nextToDate = qualityFormData?.entryDate || "";

    setQualityFormData((prev) => ({
      ...clearSapDependentFields(prev),
      fromDate: selectedFromDate,
      entryDate: nextToDate,
      monthName: getMonthNameFromEntryDate(nextToDate) || prev.monthName,
    }));

    if (!selectedFromDate || !nextToDate) {
      return;
    }

    await fetchSapTrucksByDateRange(selectedFromDate, nextToDate);
  };

  const handleSapDateChange = async (selectedDate) => {
    setTruckNumbers([]);
    setSapLookupsError("");

    const nextFromDate = qualityFormData?.fromDate || "";

    setQualityFormData((prev) => ({
      ...clearSapDependentFields(prev),
      fromDate: nextFromDate,
      entryDate: selectedDate,
      monthName: getMonthNameFromEntryDate(selectedDate) || prev.monthName,
    }));

    if (!nextFromDate || !selectedDate) {
      return;
    }

    await fetchSapTrucksByDateRange(nextFromDate, selectedDate);
  };

  const handleSapTruckSelection = async (selectedTruckNo) => {
    const selectedFromDate = qualityFormData?.fromDate || "";
    const selectedDate = qualityFormData?.entryDate || "";

    setQualityFormData((prev) => ({
      ...clearSapDependentFields(prev),
      fromDate: selectedFromDate,
      entryDate: selectedDate,
      monthName: getMonthNameFromEntryDate(selectedDate) || prev.monthName,
      truckNo: selectedTruckNo,
    }));

    if (!selectedFromDate || !selectedDate || !selectedTruckNo) {
      return;
    }

    setSapRecordLoading(true);
    setSapLookupsError("");

    try {
      const response = await fetch(
        `${SAP_RECORD_LOOKUP_ENDPOINT}?fromDate=${encodeURIComponent(selectedFromDate)}&toDate=${encodeURIComponent(selectedDate)}&truckNo=${encodeURIComponent(selectedTruckNo)}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
        },
      );

      if (!response.ok) {
        let detail = "";
        try {
          const errorBody = await response.json();
          detail = errorBody?.detail || errorBody?.message || errorBody?.title || "";
        } catch {
          detail = "";
        }
        throw new Error(
          detail
            ? `Record lookup failed (${response.status}): ${String(detail).slice(0, 140)}`
            : `Record lookup failed (${response.status})`,
        );
      }

        const data = await response.json();
        if (!data?.found) {
          const detail =
            data?.errors && typeof data.errors === "object"
              ? Object.values(data.errors).filter(Boolean).join(" | ")
              : "";
          setSapLookupsError(detail || "No SAP record found for selected truck");
          return;
        }

      setQualityFormData((prev) =>
        applySapRecordToForm(
          {
            ...prev,
            fromDate: selectedFromDate,
            entryDate: selectedDate,
            monthName: getMonthNameFromEntryDate(selectedDate) || prev.monthName,
          },
          data,
        ),
      );
    } catch (error) {
      setSapLookupsError(
        error instanceof Error ? error.message : "Unable to load SAP record details.",
      );
    } finally {
      setSapRecordLoading(false);
    }
  };

  const handleRawMaterialImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const endpointByMaterial = {
      COAL: "upload-coal-image",
      PELLETS: "upload-pellets-image",
      IRON_ORE: "upload-ironore-image",
      DOLOMITE: "upload-dolomite-image",
    };
    const endpoint = endpointByMaterial[selectedMaterial];
    if (!endpoint) return;

    try {
      setIsCoalImageUploading(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const uploadUserQuery = userId ? `?userId=${encodeURIComponent(userId)}` : "";
      const res = await fetch(
        `${API_BASE_URL}/api/production/${endpoint}${uploadUserQuery}`,
        {
          method: "POST",
          headers: {
            ...(userId ? { "X-User-Id": userId } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        },
      );

      let data = null;
      let rawText = "";
      const responseType = res.headers.get("content-type") || "";
      if (responseType.includes("application/json")) {
        data = await res.json();
      } else {
        rawText = await res.text();
        try {
          data = rawText ? JSON.parse(rawText) : null;
        } catch {
          data = rawText || null;
        }
      }

      const uploadedPath =
        data?.path ||
        data?.imagePath ||
        data?.filePath ||
        data?.url ||
        data?.imageUrl ||
        (typeof data === "string" ? data : null);

      if (!res.ok || !uploadedPath) {
        const serverMessage =
          data?.message ||
          data?.error ||
          (typeof data === "string" ? data : "") ||
          rawText ||
          `HTTP ${res.status}`;
        throw new Error(serverMessage);
      }

      setQualityFormData((prev) => ({
        ...prev,
        imageUpload: uploadedPath,
      }));
    } catch (err) {
      console.error(err);
      alert(`Image upload failed: ${err?.message || "Unknown error"}`);
    } finally {
      setIsCoalImageUploading(false);
      e.target.value = "";
    }
  };

  const [fieldErrors, setFieldErrors] = useState({});

  const labelStyle = {
    fontSize: "0.85rem",
    fontWeight: "500",
    color: "var(--label-color)",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "6px",
  };
  const submitProduction = async (allowExceed = false) => {
    const toNullableNumber = (value) => {
      if (value === "" || value === null || value === undefined) return null;
      const num = Number(value);
      return Number.isNaN(num) ? null : num;
    };
    const toNullableInt = (value) => {
      if (value === "" || value === null || value === undefined) return null;
      const num = Number(value);
      return Number.isInteger(num) ? num : null;
    };
    const numericProductionId = toNullableInt(
      prodFormData.id ?? prodFormData.Id,
    );

    const payload = {
      ...prodFormData,

      // ? include generated ID
      productionCode: prodFormData.productionCode,

      source: source,
      entryDate: new Date().toISOString(),

      feM: toNullableNumber(prodFormData.feM),
      sulphur: toNullableNumber(prodFormData.sulphur),
      carbon: toNullableNumber(prodFormData.carbon),
      nMag: toNullableNumber(prodFormData.nMag),
      overSize: toNullableNumber(prodFormData.overSize),
      underSize: toNullableNumber(prodFormData.underSize),
      magInChar: toNullableNumber(prodFormData.magInChar),
      feMInChar: toNullableNumber(prodFormData.feMInChar),
      byProductMaterial:
        source === "CD" ? prodFormData.byProductMaterial || null : null,
      byProductFc:
        source === "CD" && prodFormData.byProductMaterial
          ? toNullableNumber(prodFormData.byProductFc)
          : null,
      byProductMinus1mm:
        source === "CD" && prodFormData.byProductMaterial
          ? toNullableNumber(prodFormData.byProductMinus1mm)
          : null,
    };
    delete payload.id;
    delete payload.Id;
    delete payload.ID;
    if (numericProductionId !== null) {
      payload.id = numericProductionId;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/production/save-production`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(userId ? { "X-User-Id": userId } : {}),
            ...(allowExceed ? { "X-Allow-Exceed": "true" } : {}),
          },
          body: JSON.stringify(payload),
        },
      );

      const rawText = await res.text();
      console.log("save-production response text:", rawText);
      let data = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }

      if (res.ok) {
        setSavedEntryId(data.id);
        setShowSuccessPopup(true);
        await loadGenericDrafts(getGenericDraftModuleKey());

        setProdFormData({
          area: "",
          item: "",
          shift: "",
          time: "",
          feM: "",
          sulphur: "",
          carbon: "",
          nMag: "",
          overSize: "",
          underSize: "",
          magInChar: "",
          feMInChar: "",
          byProductId: "",
          byProductMaterial: "",
          byProductFc: "",
          byProductMinus1mm: "",
          binNo: "",
          grade: "",
          status: "Pending",
          remarks: "",
        });
      } else {
        if (
          data?.message === "Exceeded limit fields" &&
          Array.isArray(data.fields)
        ) {
          const filtered = data.fields.filter((f) => {
            const key = String(f).trim().toLowerCase();
            return (
              key !== "id" &&
              key !== "productioncode" &&
              key !== "production_code"
            );
          });
          if (filtered.length === 0) {
            return;
          }
          setExceedFields(filtered);
          setExceedContext("production");
          setShowExceedConfirm(true);
          return;
        }
        console.log("Save production failed:", data ?? rawText);
        alert("Save failed ? " + (data ? JSON.stringify(data) : rawText));
      }
    } catch {
      alert("Server error");
    }
  };

  const handleProductionSubmit = () => {
    const productionValidationErrors = getProductionValidationErrors();
    const hasProductionValidationErrors =
      Object.keys(productionValidationErrors).length > 0;

    if (hasProductionValidationErrors) {
      setProductionFieldErrors((prev) => ({
        ...prev,
        ...Object.fromEntries(
          productionValidationKeys.map((fieldName) => [
            fieldName,
            productionValidationErrors[fieldName] || "",
          ]),
        ),
      }));
      setExceedFields(getProductionExceededFields());
      setExceedContext("production");
      setShowExceedConfirm(true);
      setErrorMsg("");
      return;
    }

    if (source === "CD" && cdEntryMode === "byProduct") {
      const exceeded = getProductionExceededFields();
      if (exceeded.length > 0) {
        setExceedFields(exceeded);
        setExceedContext("production");
        setShowExceedConfirm(true);
        return;
      }

      const payload = {
        id: prodFormData.byProductId || null,
        productionCode: prodFormData.productionCode || null,
        material: prodFormData.byProductMaterial || "Dolochar",
        fc:
          prodFormData.byProductFc === ""
            ? null
            : Number(prodFormData.byProductFc),
        minus1mm:
          prodFormData.byProductMinus1mm === ""
            ? null
            : Number(prodFormData.byProductMinus1mm),
      };

      fetch(`${API_BASE_URL}/api/production/save-byproduct-dolochar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(userId ? { "X-User-Id": userId } : {}),
        },
        body: JSON.stringify(payload),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            alert("Save failed ❌ " + JSON.stringify(data));
            return;
          }
          setSavedEntryId(data.id ?? "");
          setShowSuccessPopup(true);
          setProdFormData((prev) => ({
            ...prev,
            byProductId: "",
            byProductMaterial: "",
            byProductFc: "",
            byProductMinus1mm: "",
            status: "Pending",
          }));
          const idRes = await fetch(
            `${API_BASE_URL}/api/production/get-next-byproduct-dolochar-id`,
          );
          const nextId = await idRes.text();
          setProdFormData((prev) => ({ ...prev, byProductId: nextId }));
        })
        .catch(() => alert("Server error"));
      return;
    }

    const exceeded = getProductionExceededFields();
    if (exceeded.length > 0) {
      setExceedFields(exceeded);
      setExceedContext("production");
      setShowExceedConfirm(true);
      setErrorMsg("");
      return;
    }

    setErrorMsg("");
    submitProduction(false);
  };

  const handleMaterialChange = (e) => {
    const value = e.target.value;
    setSelectedMaterial(value);
    setFieldErrors({}); // Clear field errors when switching materials
    localStorage.setItem("selectedMaterial", value); // ✅ SAVE
  };

  const handleNumberChange = (key, value) => {
    // Prevent 'e' and 'E' characters (scientific notation)
    if (value.toLowerCase().includes('e')) {
      value = value.replace(/[eE]/g, '');
    }

    const num = Number(value);

    if (value === "") {
      setQualityFormData((prev) => ({ ...prev, [key]: "" }));
      setFieldErrors((prev) => ({ ...prev, [key]: "" }));
      // Also clear derived fields when base values are cleared
      if (key === "im" || key === "vm" || key === "ash") {
        setQualityFormData((prev) => ({ ...prev, fcadb: "", fcdb: "" }));
        setFieldErrors((prev) => ({ ...prev, fcadb: "", fcdb: "" }));
      }
      return;
    }

    if (isNaN(num)) return;

    if (num < 1 || num > 100) {
      setFieldErrors((prev) => ({ ...prev, [key]: "Exceeded Limit" }));
    } else {
      setFieldErrors((prev) => ({ ...prev, [key]: "" }));
    }

    // Update the changed numeric field and also compute derived values when possible
    setQualityFormData((prev) => {
      const next = { ...prev, [key]: num };

      const im = Number(next.im);
      const vm = Number(next.vm);
      const ash = Number(next.ash);

      // FC (ADB) = 100 - (IM + VM + ASH)
      if (!Number.isNaN(im) && !Number.isNaN(vm) && !Number.isNaN(ash)) {
        const fcadbRaw = 100 - (im + vm + ash);
        const fcadbVal = Number.isFinite(fcadbRaw) ? Number(fcadbRaw.toFixed(2)) : fcadbRaw;
        next.fcadb = fcadbVal;

        // FC (DB) = FC(ADB) * 100 / (100 - IM)
        if (100 - im !== 0) {
          const fcdbRaw = (fcadbVal * 100) / (100 - im);
          next.fcdb = Number.isFinite(fcdbRaw) ? Number(fcdbRaw.toFixed(2)) : fcdbRaw;
        } else {
          next.fcdb = "";
        }
      } else if (key !== "fcadb" && key !== "fcdb") {
        // keep previous derived values only if not directly editing them
        next.fcadb = prev.fcadb ?? "";
        next.fcdb = prev.fcdb ?? "";
      }

      return next;
    });

    // Clear derived field errors if any
    setFieldErrors((prev) => ({ ...prev, fcadb: "", fcdb: "" }));
  };

  const fadeStyle = `
@keyframes fadeSlide {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

  const submitRawMaterial = async (allowExceed = false) => {
    console.log("🔄 submitRawMaterial called with allowExceed:", allowExceed);
    
    setSuccessMsg("");
    setErrorMsg("");
    setLastSapSaveStatus(null);
    setIsSaving(true);

    if (!selectedMaterial) {
      console.error("❌ No material selected");
      setErrorMsg("Select material first");
      setIsSaving(false);
      return;
    }

    const token = localStorage.getItem("token");
    console.log("🔑 Token exists:", !!token);

    const cleanPayload = (obj) => {
      const cleaned = {};
      for (const key in obj) {
        const val = obj[key];
        if (val === "" || val === null || val === undefined) {
          cleaned[key] = null;
        } else if (typeof val === "number" && !Number.isFinite(val)) {
          cleaned[key] = null;
        } else {
          cleaned[key] = val;
        }
      }
      return cleaned;
    };

    const { idKey, entryId } = await ensureRawMaterialEntryId(selectedMaterial);
    if (!entryId) {
      setErrorMsg("Entry ID is not ready yet. Please try once more.");
      setIsSaving(false);
      return;
    }

    const { fromDate, ...rawPayload } = qualityFormData;
    const payload = cleanPayload({
      ...rawPayload,
      [idKey]: entryId,
      status: selectedMaterial === "COAL" ? "SUBMITTED" : "Pending",
      filledBy: qualityFormData?.filledBy || filledByDisplay || userId || null,
      FilledBy: qualityFormData?.FilledBy || filledByDisplay || userId || null,
    });

    // Debug: log payload + highlight out-of-range for Oracle NUMBER(5,2)
    if (selectedMaterial === "COAL") {
      const coalNumber52Fields = [
        "minus3mm",
        "minus4mm",
        "minus6mm",
        "minus1mm",
        "stones",
        "cshale",
        "sulphurPct",
        "im",
        "tm",
        "vm",
        "ash",
        "fcadb",
        "fcdb",
      ];

      const offenders = coalNumber52Fields
        .filter(
          (k) =>
            payload[k] !== null &&
            payload[k] !== undefined &&
            payload[k] !== "",
        )
        .map((k) => ({ key: k, value: Number(payload[k]) }))
        .filter(
          (x) =>
            Number.isFinite(x.value) && (x.value > 999.99 || x.value < -999.99),
        );

      console.log("save-coal payload:", payload);
      if (offenders.length > 0) {
        console.warn("ORA-01438 likely fields (NUMBER(5,2)):", offenders);
      }
    }

    // Decide endpoint based on material
    let url = "";
    if (selectedMaterial === "COAL") url = "save-coal";
    else if (selectedMaterial === "PELLETS") url = "save-pellets";
    else if (selectedMaterial === "IRON_ORE") url = "save-iron-ore";
    else if (selectedMaterial === "DOLOMITE") url = "save-dolomite";

    try {
      console.log("🚀 Sending payload to", url, ":", payload);
      
      const rawUserQuery = userId ? `?userId=${encodeURIComponent(userId)}` : "";
      const res = await fetch(`${API_BASE_URL}/api/production/${url}${rawUserQuery}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(userId ? { "X-User-Id": userId } : {}),
          Authorization: `Bearer ${token}`,
          ...(allowExceed ? { "X-Allow-Exceed": "true" } : {}),
        },
        body: JSON.stringify({
          ...payload,
          userId: payload.userId || userId || null,
          UserId: payload.UserId || userId || null,
          createdBy: payload.createdBy || userId || null,
          createdByUserId: payload.createdByUserId || userId || null,
        }),
      });

      console.log("📨 Response status:", res.status, res.statusText);

      if (!res.ok) {
        const err = await res.text();
        console.error("❌ Server error:", err);
        let detail = err;
        try {
          const parsed = JSON.parse(err);
          if (parsed?.errors && typeof parsed.errors === "object") {
            detail = Object.entries(parsed.errors)
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`)
              .join(" | ");
          } else if (parsed?.detail || parsed?.title || parsed?.message) {
            detail = parsed.detail || parsed.title || parsed.message;
          }
        } catch {
          detail = err;
        }
        setErrorMsg(`Save failed (${res.status}): ${String(detail).substring(0, 220)}`);
        return;
      }

      const result = await res.json();
      console.log("✅ Response:", result);

      // 🔹 store ID
      setSavedEntryId(result.id || result.coalId || result.pelletId || result.ironOreId || result.dolomiteId);
      if (result?.sapAttempted) {
        const sapMessages =
          result?.sapResponse?.sapMessagesReadable ||
          result?.sapResponse?.sap_messages_readable ||
          [];
        const sapMessage = result?.sapMessage || "";
        const sapLockDetails = parseSapLockDetails(sapMessages, sapMessage);

        setLastSapSaveStatus({
          sapUpdated: Boolean(result?.sapUpdated),
          sapMessage,
          sapResponse: result?.sapResponse || null,
          sapMessages,
          ...sapLockDetails,
        });
      } else {
        setLastSapSaveStatus(null);
      }

      // 🔹 open popup
      setShowSuccessPopup(true);

      // optional: clear inline message if you want
      setSaveMessage("");
      setErrorMsg("");

      // Clear all field errors
      setFieldErrors({});

      if (selectedMaterial === "COAL") {
        await loadCoalDrafts();
      } else {
        await loadGenericDrafts(getGenericDraftModuleKey());
      }

      // Reset to a fresh new entry after successful save
      await startNewRawMaterialEntry(selectedMaterial);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setErrorMsg(`Network Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = () => {
    const exceeded = Object.keys(fieldErrors).filter((k) => fieldErrors[k]);

    console.log("🔍 Field errors check:", exceeded, "Full errors:", fieldErrors);

    if (exceeded.length > 0) {
      console.warn("⚠️ Fields with validation errors:", exceeded);
      setExceedFields(exceeded);
      setExceedContext("raw");
      setShowExceedConfirm(true);
      return;
    }

    console.log("✅ No validation errors, calling submitRawMaterial()");
    submitRawMaterial(false);
  };

  const handleManualCoalDraftSave = async () => {
    await saveCurrentCoalDraft({
      reason: "manual",
      silent: false,
      force: true,
      resetAfterSave: true,
    });
  };

  const [coalCategories, setCoalCategories] = useState(["G 8", "RB-1", "G11"]);

  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [savedEntryId, setSavedEntryId] = useState("");
  const [lastSapSaveStatus, setLastSapSaveStatus] = useState(null);
  const [coalDrafts, setCoalDrafts] = useState([]);
  const [coalDraftsLoading, setCoalDraftsLoading] = useState(false);
  const [moduleDrafts, setModuleDrafts] = useState([]);
  const [moduleDraftsLoading, setModuleDraftsLoading] = useState(false);
  const [moduleDraftStatus, setModuleDraftStatus] = useState({
    tone: "idle",
    message: "Drafts auto-save on navigation, refresh, and every 30 seconds.",
    entryId: "",
    lastSavedAt: "",
  });
  const [rawDraftStatus, setRawDraftStatus] = useState({
    tone: "idle",
    message: "Drafts auto-save on navigation, refresh, and every 30 seconds.",
    entryId: "",
    lastSavedAt: "",
  });
  const [isDirty, setIsDirty] = useState(false);
  const rawEntryModeRef = useRef("new");
  const rawDirtyRef = useRef(false);
  const rawBaselineRef = useRef("");
  const [showExceedConfirm, setShowExceedConfirm] = useState(false);
  const [exceedFields, setExceedFields] = useState([]);
  const [exceedContext, setExceedContext] = useState("");
  const [stockFieldErrors, setStockFieldErrors] = useState({});
  const [productionFieldErrors, setProductionFieldErrors] = useState({});
  const [dispatchFieldErrors, setDispatchFieldErrors] = useState({});

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  };
  const headerStyle = {
    backgroundColor: "var(--accent-dark)",
    color: "white",
    textAlign: "left",
  };
  const rowStyle = { borderBottom: "1px solid #ddd" };
  const approveBtn = {
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    padding: "8px 15px",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "5px",
  };
  const rejectBtn = {
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    padding: "8px 15px",
    borderRadius: "4px",
    cursor: "pointer",
  };

  const handleProdInputChange = (name, value) => {
    const parseGrade = (feMValue) => {
      const num = Number(feMValue);
      if (
        feMValue === "" ||
        feMValue === null ||
        feMValue === undefined ||
        Number.isNaN(num)
      )
        return "";
      if (num >= 80) return "A";
      if (num >= 78) return "B";
      if (num >= 76) return "C";
      return "D";
    };

    setProdFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "feM" ? { grade: parseGrade(value) } : {}),
    }));

    const numericFields = [
      "feM",
      "sulphur",
      "carbon",
      "nMag",
      "overSize",
      "underSize",
      "magInChar",
      "feMInChar",
      "byProductFc",
      "byProductMinus1mm",
    ];

    if (!numericFields.includes(name)) return;

    if (value === "" || value === null || value === undefined) {
      setProductionFieldErrors((prev) => ({ ...prev, [name]: "" }));
      return;
    }
    const validationMessage = validateProductionField(name, value);
    setProductionFieldErrors((prev) => ({
      ...prev,
      [name]: validationMessage,
    }));
  };

  useEffect(() => {
    setProductionFieldErrors((prev) => ({
      ...prev,
      ...Object.fromEntries(
        productionValidationKeys.map((fieldName) => [
          fieldName,
          validateProductionField(fieldName, prodFormData?.[fieldName], source),
        ]),
      ),
    }));
  }, [prodFormData.feM, prodFormData.sulphur, prodFormData.carbon, prodFormData.nMag, source]);

  const submitDispatch = async (allowExceed = false) => {
    const dispatchId =
      dispatchFormData.dispatchCode || dispatchFormData.id || null;
    const payload = {
      id: dispatchId,
      Id: dispatchId,
      dispatchCode: dispatchId,
      month: dispatchFormData.month || null,
      entryDate: dispatchFormData.entryDate || new Date().toISOString(),
      material: dispatchFormData.material || null,
      truckNo: dispatchFormData.truckNo || null,
      partyName: dispatchFormData.partyName || null,
      destination: dispatchFormData.destination || null,
      materialSize: dispatchFormData.materialSize || null,
      dispatchOfficer: dispatchFormData.dispatchOfficer || null,
      remarks: dispatchFormData.remarks || null,
      status: dispatchFormData.status || "Pending",

      qty: dispatchFormData.qty === "" ? null : Number(dispatchFormData.qty),
      feM: dispatchFormData.feM === "" ? null : Number(dispatchFormData.feM),
      minus3mm:
        dispatchFormData.minus3mm === ""
          ? null
          : Number(dispatchFormData.minus3mm),
    };

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/production/save-dispatch`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(userId ? { "X-User-Id": userId } : {}),
            ...(allowExceed ? { "X-Allow-Exceed": "true" } : {}),
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json(); // ✅ NOT text()

      console.log("SERVER RESPONSE:", data);

      if (res.ok) {
        // ✅ show popup like other modules
        setSavedEntryId(data.id);
        setShowSuccessPopup(true);
        await loadGenericDrafts(getGenericDraftModuleKey());

        // ✅ update ID field
        setDispatchFormData((prev) => ({
          ...prev,
          dispatchCode: data.id,
        }));
      } else {
        console.error("❌ Dispatch save failed:", res.status, data);
        alert("❌ Save failed (" + res.status + "): " + JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
      alert("Server not reachable");
    }
  };

  const handleDispatchSubmit = () => {
    const exceeded = getDispatchExceededFields();
    if (exceeded.length > 0) {
      setExceedFields(exceeded);
      setExceedContext("dispatch");
      setShowExceedConfirm(true);
      return;
    }

    submitDispatch(false);
  };

  const monthOptions = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    const savedMaterial = localStorage.getItem("selectedMaterial");
    if (savedMaterial) {
      startNewRawMaterialEntry(savedMaterial);
    }
  }, []);

  useEffect(() => {
    activeModuleRef.current = activeModule;
  }, [activeModule]);

  useEffect(() => {
    selectedMaterialRef.current = selectedMaterial;
  }, [selectedMaterial]);

  useEffect(() => {
    stockMaterialRef.current = stockMaterial;
  }, [stockMaterial]);

  useEffect(() => {
    sourceRef.current = source;
  }, [source]);

  useEffect(() => {
    qualityFormDataRef.current = qualityFormData;
  }, [qualityFormData]);

  useEffect(() => {
    stockFormDataRef.current = stockFormData;
  }, [stockFormData]);

  useEffect(() => {
    prodFormDataRef.current = prodFormData;
  }, [prodFormData]);

  useEffect(() => {
    dispatchFormDataRef.current = dispatchFormData;
  }, [dispatchFormData]);

  useEffect(() => {
    if (activeModule !== "quality" || !selectedMaterial) return;
    if (rawEntryModeRef.current !== "new") {
      rawDirtyRef.current = false;
      setIsDirty(false);
      return;
    }

    const nextDirty = isRawEntryDirtyNow(selectedMaterial, qualityFormData);
    rawDirtyRef.current = nextDirty;
    setIsDirty(nextDirty);
  }, [activeModule, selectedMaterial, qualityFormData]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveActiveDraft({
        reason: "unload",
        keepalive: true,
        silent: true,
        force: true,
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "hidden") return;
      handleBeforeUnload();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (activeModule !== "quality" || selectedMaterial !== "COAL") return undefined;

    const intervalId = window.setInterval(() => {
      saveActiveDraft({
        reason: "interval",
        silent: true,
      });
    }, RAW_COAL_AUTO_SAVE_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [activeModule, selectedMaterial]);

  useEffect(() => {
    const moduleKey = getGenericDraftModuleKey();
    if (!moduleKey || moduleKey === "COAL") {
      setModuleDrafts([]);
      return;
    }

    loadGenericDrafts(moduleKey);
  }, [activeModule, selectedMaterial, stockMaterial, source]);

  useEffect(() => {
    if (!stockMaterial) return;

    fetch(
      `${API_BASE_URL}/api/production/get-next-stock-id?material=${stockMaterial}`,
    )
      .then((r) => r.text())
      .then((id) => {
        console.log("Stock ID fetched:", id);
        setStockFormData((prev) => ({ ...prev, id, status: "Pending" }));
      })
      .catch((err) => {
        console.error("Error fetching stock ID:", err);
      });
  }, [stockMaterial]);
  useEffect(() => {
    if (activeModule !== "dispatch") return;

    const today = new Date();
    const monthStr = today.toLocaleString("en-US", { month: "long" });
    const dateStr = today.toISOString().split("T")[0];

    fetch(`${API_BASE_URL}/api/production/get-next-dispatch-id`)
      .then((r) => r.text())
      .then((id) => {
        setDispatchFormData((prev) => ({
          ...prev,
          dispatchCode: id,
          month: monthStr,
          entryDate: dateStr,
          status: "Pending",
        }));
      });
  }, [activeModule]);

  const handleUpdateSave = async () => {
    const idValue =
      tempEditData.coalId ||
      tempEditData.pelletId ||
      tempEditData.ironOreId ||
      tempEditData.dolomiteId ||
      tempEditData.productionCode ||
      tempEditData.dispatchCode ||
      tempEditData.id;
    const moduleName = tempEditData.module || "";

    if (!idValue || !moduleName) {
      setErrorMsg("Invalid record. Missing ID or module.");
      return;
    }

    const fields = Object.fromEntries(
      Object.entries(tempEditData).filter(
        ([key]) => key.toLowerCase() !== "module",
      ),
    );

    const payload = {
      id: idValue.toString(),
      module: moduleName,
      fields,
    };

    console.log("Sending Updated Data:", payload);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/production/edit-entry`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (res.ok) {
        setSuccessMsg("Data Updated Successfully!");
        setEditMode(false);
        fetchAllPending();
      } else {
        const errorText = await res.text();
        setErrorMsg("Update Failed: " + (errorText || "Server error"));
      }
    } catch (err) {
      console.error("Update Error:", err);
      setErrorMsg("Server Error: Check if your Backend API is running.");
    }
  };

  const prepareNavigationChange = async () => {
    await saveActiveDraft({
      reason: "navigation",
      silent: true,
    });
    return false;
  };

  const handleModuleNavigation = async (nextModule, nextSource = null) => {
    await prepareNavigationChange();
    setActiveModule(nextModule);
    if (nextSource !== null) {
      setSource(nextSource);
    }
  };

  const handleRawMaterialSelection = async (material) => {
    await prepareNavigationChange();
    await startNewRawMaterialEntry(material);
  };

  const handleRouteNavigation = async (path, options = undefined) => {
    await prepareNavigationChange();
    navigate(path, options);
  };

  const handleLogout = async () => {
    await prepareNavigationChange();
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");

    navigate("/", { replace: true });
  };

  const handleDispatchChange = (name, value) => {
    // Prevent 'e' and 'E' characters (scientific notation) for numeric fields
    const numericFields = ["qty", "feM", "minus3mm"];
    if (numericFields.includes(name) && value.toLowerCase().includes('e')) {
      value = value.replace(/[eE]/g, '');
    }

    setDispatchFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (!numericFields.includes(name)) return;

    const num = Number(value);
    if (value === "" || value === null || value === undefined) {
      setDispatchFieldErrors((prev) => ({ ...prev, [name]: "" }));
      return;
    }
    if (Number.isNaN(num)) return;

    if (num < 1 || num > 100) {
      setDispatchFieldErrors((prev) => ({ ...prev, [name]: "Exceeded Limit" }));
    } else {
      setDispatchFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // --- 4. Styles ---
  const navButtonStyle = (isActive) => ({
    padding: "12px 24px",
    cursor: "pointer",
    borderRadius: "12px",
    border: "none",
    backgroundColor: isActive ? "var(--accent-dark)" : "#fff",
    color: isActive ? "#fff" : "var(--accent-dark)",
    fontWeight: "bold",
    marginRight: "10px",
  });

  const inputStyle = {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff",
    color: "var(--input-text-color)",
    outline: "none",
    fontSize: "14px",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06)",
  };

  const menuItemStyle = {
    padding: "12px 10px",
    cursor: "pointer",
    borderBottom: "1px solid rgba(255,255,255,0.2)",
    fontWeight: "600",
  };

  const frozenInputStyle = {
    ...inputStyle,
    backgroundColor: "#f1f5f9",
    color: "var(--input-muted-color)",
    cursor: "not-allowed",
    fontWeight: "600",
  };

  const cardTile = {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "16px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    border: "1px solid #e2e8f0",
  };

  const tileLabel = {
    color: "#64748b",
    fontWeight: "700",
    fontSize: "12px",
    textTransform: "uppercase",
  };

  const tileValue = {
    color: "var(--accent-dark)",
    fontSize: "26px",
    fontWeight: "800",
    marginTop: "8px",
  };

  const miniTile = {
    background: "#f8fafc",
    borderRadius: "10px",
    padding: "10px",
    border: "1px solid #e2e8f0",
  };

  const miniLabel = {
    fontSize: "11px",
    fontWeight: "700",
    color: "#64748b",
  };

  const miniValue = {
    fontSize: "18px",
    fontWeight: "800",
    color: "var(--accent-dark)",
  };

  const canOpenManagerApproval = !!effectivePermissions?.pages?.managerApproval;
  const openManagerApprovalFromDashboard = async () => {
    if (!canOpenManagerApproval) return;
    await prepareNavigationChange();
    setActiveModule("manager");
    fetchAllPending();
  };

  const renderGenericDraftPanel = () => {
    const moduleKey = getGenericDraftModuleKey();
    if (!moduleKey || (activeModule === "quality" && selectedMaterial === "COAL")) {
      return null;
    }

    return (
      <>
        <div
          style={{
            marginBottom: "15px",
            padding: "14px 16px",
            borderRadius: "10px",
            backgroundColor:
              moduleDraftStatus.tone === "error"
                ? "#fee2e2"
                : moduleDraftStatus.tone === "saved"
                  ? "#ecfdf5"
                  : "#eff6ff",
            color:
              moduleDraftStatus.tone === "error"
                ? "#991b1b"
                : moduleDraftStatus.tone === "saved"
                  ? "#166534"
                  : "#1e3a8a",
            border:
              moduleDraftStatus.tone === "error"
                ? "1px solid #fca5a5"
                : moduleDraftStatus.tone === "saved"
                  ? "1px solid #86efac"
                  : "1px solid #93c5fd",
          }}
        >
          <div style={{ fontWeight: "700", marginBottom: "4px" }}>
            Draft Status
          </div>
          <div style={{ fontWeight: "600" }}>{moduleDraftStatus.message}</div>
          {(moduleDraftStatus.entryId || moduleDraftStatus.lastSavedAt) && (
            <div style={{ marginTop: "6px", fontSize: "13px", opacity: 0.9 }}>
              {moduleDraftStatus.entryId ? `Entry ID: ${moduleDraftStatus.entryId}` : ""}
              {moduleDraftStatus.entryId && moduleDraftStatus.lastSavedAt ? " | " : ""}
              {moduleDraftStatus.lastSavedAt
                ? `Last saved: ${formatDraftStatusTime(moduleDraftStatus.lastSavedAt)}`
                : ""}
            </div>
          )}
        </div>

        <div
          style={{
            marginBottom: "18px",
            padding: "16px",
            borderRadius: "12px",
            backgroundColor: "#f8fafc",
            border: "1px solid #cbd5e1",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              marginBottom: "10px",
            }}
          >
            <div>
              <div style={{ fontWeight: "700", color: "#1a3a5a" }}>
                Draft Data
              </div>
              <div style={{ fontSize: "13px", color: "#475569" }}>
                Saved {getGenericDraftDisplayName(moduleKey).toLowerCase()} drafts stay here until final submission.
              </div>
            </div>
            <button
              type="button"
              onClick={() => loadGenericDrafts(moduleKey)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #94a3b8",
                backgroundColor: "#ffffff",
                color: "#1a3a5a",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Refresh
            </button>
          </div>

          {moduleDraftsLoading ? (
            <div style={{ color: "#475569", fontSize: "14px" }}>Loading drafts...</div>
          ) : moduleDrafts.length === 0 ? (
            <div style={{ color: "#64748b", fontSize: "14px" }}>No saved drafts yet.</div>
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {moduleDrafts.map((draft) => (
                <div
                  key={draft.draftKey || `${draft.moduleKey}-${draft.entryId}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #dbe7f3",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: "700", color: "#1a3a5a", marginBottom: "4px" }}>
                      {draft.entryId || "Draft"}
                    </div>
                    <div style={{ fontSize: "13px", color: "#475569" }}>
                      Status: {draft.status || "DRAFT"}
                    </div>
                    <div style={{ fontSize: "13px", color: "#475569" }}>
                      Last saved: {formatDraftStatusTime(draft.lastSavedAt) || "-"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openGenericDraft(draft)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "#8b0000",
                      color: "#ffffff",
                      fontWeight: "700",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Open Draft
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  return (
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://lloyds.in/wp-content/themes/lloyds-metals-new/img/lloyd-metals/Ghughus-Steel-Plant.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px",
          overflowX: "hidden",
          scrollbarGutter: "stable",
        }}
      >
      <style>{fadeStyle}</style>

      {/* Navigation Header */}
      {/* Top Bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "70px",
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.9), rgba(139,0,0,0.88))",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          zIndex: 1000,
          boxShadow: "0 2px 12px rgba(0,0,0,0.7)",
        }}
      >
        {/* Left: Menu + Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              fontSize: "24px",
              color: "white",
              background: "none",
              border: "1px solid hsla(0, 0%, 100%, 0.40)",
              borderRadius: "8px",
              padding: "4px 10px",
              cursor: "pointer",
            }}
          >
            ☰
          </button>

          <img
            src="https://lloyds.in/wp-content/themes/lloyds-metals-new/img/lloyds-metals-logo.svg"
            alt="Logo"
            style={{ height: "34px" }}
          />
        </div>

        {/* Center: Title */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            color: "white",
            fontSize: "22px",
            fontWeight: "800",
            letterSpacing: "1.2px",
            padding: "8px 22px",
            borderRadius: "16px",
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,0.25)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
        >
          Laboratory Information Management System
        </div>
        {/* Right: Logged User */}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "white",
            fontWeight: "600",
            background: "rgba(255,255,255,0.15)",
            padding: "6px 14px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          👤 {loggedUser}
          {loggedRole && (
            <span
              style={{
                fontSize: "12px",
                padding: "2px 8px",
                borderRadius: "10px",
                backgroundColor: "#e2e8f0",
                color: "var(--accent-dark)",
                fontWeight: "700",
              }}
            >
              {loggedRole}
            </span>
          )}
          <button
            onClick={handleLogout}
            style={{
              marginLeft: "6px",
              padding: "4px 10px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.4)",
              background: "rgba(239,68,68,0.85)",
              color: "white",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Sidebar */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: "60px",
            left: 0,
            width: "260px",
            height: "calc(100vh - 60px)",
            background:
              "linear-gradient(180deg, var(--sidebar-bg) 0%, var(--sidebar-bg-alt) 100%)",
            color: "white",
            padding: "20px",
            zIndex: 999,
            boxShadow: "4px 0 12px rgba(0,0,0,0.4)",
            borderRight: "1px solid rgba(255,255,255,0.18)",
            overflowY: "auto",
          }}
        >
          {/* SAMPLES */}
          <div
            onClick={() => setOpenSamples(!openSamples)}
            style={{
              ...menuItemStyle,
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <FaBox /> Samples
          </div>

          {openSamples && (
            <div style={{ marginLeft: "15px" }}>
              {effectivePermissions?.pages?.rawMaterial && (
                <div
                  onClick={() => {
                    handleModuleNavigation("quality");
                  }}
                  style={{
                    ...menuItemStyle,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <FaFlask />
                  Raw Material Testing
                </div>
              )}

              {effectivePermissions?.pages?.stockHouse && (
                <div
                  onClick={() => {
                    handleModuleNavigation("stockhouse");
                  }}
                  style={{
                    ...menuItemStyle,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <FaWarehouse />
                  Stock House Testing
                </div>
              )}

              {effectivePermissions?.pages?.production && (
                <>
                  <div
                    onClick={() => {
                      handleModuleNavigation("production", "CD");
                    }}
                    style={{
                      ...menuItemStyle,
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <FaSnowflake />
                    Cooler Discharge Testing
                  </div>

                  <div
                    onClick={() => {
                      handleModuleNavigation("production", "PH");
                    }}
                    style={{
                      ...menuItemStyle,
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <FaIndustry />
                    Product House Testing
                  </div>
                </>
              )}

              {effectivePermissions?.pages?.dispatch && (
                <div
                  onClick={() => {
                    handleModuleNavigation("dispatch");
                  }}
                  style={{
                    ...menuItemStyle,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <FaTruck />
                  Dispatch
                </div>
              )}
            </div>
          )}

          {/* REPORTS */}
          <div
            onClick={() => setOpenReports(!openReports)}
            style={{
              ...menuItemStyle,
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <FaChartBar /> Reports
          </div>

          {openReports && (
            <div style={{ marginLeft: "15px" }}>
              {effectivePermissions?.pages?.reports && (
                <div
                  onClick={() => {
                    handleRouteNavigation("/reports");
                  }}
                  style={menuItemStyle}
                >
                  Reports
                </div>
              )}
            </div>
          )}

          {/* APPROVAL */}
          <div
            onClick={() => setOpenApproval(!openApproval)}
            style={{
              ...menuItemStyle,
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <FaShieldAlt /> Approval
          </div>

          {openApproval && (
            <div style={{ marginLeft: "15px" }}>
              {effectivePermissions?.pages?.managerApproval && (
                <div
                  onClick={() => {
                    openManagerApprovalFromDashboard();
                  }}
                  style={menuItemStyle}
                >
                  Manager Approval
                </div>
              )}
            </div>
          )}

          {/* REGISTER */}
          {userId === "ajn@lloyds.in" && (
            <div
              onClick={() => {
                handleRouteNavigation("/register");
              }}
              style={{
                ...menuItemStyle,
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <FaUserPlus /> Register User
            </div>
          )}

          {/* LOGOUT */}
          <div
            onClick={handleLogout}
            style={{ ...menuItemStyle, color: "#ffb3b3" }}
          >
            Logout
          </div>
        </div>
      )}

      {/* Dashboard (when no module selected) */}
      {activeModule === "" && (
        <div
          style={{
            width: "100%",
            maxWidth: "1100px",
            margin: "80px auto 0",
            backgroundColor: "rgba(255, 255, 255, 0.94)",
            backdropFilter: "blur(10px)",
            borderRadius: "24px",
            padding: "30px",
            boxShadow: "0 25px 50px rgba(0,0,0,0.6)",
          }}
        >
          <h2 style={{ color: "var(--heading-color)", fontWeight: "600", marginBottom: "20px" }}>Dashboard</h2>

          {dashboardLoading && (
            <p style={{ color: "#475569", fontWeight: "600" }}>
              Loading summary...
            </p>
          )}

          {!dashboardLoading && dashboard && (
            <>
              {(() => {
                const gradeData = [
                  {
                    label: "Grade A",
                    key: "A",
                    color: "#16a34a",
                    value: gradeChart.A || 0,
                  },
                  {
                    label: "Grade B",
                    key: "B",
                    color: "var(--accent)",
                    value: gradeChart.B || 0,
                  },
                  {
                    label: "Grade C",
                    key: "C",
                    color: "#f59e0b",
                    value: gradeChart.C || 0,
                  },
                  {
                    label: "Grade D",
                    key: "D",
                    color: "#dc2626",
                    value: gradeChart.D || 0,
                  },
                ];
                const total = gradeData.reduce(
                  (sum, item) => sum + item.value,
                  0,
                );
                const cx = 140;
                const cy = 140;
                const r = 112;
                let startAngle = -90;

                const polar = (angleDeg) => {
                  const angle = (Math.PI / 180) * angleDeg;
                  return {
                    x: cx + r * Math.cos(angle),
                    y: cy + r * Math.sin(angle),
                  };
                };

                return (
                  <div
                    style={{
                      ...cardTile,
                      marginTop: "16px",
                      padding: "20px 18px",
                    }}
                  >
                    <h3 style={{ color: "var(--heading-color)", fontWeight: "600", margin: "0 0 12px" }}>
                      Grade Distribution (Cooler Discharge + Product House)
                    </h3>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <div
                        style={{
                          position: "relative",
                          width: 280,
                          height: 280,
                        }}
                      >
                        <svg
                          width="280"
                          height="280"
                          viewBox="0 0 280 280"
                          style={{
                            filter:
                              "drop-shadow(0 10px 18px rgba(15,23,42,0.18))",
                          }}
                        >
                          <circle cx={cx} cy={cy} r={r} fill="#e2e8f0" />
                          {gradeData.map((item) => {
                            const sliceAngle =
                              total > 0 ? (item.value / total) * 360 : 0;
                            if (sliceAngle <= 0) return null;

                            const endAngle = startAngle + sliceAngle;
                            const p1 = polar(startAngle);
                            const p2 = polar(endAngle);
                            const largeArc = sliceAngle > 180 ? 1 : 0;
                            const d = `M ${cx} ${cy} L ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArc} 1 ${p2.x} ${p2.y} Z`;
                            startAngle = endAngle;

                            return (
                              <path
                                key={item.key}
                                d={d}
                                fill={item.color}
                                stroke="#f8fafc"
                                strokeWidth="2"
                                onMouseMove={(e) => {
                                  const svgRect =
                                    e.currentTarget.ownerSVGElement.getBoundingClientRect();
                                  setGradeTooltip({
                                    x: e.clientX - svgRect.left + 14,
                                    y: e.clientY - svgRect.top + 14,
                                    text: `${item.label}: ${item.value}`,
                                  });
                                }}
                                onMouseLeave={() => setGradeTooltip(null)}
                              >
                                <title>{`${item.label}: ${item.value}`}</title>
                              </path>
                            );
                          })}
                        </svg>

                        {gradeTooltip && (
                          <div
                            style={{
                              position: "absolute",
                              left: gradeTooltip.x,
                              top: gradeTooltip.y,
                              background: "rgba(15, 23, 42, 0.92)",
                              color: "#fff",
                              padding: "7px 10px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: 700,
                              pointerEvents: "none",
                              whiteSpace: "nowrap",
                              boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                            }}
                          >
                            {gradeTooltip.text}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div style={{ marginTop: "22px" }}>
                <h3 style={{ color: "var(--heading-color)", fontWeight: "600", marginBottom: "10px" }}>
                  Manager Pending Summary (Pending/Total)
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "12px",
                  }}
                >
                  {[
                    {
                      label: "Raw Coal",
                      pending: dashboard.pending.coal,
                      total: dashboard.rawMaterial.rawCoal,
                    },
                    {
                      label: "Raw Pellets",
                      pending: dashboard.pending.pellets,
                      total: dashboard.rawMaterial.rawPellets,
                    },
                    {
                      label: "Raw Iron Ore",
                      pending: dashboard.pending.ironOre,
                      total: dashboard.rawMaterial.rawIronOre,
                    },
                    {
                      label: "Raw Dolomite",
                      pending: dashboard.pending.dolomite,
                      total: dashboard.rawMaterial.rawDolomite,
                    },
                    {
                      label: "Production",
                      pending: dashboard.pending.production,
                      total: dashboard.production.productionTotal,
                    },
                    {
                      label: "Dispatch",
                      pending: dashboard.pending.dispatch,
                      total: dashboard.dispatchTotal,
                    },
                    {
                      label: "Stock Coal",
                      pending: dashboard.pending.stockCoal,
                      total: dashboard.stockHouse.stockCoal,
                    },
                    {
                      label: "Stock Iron Ore",
                      pending: dashboard.pending.stockIronOre,
                      total: dashboard.stockHouse.stockIronOre,
                    },
                    {
                      label: "Stock Dolomite",
                      pending: dashboard.pending.stockDolomite,
                      total: dashboard.stockHouse.stockDolomite,
                    },
                    {
                      label: "Stock Charcoal",
                      pending: dashboard.pending.stockCharcoal,
                      total: dashboard.stockHouse.stockCharcoal,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        ...miniTile,
                        cursor: canOpenManagerApproval ? "pointer" : "default",
                        transition:
                          "transform 120ms ease, box-shadow 120ms ease",
                      }}
                      onClick={openManagerApprovalFromDashboard}
                      onMouseEnter={(e) => {
                        if (!canOpenManagerApproval) return;
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 18px rgba(15,23,42,0.12)";
                      }}
                      onMouseLeave={(e) => {
                        if (!canOpenManagerApproval) return;
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "";
                      }}
                      title={
                        canOpenManagerApproval ? "Open Manager Approval" : ""
                      }
                    >
                      <div style={miniLabel}>{item.label}</div>
                      <div
                        style={miniValue}
                      >{`${item.pending || 0}/${item.total || 0}`}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Main Card Container */}
      {activeModule && (
        <div
          style={{
            width: "100%",
            maxWidth: "1100px",
            margin: "80px auto 0",
            backgroundColor: "rgba(255, 255, 255, 0.94)",
            backdropFilter: "blur(10px)",
            borderRadius: "24px",
            padding: "40px",
            boxShadow: "0 25px 50px rgba(0,0,0,0.6)",
          }}
        >
          <button
            onClick={() => handleModuleNavigation("")}
            style={{
              marginBottom: "20px",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "var(--accent-dark)",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ← Back
          </button>

          {/* ----------------------- */}
          {/* QUALITY TESTING MODULE */}
          {/* ----------------------- */}
          {activeModule === "quality" && (
            <div style={{ padding: "20px" }}>
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    fontWeight: "bold",
                    color: "var(--label-color)",
                    display: "block",
                    marginBottom: "10px",
                  }}
                >
                  Select Raw Material:
                </label>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(140px, 1fr))",
                    gap: "12px",
                    maxWidth: "520px",
                  }}
                >
                  {effectivePermissions?.rawMaterialModules?.coal && (
                    <button
                      type="button"
                      onClick={() => {
                        handleRawMaterialSelection("COAL");
                      }}
                      style={{
                        padding: "14px",
                        borderRadius: "12px",
                        border:
                          selectedMaterial === "COAL"
                            ? "2px solid var(--accent-dark)"
                            : "1px solid #cbd5e1",
                        background:
                          selectedMaterial === "COAL" ? "#e0f2fe" : "#ffffff",
                        color: "var(--accent-dark)",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      Coal
                    </button>
                  )}

                  {effectivePermissions?.rawMaterialModules?.pellets && (
                    <button
                      type="button"
                      onClick={() => {
                        handleRawMaterialSelection("PELLETS");
                      }}
                      style={{
                        padding: "14px",
                        borderRadius: "12px",
                        border:
                          selectedMaterial === "PELLETS"
                            ? "2px solid var(--accent-dark)"
                            : "1px solid #cbd5e1",
                        background:
                          selectedMaterial === "PELLETS"
                            ? "#e0f2fe"
                            : "#ffffff",
                        color: "var(--accent-dark)",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      Pellets
                    </button>
                  )}

                  {effectivePermissions?.rawMaterialModules?.ironOre && (
                    <button
                      type="button"
                      onClick={() => {
                        handleRawMaterialSelection("IRON_ORE");
                      }}
                      style={{
                        padding: "14px",
                        borderRadius: "12px",
                        border:
                          selectedMaterial === "IRON_ORE"
                            ? "2px solid var(--accent-dark)"
                            : "1px solid #cbd5e1",
                        background:
                          selectedMaterial === "IRON_ORE"
                            ? "#e0f2fe"
                            : "#ffffff",
                        color: "var(--accent-dark)",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      Iron Ore
                    </button>
                  )}

                  {effectivePermissions?.rawMaterialModules?.dolomite && (
                    <button
                      type="button"
                      onClick={() => {
                        handleRawMaterialSelection("DOLOMITE");
                      }}
                      style={{
                        padding: "14px",
                        borderRadius: "12px",
                        border:
                          selectedMaterial === "DOLOMITE"
                            ? "2px solid var(--accent-dark)"
                            : "1px solid #cbd5e1",
                        background:
                          selectedMaterial === "DOLOMITE"
                            ? "#e0f2fe"
                            : "#ffffff",
                        color: "var(--accent-dark)",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      Dolomite
                    </button>
                  )}
                </div>
              </div>

              <hr style={{ borderColor: "var(--accent-dark)", opacity: 0.2 }} />

              {selectedMaterial && (
                <>
                  <h2 style={{ color: "var(--heading-color)", fontWeight: "600", marginBottom: "20px" }}>
                    {selectedMaterial} Analysis Entry
                  </h2>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: "15px",
                      marginTop: "20px",
                    }}
                  >
                    {/* --- NEW ID FIELD (FREEZED) --- */}
                    {/* --- UPDATED ENTRY ID FIELD --- */}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <label style={labelStyle}>Entry ID</label>
                      <input
                        type="text"
                        value={getCurrentRawMaterialEntryId()}
                        readOnly
                        style={{
                          ...inputStyle,
                          backgroundColor: "#e9ecef",
                          color: "var(--accent-dark)",
                          borderColor: "var(--accent-dark)",
                          cursor: "not-allowed",
                          fontWeight: "bold",
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <label style={labelStyle}>User Name</label>
                      <input
                        type="text"
                        value={filledByDisplay}
                        readOnly
                        style={{
                          ...inputStyle,
                          backgroundColor: "#e9ecef",
                          color: "var(--accent-dark)",
                          borderColor: "var(--accent-dark)",
                          cursor: "not-allowed",
                          fontWeight: "bold",
                        }}
                      />
                    </div>

                    {/* 1. Dynamic Fields (mapped from your Field Definitions) */}
                    {(selectedMaterial === "COAL"
                      ? coalFields
                      : selectedMaterial === "PELLETS"
                        ? pelletsFields
                        : selectedMaterial === "IRON_ORE"
                          ? ironOreFields
                          : selectedMaterial === "DOLOMITE"
                            ? dolomiteFields
                            : []
                    ).map((f) => {
                      const sectionTitle =
                        selectedMaterial === "COAL"
                          ? {
                            source: "Material Receipt Details",
                            minus3mm: "Sizing Analysis",
                            im: "Moisture & Proximate Analysis",
                            gcvarb: "Calorific Value Analysis",
                            remarks: "Remarks",
                          }[f.key]
                          : selectedMaterial === "PELLETS"
                            ? {
                              supplier: "Material Receipt Details",
                              p30mm: "Sizing Distribution",
                              oversize: "Physical Quality Parameters",
                              tiPct: "Chemical Analysis",
                              remarks: "Remarks",
                            }[f.key]
                            : selectedMaterial === "IRON_ORE"
                              ? {
                                sampleNo: "Material Receipt Details",
                                moisturePct: "Moisture & Sizing Analysis",
                                oversize: "Physical Quality Parameters",
                                laterite: "Gangue / Impurities",
                                tumblerIndex: "Chemical Analysis",
                                remarks: "Remarks",
                              }[f.key]
                              : selectedMaterial === "DOLOMITE"
                                ? {
                                  source: "Material Receipt Details",
                                  moisturePct: "Moisture & Sizing Analysis",
                                  caoPct: "Chemical Analysis",
                                  remarks: "Remarks",
                                }[f.key]
                                : null;

                      const labelText = f.label;
                      const labelColor = "var(--label-color)";

                      return (
                        <React.Fragment key={f.key}>
                          {sectionTitle && (
                            <div style={{ gridColumn: "1 / -1", marginTop: "8px" }}>
                              <h4
                                style={{
                                  margin: "0 0 8px 0",
                                  color: "var(--heading-color)",
                                  borderBottom: "1px solid #cbd5e1",
                                  paddingBottom: "4px",
                                  fontSize: "15px",
                                }}
                              >
                                {sectionTitle}
                              </h4>
                            </div>
                          )}
                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                        <label
                          style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            color: labelColor,
                            textTransform: "uppercase",
                            marginBottom: "4px",
                          }}
                        >
                          {labelText}
                        </label>

                        {/* COAL → Month dropdown */}
                        {(selectedMaterial === "COAL" ||
                          selectedMaterial === "PELLETS" ||
                          selectedMaterial === "IRON_ORE" ||
                          selectedMaterial === "DOLOMITE") &&
                          f.key === "fromDate" ? (
                          sapDates.length > 0 ? (
                            <select
                              value={qualityFormData?.fromDate || ""}
                              onChange={(e) => handleSapFromDateChange(e.target.value)}
                              style={{ ...inputStyle, borderColor: "var(--accent-dark)" }}
                            >
                              <option value="">-- Select Date --</option>
                              {sapDates.map((dateValue) => (
                                <option key={dateValue} value={dateValue}>
                                  {dateValue}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="date"
                              value={qualityFormData?.fromDate || ""}
                              onChange={(e) => handleSapFromDateChange(e.target.value)}
                              style={{ ...inputStyle, borderColor: "var(--accent-dark)" }}
                            />
                          )
                        ) : (selectedMaterial === "COAL" ||
                          selectedMaterial === "PELLETS" ||
                          selectedMaterial === "IRON_ORE" ||
                          selectedMaterial === "DOLOMITE") &&
                          f.key === "monthName" ? (
                          <select
                            value={qualityFormData?.monthName || ""}
                            onChange={(e) =>
                              setQualityFormData((prev) => ({
                                ...prev,
                                monthName: e.target.value,
                              }))
                            }
                            style={{ ...inputStyle, borderColor: "var(--accent-dark)" }}
                          >
                            {monthOptions.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        ) : /* COAL → Date with Calendar */
                          (selectedMaterial === "COAL" ||
                            selectedMaterial === "PELLETS" ||
                            selectedMaterial === "IRON_ORE" ||
                            selectedMaterial === "DOLOMITE") &&
                            f.key === "entryDate" ? (
                            sapDates.length > 0 ? (
                              <select
                                value={qualityFormData?.entryDate || ""}
                                onChange={(e) => handleSapDateChange(e.target.value)}
                                style={{ ...inputStyle, borderColor: "var(--accent-dark)" }}
                              >
                                <option value="">-- Select Date --</option>
                                {sapDates.map((dateValue) => (
                                  <option key={dateValue} value={dateValue}>
                                    {dateValue}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="date"
                                value={qualityFormData?.entryDate || ""}
                                onChange={(e) => handleSapDateChange(e.target.value)}
                                style={{ ...inputStyle, borderColor: "var(--accent-dark)" }}
                              />
                            )
                          ) : /* COAL → Source (Dropdown + Custom Entry) */
                            /* COAL → Source (Standard Dropdown + Add More) */
                            selectedMaterial === "COAL" && f.key === "source" ? (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "6px",
                                }}
                              >
                                <select
                                  value={qualityFormData?.source || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;

                                    if (val === "__add_new__" && isSuperAdmin) {
                                      setShowCustomSource(true);
                                    } else {
                                      setShowCustomSource(false);
                                      setQualityFormData((prev) => ({
                                        ...prev,
                                        source: val,
                                      }));
                                    }
                                  }}
                                  style={{ ...inputStyle, borderColor: "var(--accent-dark)" }}
                                >
                                  <option value="">-- Select Source --</option>
                                  {coalSources.map((src) => (
                                    <option key={src} value={src}>
                                      {src}
                                    </option>
                                  ))}
                                  {isSuperAdmin && (
                                    <option value="__add_new__">
                                      ➕ Add new...
                                    </option>
                                  )}
                                </select>

                                {isSuperAdmin && showCustomSource && (
                                  <div style={{ display: "flex", gap: "6px" }}>
                                    <input
                                      placeholder="Enter new source"
                                      value={customSource}
                                      onChange={(e) =>
                                        setCustomSource(e.target.value)
                                      }
                                      style={{ ...inputStyle, flex: 1 }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!customSource.trim()) return;

                                        setCoalSources((prev) => [
                                          ...prev,
                                          customSource,
                                        ]);
                                        setQualityFormData((prev) => ({
                                          ...prev,
                                          source: customSource,
                                        }));
                                        setCustomSource("");
                                        setShowCustomSource(false);
                                      }}
                                      style={{
                                        padding: "8px 12px",
                                        backgroundColor: "var(--accent-dark)",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                      }}
                                    >
                                      Add
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : selectedMaterial === "COAL" && f.key === "party" ? (
                                <input
                                  type="text"
                                  value={qualityFormData?.party || ""}
                                  readOnly
                                  placeholder={
                                    sapRecordLoading
                                      ? "Loading party..."
                                      : "Auto-filled from SAP"
                                  }
                                  style={frozenInputStyle}
                                />
                              ) : /* COAL → Category (Standard Dropdown + Add More) */
                                selectedMaterial === "COAL" && f.key === "category" ? (
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "6px",
                                    }}
                                  >
                                    <select
                                      value={qualityFormData?.category || ""}
                                      onChange={(e) => {
                                        const val = e.target.value;

                                        if (val === "__add_new__" && isSuperAdmin) {
                                          setShowCustomCategory(true);
                                        } else {
                                          setShowCustomCategory(false);
                                          setQualityFormData((prev) => ({
                                            ...prev,
                                            category: val,
                                          }));
                                        }
                                      }}
                                      style={{ ...inputStyle, borderColor: "var(--accent-dark)" }}
                                    >
                                      <option value="">-- Select Category --</option>
                                      {coalCategories.map((c) => (
                                        <option key={c} value={c}>
                                          {c}
                                        </option>
                                      ))}
                                      {isSuperAdmin && (
                                        <option value="__add_new__">
                                          ➕ Add new...
                                        </option>
                                      )}
                                    </select>

                                    {isSuperAdmin && showCustomCategory && (
                                      <div style={{ display: "flex", gap: "6px" }}>
                                        <input
                                          placeholder="Enter new category"
                                          value={customCategory}
                                          onChange={(e) =>
                                            setCustomCategory(e.target.value)
                                          }
                                          style={{ ...inputStyle, flex: 1 }}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (!customCategory.trim()) return;

                                            setCoalCategories((prev) => [
                                              ...prev,
                                              customCategory,
                                            ]);
                                            setQualityFormData((prev) => ({
                                              ...prev,
                                              category: customCategory,
                                            }));
                                            setCustomCategory("");
                                            setShowCustomCategory(false);
                                          }}
                                          style={{
                                            padding: "8px 12px",
                                            backgroundColor: "var(--accent-dark)",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                          }}
                                        >
                                          Add
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ) : /* COAL → Transporter (Standard Dropdown + Add More) */
                                  selectedMaterial === "COAL" &&
                                    f.key === "transporter" ? (
                                    <input
                                      type="text"
                                      value={qualityFormData?.transporter || ""}
                                      readOnly
                                      placeholder={
                                        sapRecordLoading
                                          ? "Loading transporter..."
                                          : "Auto-filled from SAP"
                                      }
                                      style={frozenInputStyle}
                                    />
                                  ) : /* PELLETS → Supplier (Dropdown + Add More) */
                                    selectedMaterial === "PELLETS" && f.key === "supplier" ? (
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: "6px",
                                        }}
                                      >
                                        <select
                                          value={qualityFormData?.supplier || ""}
                                          onChange={(e) => {
                                            const val = e.target.value;

                                            if (val === "__add_new__" && isSuperAdmin) {
                                              setShowCustomPelletSupplier(true);
                                            } else {
                                              setShowCustomPelletSupplier(false);
                                              setQualityFormData((prev) => ({
                                                ...prev,
                                                supplier: val,
                                              }));
                                            }
                                          }}
                                          style={{ ...inputStyle, borderColor: "var(--accent-dark)" }}
                                        >
                                          <option value="">-- Select Supplier --</option>
                                          {pelletSuppliers.map((supplier) => (
                                            <option key={supplier} value={supplier}>
                                              {supplier}
                                            </option>
                                          ))}
                                          {isSuperAdmin && (
                                            <option value="__add_new__">
                                              ➕ Add new...
                                            </option>
                                          )}
                                        </select>

                                        {isSuperAdmin && showCustomPelletSupplier && (
                                          <div style={{ display: "flex", gap: "6px" }}>
                                            <input
                                              placeholder="Enter new supplier"
                                              value={customPelletSupplier}
                                              onChange={(e) =>
                                                setCustomPelletSupplier(e.target.value)
                                              }
                                              style={{ ...inputStyle, flex: 1 }}
                                            />
                                            <button
                                              type="button"
                                              onClick={() => {
                                                if (!customPelletSupplier.trim()) return;

                                                setPelletSuppliers((prev) => [
                                                  ...prev,
                                                  customPelletSupplier,
                                                ]);
                                                setQualityFormData((prev) => ({
                                                  ...prev,
                                                  supplier: customPelletSupplier,
                                                }));
                                                setCustomPelletSupplier("");
                                                setShowCustomPelletSupplier(false);
                                              }}
                                              style={{
                                                padding: "8px 12px",
                                                backgroundColor: "var(--accent-dark)",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "6px",
                                                cursor: "pointer",
                                              }}
                                            >
                                              Add
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    ) : /* IRON_ORE → Supplier/Source (Dropdown + Add More) */
                                      selectedMaterial === "IRON_ORE" && f.key === "supplierSource" ? (
                                        <div
                                          style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "6px",
                                          }}
                                        >
                                          <select
                                            value={qualityFormData?.supplierSource || ""}
                                            onChange={(e) => {
                                              const val = e.target.value;

                                              if (val === "__add_new__" && isSuperAdmin) {
                                                setShowCustomIronOreSupplier(true);
                                              } else {
                                                setShowCustomIronOreSupplier(false);
                                                setQualityFormData((prev) => ({
                                                  ...prev,
                                                  supplierSource: val,
                                                }));
                                              }
                                            }}
                                            style={{ ...inputStyle, borderColor: "var(--accent-dark)" }}
                                          >
                                            <option value="">-- Select Supplier/Source --</option>
                                            {ironOreSuppliers.map((supplier) => (
                                              <option key={supplier} value={supplier}>
                                                {supplier}
                                              </option>
                                            ))}
                                            {isSuperAdmin && (
                                              <option value="__add_new__">
                                                ➕ Add new...
                                              </option>
                                            )}
                                          </select>

                                          {isSuperAdmin && showCustomIronOreSupplier && (
                                            <div style={{ display: "flex", gap: "6px" }}>
                                              <input
                                                placeholder="Enter new supplier/source"
                                                value={customIronOreSupplier}
                                                onChange={(e) =>
                                                  setCustomIronOreSupplier(e.target.value)
                                                }
                                                style={{ ...inputStyle, flex: 1 }}
                                              />
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (!customIronOreSupplier.trim()) return;

                                                  setIronOreSuppliers((prev) => [
                                                    ...prev,
                                                    customIronOreSupplier,
                                                  ]);
                                                  setQualityFormData((prev) => ({
                                                    ...prev,
                                                    supplierSource: customIronOreSupplier,
                                                  }));
                                                  setCustomIronOreSupplier("");
                                                  setShowCustomIronOreSupplier(false);
                                                }}
                                                style={{
                                                  padding: "8px 12px",
                                                  backgroundColor: "var(--accent-dark)",
                                                  color: "white",
                                                  border: "none",
                                                  borderRadius: "6px",
                                                  cursor: "pointer",
                                                }}
                                              >
                                                Add
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      ) : /* DOLOMITE → Source (Dropdown + Add More) */
                                        selectedMaterial === "DOLOMITE" && f.key === "source" ? (
                                          <div
                                            style={{
                                              display: "flex",
                                              flexDirection: "column",
                                              gap: "6px",
                                            }}
                                          >
                                            <select
                                              value={qualityFormData?.source || ""}
                                              onChange={(e) => {
                                                const val = e.target.value;

                                                if (val === "__add_new__" && isSuperAdmin) {
                                                  setShowCustomDolomiteSource(true);
                                                } else {
                                                  setShowCustomDolomiteSource(false);
                                                  setQualityFormData((prev) => ({
                                                    ...prev,
                                                    source: val,
                                                  }));
                                                }
                                              }}
                                              style={{ ...inputStyle, borderColor: "var(--accent-dark)" }}
                                            >
                                              <option value="">-- Select Source --</option>
                                              {dolomiteSources.map((source) => (
                                                <option key={source} value={source}>
                                                  {source}
                                                </option>
                                              ))}
                                              {isSuperAdmin && (
                                                <option value="__add_new__">
                                                  ➕ Add new...
                                                </option>
                                              )}
                                            </select>

                                            {isSuperAdmin && showCustomDolomiteSource && (
                                              <div style={{ display: "flex", gap: "6px" }}>
                                                <input
                                                  placeholder="Enter new source"
                                                  value={customDolomiteSource}
                                                  onChange={(e) =>
                                                    setCustomDolomiteSource(e.target.value)
                                                  }
                                                  style={{ ...inputStyle, flex: 1 }}
                                                />
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    if (!customDolomiteSource.trim()) return;

                                                    setDolomiteSources((prev) => [
                                                      ...prev,
                                                      customDolomiteSource,
                                                    ]);
                                                    setQualityFormData((prev) => ({
                                                      ...prev,
                                                      source: customDolomiteSource,
                                                    }));
                                                    setCustomDolomiteSource("");
                                                    setShowCustomDolomiteSource(false);
                                                  }}
                                                  style={{
                                                    padding: "8px 12px",
                                                    backgroundColor: "var(--accent-dark)",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  Add
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        ) : f.key === "truckNo" ? (
                                          <>
                                            <select
                                              value={qualityFormData?.[f.key] ?? ""}
                                              onChange={(e) => handleSapTruckSelection(e.target.value)}
                                              disabled={
                                                !qualityFormData?.fromDate ||
                                                !qualityFormData?.entryDate ||
                                                sapTruckLoading ||
                                                sapRecordLoading
                                              }
                                              style={{ ...inputStyle, borderColor: "var(--accent-dark)" }}
                                            >
                                              <option value="">
                                                {!qualityFormData?.fromDate || !qualityFormData?.entryDate
                                                  ? "-- Select Date Range First --"
                                                  : sapTruckLoading
                                                    ? "-- Loading Truck Numbers --"
                                                    : truckNumbers.length === 0
                                                      ? "-- No Trucks Available --"
                                                      : "-- Select Truck No --"}
                                              </option>
                                              {truckNumbers.map((truck, index) => (
                                                <option key={`${truck}-${index}`} value={truck}>
                                                  {truck}
                                                </option>
                                              ))}
                                            </select>
                                            {sapTruckLoading && (
                                              <span
                                                style={{
                                                  color: "#475569",
                                                  fontSize: "11px",
                                                }}
                                              >
                                                Fetching truck numbers for selected date range...
                                              </span>
                                            )}
                                            {sapRecordLoading && (
                                              <span
                                                style={{
                                                  color: "#475569",
                                                  fontSize: "11px",
                                                }}
                                              >
                                                Fetching SAP record details...
                                              </span>
                                            )}
                                            {!sapTruckLoading && sapLookupsError && (
                                              <span
                                                style={{
                                                  color: "#b91c1c",
                                                  fontSize: "11px",
                                                }}
                                              >
                                                {sapLookupsError}
                                              </span>
                                            )}
                                          </>
                                        ) : f.key === "materialCode" ? (
                                          <>
                                            <input
                                              type="text"
                                              value={qualityFormData?.[f.key] ?? ""}
                                              readOnly
                                              placeholder={
                                                sapRecordLoading
                                                  ? "Loading material code..."
                                                  : "Auto-filled from SAP"
                                              }
                                              style={frozenInputStyle}
                                            />
                                          </>
                                        ) : f.key === "gateNumber" ? (
                                          <>
                                            <input
                                              type="text"
                                              value={qualityFormData?.[f.key] ?? ""}
                                              readOnly
                                              placeholder={
                                                sapRecordLoading
                                                  ? "Loading gate number..."
                                                  : "Auto-filled from SAP"
                                              }
                                              style={frozenInputStyle}
                                            />
                                          </>
                                        ) : f.key === "poNumber" ? (
                                          <>
                                            <input
                                              type="text"
                                              value={qualityFormData?.[f.key] ?? ""}
                                              readOnly
                                              placeholder={
                                                sapRecordLoading
                                                  ? "Loading PO number..."
                                                  : "Auto-filled from SAP"
                                              }
                                              style={frozenInputStyle}
                                            />
                                          </>
                                        ) : ["qty", "qtyMT", "qtymt"].includes(f.key) ? (
                                          <>
                                            <input
                                              type="number"
                                              value={qualityFormData?.[f.key] ?? ""}
                                              readOnly
                                              placeholder={
                                                sapRecordLoading
                                                  ? "Loading quantity..."
                                                  : "Auto-filled from SAP"
                                              }
                                              style={frozenInputStyle}
                                            />
                                          </>
                                        ) : /* All other fields */
                                          f.type === "number" ? (
                                            <>
                                              <input
                                                type="number"
                                                value={qualityFormData?.[f.key] ?? ""}
                                                onChange={
                                                  (f.key === "fcadb" || f.key === "fcdb")
                                                    ? undefined
                                                    : (e) => handleNumberChange(f.key, e.target.value)
                                                }
                                                readOnly={f.key === "fcadb" || f.key === "fcdb"}
                                                onKeyDown={(e) => {
                                                  // Prevent 'e' and 'E' from being typed
                                                  if (e.key === 'e' || e.key === 'E') {
                                                    e.preventDefault();
                                                  }
                                                }}
                                                style={{
                                                  ...inputStyle,
                                                  borderColor: fieldErrors[f.key]
                                                    ? "red"
                                                    : "var(--accent-dark)",
                                                  /* force white background for editable numeric inputs, keep derived fields light grey */
                                                  backgroundColor: (f.key === "fcadb" || f.key === "fcdb") ? "#e9ecef" : "#ffffff",
                                                  cursor: (f.key === "fcadb" || f.key === "fcdb") ? "not-allowed" : "text",
                                                }}
                                              />
                                              {fieldErrors[f.key] && (
                                                <span style={{ color: "red", fontSize: "11px" }}>
                                                  {fieldErrors[f.key]}
                                                </span>
                                              )}
                                            </>
                                          ) : (
                                            <input
                                              type={f.type}
                                              value={qualityFormData?.[f.key] ?? ""}
                                              onChange={(e) =>
                                                handleQualityChange(f.key, e.target.value, f.type)
                                              }
                                              style={{ ...inputStyle, borderColor: "var(--accent-dark)" }}
                                            />
                                          )}
                          </div>
                        </React.Fragment>
                      );
                    })}

                    {["COAL", "PELLETS", "IRON_ORE", "DOLOMITE"].includes(selectedMaterial) && (
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <label
                          style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            color: "var(--label-color)",
                            textTransform: "uppercase",
                            marginBottom: "4px",
                          }}
                        >
                          Image Upload
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleRawMaterialImageUpload}
                          style={{ ...inputStyle, borderColor: "var(--accent-dark)", padding: "8px" }}
                        />
                        {isCoalImageUploading && (
                          <small style={{ color: "var(--accent-dark)", marginTop: "6px" }}>Uploading image...</small>
                        )}
                        {qualityFormData?.imageUpload && (
                          <small style={{ color: "#334155", marginTop: "6px", wordBreak: "break-all" }}>
                            {qualityFormData.imageUpload}
                          </small>
                        )}
                      </div>
                    )}


                    {/* 2. Status Field (Always visible, blue theme, FREEZED) */}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <label
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "var(--label-color)",
                          textTransform: "uppercase",
                          marginBottom: "4px",
                        }}
                      >
                        Status
                      </label>
                      <input
                        type="text"
                        value="Pending"
                        readOnly
                        style={{
                          ...inputStyle,
                          backgroundColor: "#e9ecef", // Light grey "Freezed" color
                          color: "#d97706",
                          fontWeight: "bold",
                          borderColor: "var(--accent-dark)",
                          cursor: "not-allowed",
                        }}
                      />
                    </div>

                    {selectedMaterial === "COAL" && (
                      <div
                        style={{
                          gridColumn: "1 / -1",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                          marginTop: "4px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setShowCoalOtherFields((prev) => !prev)
                          }
                          style={{
                            alignSelf: "flex-start",
                            padding: "8px 14px",
                            borderRadius: "8px",
                            border: "1px solid var(--accent-dark)",
                            background: "#ffffff",
                            color: "var(--accent-dark)",
                            fontWeight: "700",
                            cursor: "pointer",
                          }}
                        >
                          Other Field
                        </button>

                        {showCoalOtherFields && (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(4, 1fr)",
                              gap: "15px",
                            }}
                          >
                            <div
                              style={{ display: "flex", flexDirection: "column" }}
                            >
                              <label style={labelStyle}>XYZ</label>
                              <input
                                type="text"
                                value=""
                                readOnly
                                placeholder="XYZ"
                                style={{
                                  ...inputStyle,
                                  backgroundColor: "#f8fafc",
                                  borderColor: "var(--accent-dark)",
                                }}
                              />
                            </div>
                            <div
                              style={{ display: "flex", flexDirection: "column" }}
                            >
                              <label style={labelStyle}>ABC</label>
                              <input
                                type="text"
                                value=""
                                readOnly
                                placeholder="ABC"
                                style={{
                                  ...inputStyle,
                                  backgroundColor: "#f8fafc",
                                  borderColor: "var(--accent-dark)",
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {saveMessage && (
                    <div
                      style={{
                        marginBottom: "15px",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        backgroundColor: "#e0f2fe",
                        color: "var(--accent-dark)",
                        fontWeight: "600",
                        border: "1px solid var(--accent-soft)",
                      }}
                    >
                      {saveMessage}
                    </div>
                  )}

                  {selectedMaterial === "COAL" && (
                    <div
                      style={{
                        marginBottom: "15px",
                        padding: "14px 16px",
                        borderRadius: "10px",
                        backgroundColor:
                          rawDraftStatus.tone === "error"
                            ? "#fee2e2"
                            : rawDraftStatus.tone === "saved"
                              ? "#ecfdf5"
                              : "#eff6ff",
                        color:
                          rawDraftStatus.tone === "error"
                            ? "#991b1b"
                            : rawDraftStatus.tone === "saved"
                              ? "#166534"
                              : "#1e3a8a",
                        border:
                          rawDraftStatus.tone === "error"
                            ? "1px solid #fca5a5"
                            : rawDraftStatus.tone === "saved"
                              ? "1px solid #86efac"
                              : "1px solid var(--accent-soft)",
                      }}
                    >
                      <div style={{ fontWeight: "700", marginBottom: "4px" }}>
                        Draft Status
                      </div>
                      <div style={{ fontWeight: "600" }}>
                        {rawDraftStatus.message}
                      </div>
                      {(rawDraftStatus.entryId || rawDraftStatus.lastSavedAt) && (
                        <div
                          style={{
                            marginTop: "6px",
                            fontSize: "13px",
                            opacity: 0.9,
                          }}
                        >
                          {rawDraftStatus.entryId
                            ? `Entry ID: ${rawDraftStatus.entryId}`
                            : ""}
                          {rawDraftStatus.entryId && rawDraftStatus.lastSavedAt
                            ? " | "
                            : ""}
                          {rawDraftStatus.lastSavedAt
                            ? `Last saved: ${formatDraftStatusTime(rawDraftStatus.lastSavedAt)}`
                            : ""}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedMaterial === "COAL" && (
                    <div
                      style={{
                        marginBottom: "18px",
                        padding: "16px",
                        borderRadius: "12px",
                        backgroundColor: "#f8fafc",
                        border: "1px solid #cbd5e1",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "10px",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: "700", color: "var(--accent-dark)" }}>
                            Draft Data
                          </div>
                          <div style={{ fontSize: "13px", color: "#475569" }}>
                            Saved coal drafts stay here until final submission.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={loadCoalDrafts}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: "1px solid #94a3b8",
                            backgroundColor: "#ffffff",
                            color: "var(--accent-dark)",
                            fontWeight: "700",
                            cursor: "pointer",
                          }}
                        >
                          Refresh
                        </button>
                      </div>

                      {coalDraftsLoading ? (
                        <div style={{ color: "#475569", fontSize: "14px" }}>
                          Loading drafts...
                        </div>
                      ) : coalDrafts.length === 0 ? (
                        <div style={{ color: "#64748b", fontSize: "14px" }}>
                          No saved drafts yet.
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "grid",
                            gap: "10px",
                          }}
                        >
                          {coalDrafts.map((draft) => (
                            <div
                              key={draft.coalId}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: "12px",
                                padding: "12px 14px",
                                borderRadius: "10px",
                                backgroundColor: "#ffffff",
                                border: "1px solid #dbe7f3",
                              }}
                            >
                              <div style={{ minWidth: 0 }}>
                                <div
                                  style={{
                                    fontWeight: "700",
                                    color: "var(--accent-dark)",
                                    marginBottom: "4px",
                                  }}
                                >
                                  {draft.coalId || "Draft"}
                                </div>
                                <div style={{ fontSize: "13px", color: "#475569" }}>
                                  Status: {draft.status || "DRAFT"}
                                </div>
                                <div style={{ fontSize: "13px", color: "#475569" }}>
                                  Last saved: {formatDraftStatusTime(draft.lastSavedAt) || "-"}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => openCoalDraft(draft.coalId)}
                                style={{
                                  padding: "10px 14px",
                                  borderRadius: "8px",
                                  border: "none",
                                  backgroundColor: "var(--accent-dark)",
                                  color: "#ffffff",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                Open Draft
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedMaterial && selectedMaterial !== "COAL" && renderGenericDraftPanel()}

                  {errorMsg && (
                    <div
                      style={{
                        marginBottom: "15px",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        backgroundColor: "#fee2e2",
                        color: "#991b1b",
                        fontWeight: "600",
                        border: "1px solid #fca5a5",
                      }}
                    >
                      ❌ {errorMsg}
                    </div>
                  )}

                  {effectivePermissions?.actions?.save && (
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      style={{
                        marginTop: "30px",
                        width: "100%",
                        padding: "15px",
                        backgroundColor: "var(--accent-dark)",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        fontWeight: "bold",
                        fontSize: "1rem",
                        cursor: "pointer",
                      }}
                    >
                      Save Analysis
                    </button>
                  )}

                </>
              )}
            </div>
          )}

          {/* ----------------------- */}
          {/* STOCKHOUSE MODULE */}
          {/* ----------------------- */}
          {/* Top Selection Row */}
          {/* Top Selection Row */}
          {activeModule === "stockhouse" && (
            <div>
              <h2
                style={{
                  color: "var(--heading-color)",
                  borderBottom: "2px solid var(--accent-dark)",
                  paddingBottom: "10px",
                }}
              >
                Stock House Analysis
              </h2>

              {/* 🔥 MATERIAL SELECTION (BOXES) */}
              <div
                style={{
                  marginBottom: "20px",
                  background: "#f8f9fa",
                  padding: "15px",
                  borderRadius: "12px",
                }}
              >
                <label
                  style={{
                    ...labelStyle,
                    display: "block",
                    marginBottom: "10px",
                  }}
                >
                  Select Material:
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(140px, 1fr))",
                    gap: "12px",
                    maxWidth: "520px",
                  }}
                >
                  {[
                    { key: "Coal", label: "Coal" },
                    { key: "IronOre", label: "Iron Ore" },
                    { key: "Dolomite", label: "Dolomite" },
                  ].map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setStockMaterial(m.key)}
                      style={{
                        padding: "14px",
                        borderRadius: "12px",
                        border:
                          stockMaterial === m.key
                            ? "2px solid var(--accent-dark)"
                            : "1px solid #cbd5e1",
                        background:
                          stockMaterial === m.key ? "#e0f2fe" : "#ffffff",
                        color: "var(--accent-dark)",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 🔥 TOP ROW */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gap: "25px",
                  marginBottom: "20px",
                }}
              >
                {stockMaterial && (
                  <div style={{ marginBottom: "15px" }}>
                    <label style={labelStyle}>ID</label>
                    <input
                      value={stockFormData.id || ""}
                      readOnly
                      title="Click to copy ID"
                      onClick={() => {
                        const id = stockFormData.id || "";
                        if (!id) return;
                        navigator.clipboard
                          .writeText(id)
                          .then(() => {
                            setSaveMessage("ID copied to clipboard");
                            setTimeout(() => setSaveMessage(""), 1800);
                          })
                          .catch(() => setSaveMessage("Copy failed"));
                      }}
                      style={{
                        ...inputStyle,
                        background: "#e9ecef",
                        width: "260px",
                        fontWeight: "700",
                        fontFamily: "monospace",
                        cursor: "pointer",
                      }}
                    />
                  </div>
                )}

                {/* Stock House Entry Date (centered + smaller) */}
                {stockMaterial && (
                  <div style={{ marginBottom: "15px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <label style={{ ...labelStyle, textAlign: "center" }}>Entry Date</label>
                    <input
                      type="date"
                      min={new Date(Date.now() - 86400000).toISOString().split("T")[0]}
                      max={new Date().toISOString().split("T")[0]}
                      value={stockFormData?.entryDate || new Date().toISOString().split("T")[0]}
                      onChange={(e) =>
                        handleStockChange("entryDate", e.target.value)
                      }
                      style={{ ...inputStyle, borderColor: "var(--accent-dark)", width: "170px", textAlign: "center" }}
                    />
                  </div>
                )}

                {stockMaterial && (
                  <div style={{ marginBottom: "15px" }}>
                    <label style={labelStyle}>User Name</label>
                    <input
                      value={filledByDisplay}
                      readOnly
                      style={{
                        ...inputStyle,
                        background: "#e9ecef",
                        width: "260px",
                        fontWeight: "700",
                      }}
                    />
                  </div>
                )}

                {/* SHOW AFTER MATERIAL */}
                {stockMaterial && (
                  <>
                    <div>
                      <label style={labelStyle}>Kiln</label>
                      <select
                        value={stockFormData.kiln || ""}
                        onChange={(e) =>
                          handleStockChange("kiln", e.target.value)
                        }
                        style={{ ...inputStyle, width: "100%" }}
                      >
                        <option value="">-- Select Kiln --</option>
                        <option>Kiln 1</option>
                        <option>Kiln 2</option>
                        <option>Kiln 3</option>
                        <option>Kiln 4</option>
                        <option>Kiln 5</option>
                        <option>Kiln 6</option>
                        <option>Kiln 7</option>
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle}>Belt</label>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                        }}
                      >
                        <select
                          value={stockFormData.belt || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "__add_new__" && isSuperAdmin) {
                              setShowCustomStockBelt(true);
                              return;
                            }
                            setShowCustomStockBelt(false);
                            handleStockChange("belt", val);
                          }}
                          style={{ ...inputStyle, width: "100%" }}
                        >
                          <option value="">-- Select Belt --</option>
                          {stockBelts.map((belt) => (
                            <option key={belt} value={belt}>
                              {belt}
                            </option>
                          ))}
                          {isSuperAdmin && (
                            <option value="__add_new__">+ Add new...</option>
                          )}
                        </select>

                        {isSuperAdmin && showCustomStockBelt && (
                          <div style={{ display: "flex", gap: "6px" }}>
                            <input
                              value={customStockBelt}
                              onChange={(e) =>
                                setCustomStockBelt(e.target.value)
                              }
                              placeholder="Enter new belt"
                              style={{ ...inputStyle, flex: 1 }}
                            />
                            <button
                              type="button"
                              onClick={async () => {
                                const value = (customStockBelt || "").trim();
                                if (!value) return;

                                try {
                                  const res = await fetch(
                                    `${API_BASE_URL}/api/production/stock-belt-options`,
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        value,
                                        userId: localStorage.getItem("userId"),
                                      }),
                                    },
                                  );

                                  if (!res.ok) {
                                    alert("Failed to add belt");
                                    return;
                                  }

                                  const list = await res.json();
                                  if (Array.isArray(list) && list.length > 0) {
                                    setStockBelts(list);
                                  } else if (!stockBelts.includes(value)) {
                                    setStockBelts((prev) => [...prev, value]);
                                  }

                                  handleStockChange("belt", value);
                                  setCustomStockBelt("");
                                  setShowCustomStockBelt(false);
                                } catch {
                                  alert("Failed to add belt");
                                }
                              }}
                              style={{
                                padding: "8px 12px",
                                backgroundColor: "var(--accent-dark)",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                              }}
                            >
                              Add
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Stock House Sections */}
              {stockMaterial && (
                <div style={{ display: "grid", gap: "20px" }}>
                  {(stockFieldSectionsByMaterial[stockMaterial] || []).map(
                    (section) => (
                      <div
                        key={section.title}
                        style={{
                          backgroundColor: "#f8fafc",
                          padding: "18px",
                          borderRadius: "16px",
                          border: "1px solid #dbe7f3",
                          boxShadow: "0 8px 22px rgba(15,23,42,0.06)",
                        }}
                      >
                        <h3
                          style={{
                            color: "var(--heading-color)",
                            margin: "0 0 14px 0",
                            paddingBottom: "10px",
                            borderBottom: "1px solid #cbd5e1",
                          }}
                        >
                          {section.title}
                        </h3>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                            gap: "15px",
                          }}
                        >
                          {section.fields.map((f) => (
                            <div key={f.key}>
                              <label style={labelStyle}>{f.label}</label>
                              <input
                                type="number"
                                value={stockFormData?.[f.key] ?? ""}
                                onChange={(e) =>
                                  handleStockChange(f.key, e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "e" || e.key === "E") {
                                    e.preventDefault();
                                  }
                                }}
                                style={{
                                  ...inputStyle,
                                  borderColor: stockFieldErrors[f.key]
                                    ? "red"
                                    : "#cbd5e1",
                                }}
                              />
                              {stockFieldErrors[f.key] && (
                                <span style={{ color: "red", fontSize: "11px" }}>
                                  {stockFieldErrors[f.key]}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                  )}

                  <div
                    style={{
                      backgroundColor: "#f8fafc",
                      padding: "18px",
                      borderRadius: "16px",
                      border: "1px solid #dbe7f3",
                      boxShadow: "0 8px 22px rgba(15,23,42,0.06)",
                    }}
                  >
                    <h3
                      style={{
                        color: "var(--heading-color)",
                        margin: "0 0 14px 0",
                        paddingBottom: "10px",
                        borderBottom: "1px solid #cbd5e1",
                      }}
                    >
                      Entry Details
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "15px",
                      }}
                    >
                      <div>
                        <label style={labelStyle}>Status</label>
                        <input
                          value={stockFormData.status || "Pending"}
                          readOnly
                          style={frozenInputStyle}
                        />
                      </div>
                      <div style={{ gridColumn: "span 2" }}>
                        <label style={labelStyle}>Remarks</label>
                        <input
                          value={stockFormData.remarks || ""}
                          onChange={(e) =>
                            handleStockChange("remarks", e.target.value)
                          }
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* SAVE BUTTON */}
              {stockMaterial && (
                <>
                  {renderGenericDraftPanel()}
                  <button
                    onClick={handleStockSubmit}
                    style={{
                      marginTop: "25px",
                      width: "100%",
                      padding: "15px",
                      background: "var(--accent-dark)",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    Save Stock House Analysis
                  </button>
                </>
              )}
            </div>
          )}

          {/* 🔥 ADD THIS WHOLE BLOCK HERE */}

          {/* ----------------------- */}
          {/* PRODUCTION MODULE */}
          {/* ----------------------- */}
          {activeModule === "production" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "2px solid var(--accent-dark)",
                  paddingBottom: "15px",
                  marginBottom: "20px",
                }}
              >
                <h2 style={{ color: "var(--heading-color)", fontWeight: "600", margin: 0 }}>
                  {source === "CD" ? "Cooler Discharge" : "Product House"} Data
                  Entry
                </h2>
                <span
                  style={{
                    fontWeight: "bold",
                    backgroundColor: "#e2e8f0",
                    color: "var(--accent-dark)",
                    padding: "8px 15px",
                    borderRadius: "10px",
                  }}
                >
                  Source: {source}
                </span>
              </div>

              {source === "CD" && (
                <div
                  style={{ display: "flex", gap: "10px", marginBottom: "14px" }}
                >
                  <button
                    type="button"
                    onClick={() => setCdEntryMode("finishedGoods")}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border:
                        cdEntryMode === "finishedGoods"
                          ? "2px solid var(--accent-dark)"
                          : "1px solid #cbd5e1",
                      background:
                        cdEntryMode === "finishedGoods" ? "#e0f2fe" : "#ffffff",
                      color: "var(--accent-dark)",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Finished Goods
                  </button>
                  <button
                    type="button"
                    onClick={() => setCdEntryMode("byProduct")}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border:
                        cdEntryMode === "byProduct"
                          ? "2px solid var(--accent-dark)"
                          : "1px solid #cbd5e1",
                      background:
                        cdEntryMode === "byProduct" ? "#e0f2fe" : "#ffffff",
                      color: "var(--accent-dark)",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    By Products
                  </button>
                </div>
              )}

              {/* Selection Row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "20px",
                  backgroundColor: "#f8f9fa",
                  padding: "20px",
                  borderRadius: "15px",
                  marginBottom: "25px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                  }}
                >
                  <label style={labelStyle}>Entry ID</label>
                  <input
                    value={
                      source === "CD" && cdEntryMode === "byProduct"
                        ? prodFormData.byProductId || ""
                        : prodFormData.productionCode || ""
                    }
                    readOnly
                    style={{
                      ...inputStyle,
                      background: "#e9ecef",
                      fontWeight: "700",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                  }}
                >
                  <label style={labelStyle}>User Name</label>
                  <input
                    value={filledByDisplay}
                    readOnly
                    style={{
                      ...inputStyle,
                      background: "#e9ecef",
                      fontWeight: "700",
                    }}
                  />
                </div>
                {(source !== "CD" || cdEntryMode === "finishedGoods") &&
                  ["area", "item", "shift"].map((type) => (
                    <div key={type}>
                      <label
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: "800",
                          color: "var(--label-color)",
                          textTransform: "uppercase",
                          display: "block",
                          marginBottom: "5px",
                        }}
                      >
                        {type}
                      </label>
                      <select
                        value={prodFormData[type] || ""}
                        onChange={(e) =>
                          handleProdInputChange(type, e.target.value)
                        }
                        style={{ ...inputStyle, width: "100%" }}
                      >
                        <option value="">-- Select {type} --</option>
                        {type === "area" && (
                          <>
                            <option value="Kiln 1">Kiln 1</option>
                            <option value="Kiln 2">Kiln 2</option>
                            <option value="Kiln 3">Kiln 3</option>
                            <option value="Kiln 4">Kiln 4</option>
                            <option value="Kiln 5">Kiln 5</option>
                            <option value="Kiln 6">Kiln 6</option>
                            <option value="Kiln 7">Kiln 7</option>
                            {/* <option value="100TPD">100 TPD</option><option value="500TPD">500 TPD</option>
                        <option value="600TPD1">600 TPD 1</option><option value="600TPD2">600 TPD 2</option> */}
                          </>
                        )}
                        {type === "item" && (
                          <>
                            <option value="Pellets">Pellets</option>
                            <option value="Lumps">Lumps</option>
                            <option value="Fines">Fines</option>
                          </>
                        )}
                        {type === "shift" && (
                          <>
                            <option value="A">Shift A</option>
                            <option value="B">Shift B</option>
                            <option value="C">Shift C</option>
                          </>
                        )}
                      </select>
                    </div>
                  ))}
                {(source !== "CD" || cdEntryMode === "finishedGoods") && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: "800",
                        color: "var(--label-color)",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: "5px",
                      }}
                    >
                      Time (24h)
                    </label>
                    <input
                      type="time"
                      value={prodFormData.time || ""}
                      readOnly
                      style={{ ...inputStyle, width: "100%", background: "#e9ecef", fontWeight: "700" }}
                    />
                  </div>
                )}
              </div>

              {source === "CD" ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "20px",
                  }}
                >
                  {cdEntryMode === "finishedGoods" && (
                    <div
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "16px",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <h3
                        style={{
                          color: "var(--heading-color)",
                          marginTop: 0,
                          marginBottom: "12px",
                        }}
                      >
                        Finished Goods
                      </h3>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: "15px",
                        }}
                      >
                        {[
                          "feM",
                          "sulphur",
                          "carbon",
                          "nMag",
                          "overSize",
                          "underSize",
                          "magInChar",
                          "feMInChar",
                        ].map((field) => (
                          <div
                            key={field}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "5px",
                            }}
                          >
                            <label style={labelStyle}>
                              {field === "feM"
                                ? "Fe(M)"
                                : field === "nMag"
                                  ? "N MAG"
                                  : field === "overSize"
                                    ? "Over Size"
                                    : field === "underSize"
                                      ? "Under Size"
                                      : field === "magInChar"
                                        ? "Mag in Char"
                                        : field === "feMInChar"
                                          ? "Fc(m) in Char"
                                          : field}
                            </label>
                            <input
                              type="number"
                              placeholder="0.00"
                              step={getProductionFieldStep(field)}
                              min={getProductionValidationRule(field)?.min}
                              max={getProductionValidationRule(field)?.max}
                              value={prodFormData[field] ?? ""}
                              onChange={(e) =>
                                handleProdInputChange(field, e.target.value)
                              }
                              style={{
                                ...inputStyle,
                                borderColor: productionFieldErrors[field]
                                  ? "red"
                                  : "#cbd5e1",
                              }}
                            />
                            {productionFieldErrors[field] && (
                              <span style={{ color: "red", fontSize: "11px" }}>
                                {productionFieldErrors[field]}
                              </span>
                            )}
                          </div>
                        ))}

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "5px",
                          }}
                        >
                          <label style={labelStyle}>Bin No</label>
                          <input
                            value={prodFormData.binNo || ""}
                            onChange={(e) =>
                              handleProdInputChange("binNo", e.target.value)
                            }
                            style={inputStyle}
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "5px",
                          }}
                        >
                          <label style={labelStyle}>Grade</label>
                          <input
                            value={prodFormData.grade || ""}
                            readOnly
                            style={frozenInputStyle}
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "5px",
                          }}
                        >
                          <label style={labelStyle}>Status</label>
                          <input
                            value={prodFormData.status || "Pending"}
                            readOnly
                            style={frozenInputStyle}
                          />
                        </div>
                        <div
                          style={{
                            gridColumn: "span 2",
                            display: "flex",
                            flexDirection: "column",
                            gap: "5px",
                          }}
                        >
                          <label style={labelStyle}>Remarks</label>
                          <textarea
                            value={prodFormData.remarks || ""}
                            onChange={(e) =>
                              handleProdInputChange("remarks", e.target.value)
                            }
                            style={{ ...inputStyle, height: "60px" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {cdEntryMode === "byProduct" && (
                    <div
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "16px",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <h3
                        style={{
                          color: "var(--heading-color)",
                          marginTop: 0,
                          marginBottom: "12px",
                        }}
                      >
                        Bi Product
                      </h3>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr",
                          gap: "15px",
                        }}
                      >
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <label style={labelStyle}>Material</label>
                          <select
                            value={prodFormData.byProductMaterial || ""}
                            onChange={(e) =>
                              handleProdInputChange(
                                "byProductMaterial",
                                e.target.value,
                              )
                            }
                            style={{ ...inputStyle, width: "100%" }}
                          >
                            <option value="">-- Select Material --</option>
                            <option value="Dolochar">Dolochar</option>
                          </select>
                        </div>

                        {prodFormData.byProductMaterial && (
                          <>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <label style={labelStyle}>FC</label>
                              <input
                                type="number"
                                value={prodFormData.byProductFc ?? ""}
                                onChange={(e) =>
                                  handleProdInputChange(
                                    "byProductFc",
                                    e.target.value,
                                  )
                                }
                                style={{
                                  ...inputStyle,
                                  borderColor: productionFieldErrors.byProductFc
                                    ? "red"
                                    : "#cbd5e1",
                                }}
                              />
                              {productionFieldErrors.byProductFc && (
                                <span
                                  style={{ color: "red", fontSize: "11px" }}
                                >
                                  {productionFieldErrors.byProductFc}
                                </span>
                              )}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <label style={labelStyle}>-1MM</label>
                              <input
                                type="number"
                                value={prodFormData.byProductMinus1mm ?? ""}
                                onChange={(e) =>
                                  handleProdInputChange(
                                    "byProductMinus1mm",
                                    e.target.value,
                                  )
                                }
                                style={{
                                  ...inputStyle,
                                  borderColor:
                                    productionFieldErrors.byProductMinus1mm
                                      ? "red"
                                      : "#cbd5e1",
                                }}
                              />
                              {productionFieldErrors.byProductMinus1mm && (
                                <span
                                  style={{ color: "red", fontSize: "11px" }}
                                >
                                  {productionFieldErrors.byProductMinus1mm}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "20px",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "16px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <h3
                      style={{
                        color: "var(--heading-color)",
                        marginTop: 0,
                        marginBottom: "12px",
                      }}
                    >
                      Finished Goods
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "15px",
                      }}
                    >
                      {[
                        "feM",
                        "sulphur",
                        "carbon",
                        "nMag",
                        "overSize",
                        "underSize",
                        "magInChar",
                        "feMInChar",
                      ].map((field) => (
                        <div
                          key={field}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "5px",
                          }}
                        >
                          <label style={labelStyle}>
                            {field === "feM"
                              ? "Fe(M)"
                              : field === "nMag"
                                ? "N MAG"
                                : field === "overSize"
                                  ? "Over Size"
                                  : field === "underSize"
                                    ? "Under Size"
                                    : field === "magInChar"
                                      ? "Mag in Char"
                                      : field === "feMInChar"
                                        ? "Fc(m) in Char"
                                        : field}
                          </label>
                          <input
                            type="number"
                            placeholder="0.00"
                            step={getProductionFieldStep(field)}
                            min={getProductionValidationRule(field)?.min}
                            max={getProductionValidationRule(field)?.max}
                            value={prodFormData[field] ?? ""}
                            onChange={(e) =>
                              handleProdInputChange(field, e.target.value)
                            }
                            style={{
                              ...inputStyle,
                              borderColor: productionFieldErrors[field]
                                ? "red"
                                : "#cbd5e1",
                            }}
                          />
                          {productionFieldErrors[field] && (
                            <span style={{ color: "red", fontSize: "11px" }}>
                              {productionFieldErrors[field]}
                            </span>
                          )}
                        </div>
                      ))}

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "5px",
                        }}
                      >
                        <label style={labelStyle}>Bin No</label>
                        <input
                          value={prodFormData.binNo || ""}
                          onChange={(e) =>
                            handleProdInputChange("binNo", e.target.value)
                          }
                          style={inputStyle}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "5px",
                        }}
                      >
                        <label style={labelStyle}>Grade</label>
                        <input
                          value={prodFormData.grade || ""}
                          readOnly
                          style={frozenInputStyle}
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "16px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <h3
                      style={{
                        color: "var(--heading-color)",
                        marginTop: 0,
                        marginBottom: "12px",
                      }}
                    >
                      Entry Details
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "15px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "5px",
                        }}
                      >
                        <label style={labelStyle}>Status</label>
                        <input
                          value={prodFormData.status || "Pending"}
                          readOnly
                          style={frozenInputStyle}
                        />
                      </div>
                      <div
                        style={{
                          gridColumn: "span 2",
                          display: "flex",
                          flexDirection: "column",
                          gap: "5px",
                        }}
                      >
                        <label style={labelStyle}>Remarks</label>
                        <textarea
                          value={prodFormData.remarks || ""}
                          onChange={(e) =>
                            handleProdInputChange("remarks", e.target.value)
                          }
                          style={{ ...inputStyle, height: "60px" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {renderGenericDraftPanel()}
              <button
                onClick={handleProductionSubmit}
                style={{
                  marginTop: "30px",
                  width: "100%",
                  padding: "18px",
                  backgroundColor: "#27ae60",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  boxShadow: "0 4px 15px rgba(39, 174, 96, 0.3)",
                }}
              >
                Confirm & Save {source} Entry
              </button>
            </div>
          )}

          {/* ----------------------- */}
          {/* DISPATCH MODULE */}
          {/* ----------------------- */}
          {activeModule === "dispatch" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "2px solid var(--accent-dark)",
                  paddingBottom: "15px",
                  marginBottom: "20px",
                }}
              >
                <h2 style={{ color: "var(--heading-color)", fontWeight: "600", margin: 0 }}>
                  Dispatch Data Entry
                </h2>
                <span
                  style={{
                    fontWeight: "bold",
                    backgroundColor: "#e2e8f0",
                    color: "var(--accent-dark)",
                    padding: "8px 15px",
                    borderRadius: "10px",
                  }}
                >
                  Department: Dispatch
                </span>
              </div>

              {/* Dispatch Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "15px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Dispatch ID</label>
                  <input
                    value={dispatchFormData.dispatchCode || ""}
                    readOnly
                    style={{
                      ...inputStyle,
                      background: "#e9ecef",
                      fontWeight: "700",
                    }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>User Name</label>
                  <input
                    value={filledByDisplay}
                    readOnly
                    style={{
                      ...inputStyle,
                      background: "#e9ecef",
                      fontWeight: "700",
                    }}
                  />
                </div>
                {/* Row 1 */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Month</label>
                  <select
                    value={dispatchFormData.month || ""}
                    onChange={(e) => handleDispatchChange("month", e.target.value)}
                    style={inputStyle}
                  >
                    {monthOptions.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Entry Date</label>
                  <input
                    type="date"
                    min={new Date(Date.now() - 86400000).toISOString().split("T")[0]}
                    max={new Date().toISOString().split("T")[0]}
                    value={dispatchFormData.entryDate || new Date().toISOString().split("T")[0]}
                    onChange={(e) => handleDispatchChange("entryDate", e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Material</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <select
                      value={dispatchFormData.material || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "__add_new__" && isSuperAdmin) {
                          setShowCustomDispatchMaterial(true);
                        } else {
                          setShowCustomDispatchMaterial(false);
                          handleDispatchChange("material", val);
                        }
                      }}
                      style={inputStyle}
                    >
                      <option value="">-- Select Material --</option>
                      {dispatchMaterials.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                      {isSuperAdmin && <option value="__add_new__">➕ Add new...</option>}
                    </select>
                    {isSuperAdmin && showCustomDispatchMaterial && (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <input
                          placeholder="Enter new material"
                          value={customDispatchMaterial}
                          onChange={(e) => setCustomDispatchMaterial(e.target.value)}
                          style={{ ...inputStyle, flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!customDispatchMaterial.trim()) return;
                            setDispatchMaterials((prev) => [...prev, customDispatchMaterial]);
                            handleDispatchChange("material", customDispatchMaterial);
                            setCustomDispatchMaterial("");
                            setShowCustomDispatchMaterial(false);
                          }}
                          style={{
                            padding: "8px 12px",
                            backgroundColor: "var(--accent-dark)",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 2 */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Truck No</label>
                  <input
                    value={dispatchFormData.truckNo || ""}
                    onChange={(e) => handleDispatchChange("truckNo", e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Party Name</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <select
                      value={dispatchFormData.partyName || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "__add_new__" && isSuperAdmin) {
                          setShowCustomDispatchParty(true);
                        } else {
                          setShowCustomDispatchParty(false);
                          handleDispatchChange("partyName", val);
                        }
                      }}
                      style={inputStyle}
                    >
                      <option value="">-- Select Party --</option>
                      {dispatchParties.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                      {isSuperAdmin && <option value="__add_new__">➕ Add new...</option>}
                    </select>
                    {isSuperAdmin && showCustomDispatchParty && (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <input
                          placeholder="Enter new party"
                          value={customDispatchParty}
                          onChange={(e) => setCustomDispatchParty(e.target.value)}
                          style={{ ...inputStyle, flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!customDispatchParty.trim()) return;
                            setDispatchParties((prev) => [...prev, customDispatchParty]);
                            handleDispatchChange("partyName", customDispatchParty);
                            setCustomDispatchParty("");
                            setShowCustomDispatchParty(false);
                          }}
                          style={{
                            padding: "8px 12px",
                            backgroundColor: "var(--accent-dark)",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Destination</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <select
                      value={dispatchFormData.destination || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "__add_new__" && isSuperAdmin) {
                          setShowCustomDispatchDestination(true);
                        } else {
                          setShowCustomDispatchDestination(false);
                          handleDispatchChange("destination", val);
                        }
                      }}
                      style={inputStyle}
                    >
                      <option value="">-- Select Destination --</option>
                      {dispatchDestinations.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                      {isSuperAdmin && <option value="__add_new__">➕ Add new...</option>}
                    </select>
                    {isSuperAdmin && showCustomDispatchDestination && (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <input
                          placeholder="Enter new destination"
                          value={customDispatchDestination}
                          onChange={(e) => setCustomDispatchDestination(e.target.value)}
                          style={{ ...inputStyle, flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!customDispatchDestination.trim()) return;
                            setDispatchDestinations((prev) => [...prev, customDispatchDestination]);
                            handleDispatchChange("destination", customDispatchDestination);
                            setCustomDispatchDestination("");
                            setShowCustomDispatchDestination(false);
                          }}
                          style={{
                            padding: "8px 12px",
                            backgroundColor: "var(--accent-dark)",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Size</label>
                  <input
                    onChange={(e) =>
                      handleDispatchChange("materialSize", e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>

                {/* Row 3 (Numeric Fields) */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>QTY</label>
                  <input
                    type="number"
                    onChange={(e) =>
                      handleDispatchChange("qty", e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'e' || e.key === 'E') {
                        e.preventDefault();
                      }
                    }}
                    style={{
                      ...inputStyle,
                      borderColor: dispatchFieldErrors.qty ? "red" : "#cbd5e1",
                    }}
                  />
                  {dispatchFieldErrors.qty && (
                    <span style={{ color: "red", fontSize: "11px" }}>
                      {dispatchFieldErrors.qty}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Fe(M)</label>
                  <input
                    type="number"
                    onChange={(e) =>
                      handleDispatchChange("feM", e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'e' || e.key === 'E') 
                        {
                        e.preventDefault();
                      }
                    }}
                    style={{
                      ...inputStyle,
                      borderColor: dispatchFieldErrors.feM ? "red" : "#cbd5e1",
                    }}
                  />
                  {dispatchFieldErrors.feM && (
                    <span style={{ color: "red", fontSize: "11px" }}>
                      {dispatchFieldErrors.feM}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>-3mm</label>
                  <input
                    type="number"
                    onChange={(e) =>
                      handleDispatchChange("minus3mm", e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'e' || e.key === 'E') {
                        e.preventDefault();
                      }
                    }}
                    style={{
                      ...inputStyle,
                      borderColor: dispatchFieldErrors.minus3mm
                        ? "red"
                        : "#cbd5e1",
                    }}
                  />
                  {dispatchFieldErrors.minus3mm && (
                    <span style={{ color: "red", fontSize: "11px" }}>
                      {dispatchFieldErrors.minus3mm}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Dispatch Officer</label>
                  <input
                    onChange={(e) =>
                      handleDispatchChange("dispatchOfficer", e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>

                {/* Row 5 */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={labelStyle}>Status</label>
                  <input
                    value={dispatchFormData.status || "Pending"}
                    readOnly
                    style={frozenInputStyle}
                  />
                </div>
                <div
                  style={{
                    gridColumn: "span 3",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <label style={labelStyle}>Remarks</label>
                  <textarea
                    onChange={(e) =>
                      handleDispatchChange("remarks", e.target.value)
                    }
                    style={{ ...inputStyle, height: "45px" }}
                  />
                </div>
              </div>


              {renderGenericDraftPanel()}
              <button
                onClick={handleDispatchSubmit}
                style={{
                  marginTop: "30px",
                  width: "100%",
                  padding: "18px",
                  backgroundColor: "var(--accent-dark)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Confirm & Save Dispatch Entry
              </button>
            </div>
          )}

          {activeModule === "manager" && (
            <div style={{ padding: "20px" }}>
              <h2
                style={{ color: "var(--heading-color)", borderBottom: "2px solid var(--accent-dark)" }}
              >
                Approvals Management
              </h2>

              {Object.keys(pendingData).map((moduleKey) => {
                const tasks = pendingData[moduleKey];
                if (tasks.length === 0) return null;
                const bulkApproveKey = `${moduleKey}:Approved`;
                const bulkRejectKey = `${moduleKey}:Rejected`;
                const selectedIds = selectedPendingRows[moduleKey] || [];
                const selectedCount = selectedIds.length;
                const allTaskIds = tasks.map((item) =>
                  String(getPendingItemId(item)),
                );
                const allSelected =
                  allTaskIds.length > 0 &&
                  allTaskIds.every((id) => selectedIds.includes(id));

                return (
                  <div key={moduleKey} style={{ marginBottom: "40px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "10px",
                      }}
                    >
                      <h3
                        style={{
                          textTransform: "capitalize",
                          color: "#2c3e50",
                          margin: 0,
                        }}
                      >
                        {pendingLabelMap[moduleKey] ?? moduleKey} Pending Requests
                      </h3>

                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        {effectivePermissions?.actions?.approve && (
                          <button
                            onClick={() =>
                              handleBulkStatusUpdate(
                                moduleKey,
                                selectedIds,
                                "Approved",
                              )
                            }
                            disabled={
                              selectedCount === 0 ||
                              bulkActionKey === bulkApproveKey
                            }
                            style={{
                              backgroundColor: "#15803d",
                              color: "white",
                              border: "none",
                              padding: "8px 14px",
                              borderRadius: "8px",
                              cursor:
                                selectedCount === 0 ||
                                bulkActionKey === bulkApproveKey
                                  ? "not-allowed"
                                  : "pointer",
                              fontWeight: "700",
                              opacity:
                                selectedCount === 0 ||
                                bulkActionKey === bulkApproveKey
                                  ? 0.7
                                  : 1,
                            }}
                          >
                            {bulkActionKey === bulkApproveKey
                              ? "Approving..."
                              : `Approve (${selectedCount})`}
                          </button>
                        )}

                        {effectivePermissions?.actions?.reject && (
                          <button
                            onClick={() =>
                              handleBulkStatusUpdate(
                                moduleKey,
                                selectedIds,
                                "Rejected",
                              )
                            }
                            disabled={
                              selectedCount === 0 ||
                              bulkActionKey === bulkRejectKey
                            }
                            style={{
                              backgroundColor: "#dc2626",
                              color: "white",
                              border: "none",
                              padding: "8px 14px",
                              borderRadius: "8px",
                              cursor:
                                selectedCount === 0 ||
                                bulkActionKey === bulkRejectKey
                                  ? "not-allowed"
                                  : "pointer",
                              fontWeight: "700",
                              opacity:
                                selectedCount === 0 ||
                                bulkActionKey === bulkRejectKey
                                  ? 0.7
                                  : 1,
                            }}
                          >
                            {bulkActionKey === bulkRejectKey
                              ? "Rejecting..."
                              : `Reject (${selectedCount})`}
                          </button>
                        )}
                      </div>
                    </div>

                    {selectedCount === 0 && (
                      <div
                        style={{
                          marginBottom: "10px",
                          color: "#b91c1c",
                          fontSize: "13px",
                          fontWeight: "600",
                        }}
                      >
                        Select at least one record to approve or reject.
                      </div>
                    )}

                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        marginTop: "10px",
                        backgroundColor: "#ffffff",
                        color: "var(--accent-dark)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        borderRadius: "10px",
                        overflow: "hidden",
                      }}
                    >
                      <thead>
                        <tr
                          style={{ backgroundColor: "var(--accent-dark)", color: "white" }}
                        >
                          <th style={{ padding: "12px", width: "60px" }}>
                            <input
                              type="checkbox"
                              checked={allSelected}
                              onChange={() =>
                                toggleSelectAllPendingRows(moduleKey, tasks)
                              }
                              aria-label={`Select all ${pendingLabelMap[moduleKey] ?? moduleKey} rows`}
                              style={{ width: "16px", height: "16px", cursor: "pointer" }}
                            />
                          </th>
                          <th style={{ padding: "12px" }}>Date</th>
                          <th style={{ padding: "12px" }}>ID / Source</th>
                          <th style={{ padding: "12px" }}>Details</th>
                          <th style={{ padding: "12px" }}>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {tasks.map((item, index) => {
                          const itemId = getPendingItemId(item);
                          const normalizedItemId = String(itemId);
                          const isSelected = selectedIds.includes(normalizedItemId);

                          return (
                            <tr
                              key={itemId}
                              style={{
                                backgroundColor:
                                  index % 2 === 0 ? "#ffffff" : "#f1f5f9",
                                borderBottom: "1px solid #e5e7eb",
                                textAlign: "center",
                              }}
                            >
                              <td style={{ padding: "10px" }}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() =>
                                    togglePendingRowSelection(
                                      moduleKey,
                                      normalizedItemId,
                                    )
                                  }
                                  aria-label={`Select ${normalizedItemId}`}
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                    cursor: "pointer",
                                  }}
                                />
                              </td>
                              <td style={{ padding: "10px", color: "var(--accent-dark)" }}>
                                {item.entryDate
                                  ? new Date(
                                    item.entryDate,
                                  ).toLocaleDateString()
                                  : "—"}
                              </td>

                              <td style={{ padding: "10px", color: "var(--accent-dark)" }}>
                                {itemId}
                              </td>

                              <td style={{ padding: "10px", color: "var(--accent-dark)" }}>
                                {getPendingDetails(item, moduleKey)}
                              </td>

                              <td style={{ padding: "10px" }}>
                                {effectivePermissions?.actions?.approve && (
                                  <button
                                    onClick={() =>
                                      handleStatusUpdate(
                                        itemId,
                                        moduleKey.toUpperCase(),
                                        "Approved",
                                      )
                                    }
                                    style={{
                                      backgroundColor: "#27ae60",
                                      color: "white",
                                      border: "none",
                                      padding: "6px 12px",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      marginRight: "8px",
                                    }}
                                  >
                                    Approve
                                  </button>
                                )}

                                {effectivePermissions?.actions?.reject && (
                                  <button
                                    onClick={() =>
                                      handleStatusUpdate(
                                        itemId,
                                        moduleKey.toUpperCase(),
                                        "Rejected",
                                      )
                                    }
                                    style={{
                                      backgroundColor: "#e74c3c",
                                      color: "white",
                                      border: "none",
                                      padding: "6px 12px",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      marginRight: "8px",
                                    }}
                                  >
                                    Reject
                                  </button>
                                )}

                                {effectivePermissions?.actions?.edit && (
                                  <button
                                    onClick={() => {
                                      const schema = getEditFieldSchema(
                                        moduleKey,
                                        item,
                                      );
                                      const base = {
                                        ...item,
                                        module: moduleKey,
                                      };
                                      schema.forEach((k) => {
                                        if (
                                          base[k] === undefined ||
                                          base[k] === null
                                        ) {
                                          base[k] = "";
                                        }
                                      });
                                      setTempEditData(base);
                                      setEditMode(true);
                                    }}
                                    style={{
                                      backgroundColor: "#3498db",
                                      color: "white",
                                      padding: "6px 12px",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      border: "none",
                                    }}
                                  >
                                    Edit
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })}

              {Object.values(pendingData).every((arr) => arr.length === 0) && (
                <div
                  style={{
                    textAlign: "center",
                    marginTop: "50px",
                    color: "#7f8c8d",
                  }}
                >
                  <p>✅ All caught up! No pending approvals.</p>
                </div>
              )}
            </div>
          )}

          {localStorage.getItem("userRole") === "manager" && (
            <button
              onClick={() => {
                openManagerApprovalFromDashboard();
              }}
              style={navButtonStyle(activeModule === "manager")}
            >
              Approval Queue
            </button>
          )}
        </div>
      )}
      {/* --- EDIT MODAL POPUP --- */}
      {/* --- EDIT MODAL POPUP --- */}
      {editMode && tempEditData && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)", // Darker background to see the box clearly
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 3000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "15px",
              width: "90%",
              maxWidth: "700px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h2
              style={{
                color: "var(--heading-color)",
                borderBottom: "1px solid #eee",
                paddingBottom: "10px",
              }}
            >
              Edit {tempEditData.module} Record
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginTop: "20px",
                minHeight: "100px", // Ensures the box isn't flat if keys are missing
              }}
            >
              {getEditFieldSchema(tempEditData.module, tempEditData).map(
                (key) => {
                  const lowerKey = key.toLowerCase();
                  const hiddenFields = ["module"];
                  const readOnlyFields = [
                    "id",
                    "coalid",
                    "pelletid",
                    "ironoreid",
                    "dolomiteid",
                    "productioncode",
                    "dispatchcode",
                    "status",
                    "entrydate",
                    "createddate",
                  ];

                  if (hiddenFields.includes(lowerKey)) return null;
                  const isReadOnly = readOnlyFields.includes(lowerKey);

                  return (
                    <div
                      key={key}
                      style={{ display: "flex", flexDirection: "column" }}
                    >
                      <label
                        style={{
                          fontSize: "11px",
                          fontWeight: "bold",
                          color: "#666",
                          marginBottom: "5px",
                        }}
                      >
                        {formatEditLabel(key)}
                      </label>
                      <input
                        type="text"
                        value={tempEditData[key] ?? ""}
                        disabled={isReadOnly}
                        onChange={(e) =>
                          setTempEditData({
                            ...tempEditData,
                            [key]: e.target.value,
                          })
                        }
                        style={{
                          padding: "8px",
                          border: "1px solid #ccc",
                          borderRadius: "5px",
                          backgroundColor: isReadOnly ? "#f1f5f9" : "#ffffff",
                          color: isReadOnly ? "#64748b" : "#0f172a",
                          cursor: isReadOnly ? "not-allowed" : "text",
                        }}
                      />
                    </div>
                  );
                },
              )}
            </div>

            <div
              style={{
                marginTop: "30px",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={() => setEditMode(false)}
                style={{ padding: "10px 20px", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSave}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#27ae60",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SUCCESS POPUP ===== */}
      {showSuccessPopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 6000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "40px",
              borderRadius: "14px",
              width: "90%",
              maxWidth: "420px",
              textAlign: "center",
              boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
            }}
          >
            <h2
              style={{
                color:
                  lastSapSaveStatus && !lastSapSaveStatus.sapUpdated
                    ? "#d97706"
                    : "#22c55e",
                marginBottom: "10px",
              }}
            >
              {lastSapSaveStatus && !lastSapSaveStatus.sapUpdated
                ? "Saved Locally"
                : "Success!"}
            </h2>

            <p style={{ color: "#475569", marginBottom: "10px" }}>
              {lastSapSaveStatus && !lastSapSaveStatus.sapUpdated
                ? "Your data was saved locally, but SAP confirmation did not complete"
                : "Your data has been saved successfully"}
            </p>

            <p
              style={{
                fontWeight: "700",
                color: "var(--accent-dark)",
                marginBottom: "25px",
              }}
            >
              Entry ID: {savedEntryId}
            </p>

            {lastSapSaveStatus && (
              <div
                style={{
                  marginBottom: "20px",
                  padding: "12px",
                  borderRadius: "10px",
                  background: lastSapSaveStatus.sapUpdated ? "#ecfdf5" : "#fff7ed",
                  border: `1px solid ${lastSapSaveStatus.sapUpdated ? "#86efac" : "#fdba74"}`,
                  textAlign: "left",
                }}
              >
                <p
                  style={{
                    margin: "0 0 6px 0",
                    fontWeight: "700",
                    color: lastSapSaveStatus.sapUpdated ? "#166534" : "#9a3412",
                  }}
                >
                  {lastSapSaveStatus.sapUpdated ? "SAP updated successfully" : "Saved locally, SAP not updated"}
                </p>
                {lastSapSaveStatus.sapMessage && (
                  <p style={{ margin: 0, color: "#475569", fontSize: "13px" }}>
                    {lastSapSaveStatus.sapMessage}
                  </p>
                )}
                {!lastSapSaveStatus.sapUpdated &&
                  lastSapSaveStatus.isSapLockError && (
                    <div
                      style={{
                        marginTop: "8px",
                        padding: "10px",
                        borderRadius: "8px",
                        background: "#fff",
                        border: "1px dashed #fdba74",
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 4px 0",
                          color: "#9a3412",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        SAP lock detected
                      </p>
                      <p style={{ margin: 0, color: "#475569", fontSize: "12px" }}>
                        {lastSapSaveStatus.confirmationNumbers?.length > 0
                          ? `Confirmation${lastSapSaveStatus.confirmationNumbers.length > 1 ? "s" : ""} ${
                            lastSapSaveStatus.confirmationRange
                          } ${lastSapSaveStatus.blockedByUser ? `are locked by ${lastSapSaveStatus.blockedByUser}` : "are locked in SAP"}.`
                          : `This inspection result is currently locked${lastSapSaveStatus.blockedByUser ? ` by ${lastSapSaveStatus.blockedByUser}` : " in SAP"}.`}
                      </p>
                      <p style={{ margin: "4px 0 0 0", color: "#475569", fontSize: "12px" }}>
                        Release the SAP lock or retry after the existing SAP session clears.
                      </p>
                    </div>
                  )}
                {Array.isArray(lastSapSaveStatus.sapMessages) &&
                  lastSapSaveStatus.sapMessages.length > 0 && (
                    <div style={{ marginTop: "8px" }}>
                      {lastSapSaveStatus.sapMessages.map((message, index) => (
                        <p
                          key={`${index}-${message}`}
                          style={{
                            margin: index === 0 ? "0 0 4px 0" : "0 0 4px 0",
                            color: "#475569",
                            fontSize: "12px",
                          }}
                        >
                          {message}
                        </p>
                      ))}
                    </div>
                  )}
              </div>
            )}

            <button
              onClick={() => setShowSuccessPopup(false)}
              style={{
                background: "var(--accent)",
                color: "white",
                padding: "12px 28px",
                borderRadius: "10px",
                border: "none",
                fontSize: "16px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Awesome!
            </button>
          </div>
        </div>
      )}
      {/* ===== END SUCCESS POPUP ===== */}

      {/* ===== EXCEED CONFIRM POPUP ===== */}
      {showExceedConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 6500,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "32px",
              borderRadius: "14px",
              width: "90%",
              maxWidth: "520px",
              textAlign: "center",
              boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
            }}
          >
            <h2 style={{ color: "var(--heading-color)", marginBottom: "10px", fontWeight: "600" }}>
              Exceeded Limit
            </h2>

            <p style={{ color: "#475569", marginBottom: "10px" }}>
              Some fields are above the allowed range (1–100).
            </p>

            {exceedFields.length > 0 && (
              <div
                style={{
                  marginBottom: "18px",
                  color: "var(--accent-dark)",
                  fontWeight: "700",
                }}
              >
                {exceedFields.join(", ")}
              </div>
            )}

            <p
              style={{
                color: "#0f172a",
                fontWeight: "700",
                marginBottom: "20px",
              }}
            >
              Are you sure you want to save?
            </p>

            <div
              style={{ display: "flex", gap: "10px", justifyContent: "center" }}
            >
              <button
                onClick={() => {
                  setShowExceedConfirm(false);
                  if (exceedContext === "raw") submitRawMaterial(true);
                  if (exceedContext === "stock") submitStock(true);
                  if (exceedContext === "production") submitProduction(true);
                  if (exceedContext === "dispatch") submitDispatch(true);
                }}
                style={{
                  background: "var(--accent-dark)",
                  color: "white",
                  padding: "10px 22px",
                  borderRadius: "10px",
                  border: "none",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Yes, Save
              </button>
              <button
                onClick={() => setShowExceedConfirm(false)}
                style={{
                  background: "#e2e8f0",
                  color: "var(--accent-dark)",
                  padding: "10px 22px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ===== END EXCEED CONFIRM POPUP ===== */}

      <p style={{ color: "white", marginTop: "20px" }}>
        © 2026 Lloyds Metals & Energy Limited (LMEL) – LIMS. All rights
        reserved.
      </p>
    </div>
  );
};

export default RawMaterialTesting;





