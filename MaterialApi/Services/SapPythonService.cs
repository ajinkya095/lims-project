using System.Diagnostics;
using System.Text.Json;
using MaterialApi;
using MaterialApi.Infrastructure.ErrorHandling;

public class SapPythonService
{
    private static readonly SemaphoreSlim SapPostingSemaphore = new(1, 1);
    private readonly ILogger<SapPythonService> _logger;
    private readonly IConfiguration _configuration;
    private readonly string _scriptPath;

    public SapPythonService(IWebHostEnvironment env, ILogger<SapPythonService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
        _scriptPath = Path.Combine(env.ContentRootPath, "PythonScripts", "sap_connect.py");
    }

    public async Task<IReadOnlyList<SapMaterialDto>> RunPythonScriptAsync(CancellationToken cancellationToken = default)
    {
        var output = await ExecutePythonScriptAsync("--mode material-numbers", cancellationToken);
        return ParseMaterials(output);
    }

    public async Task<IReadOnlyList<string>> RunTruckNumbersAsync(CancellationToken cancellationToken = default)
    {
        var output = await ExecutePythonScriptAsync("--mode truck-numbers", cancellationToken);
        return ParseTruckNumbers(output);
    }

    public async Task<SapRawMaterialLookupsDto> RunRawMaterialLookupsAsync(CancellationToken cancellationToken = default)
    {
        var output = await ExecutePythonScriptAsync("--mode raw-lookups", cancellationToken);
        return ParseRawMaterialLookups(output);
    }

    public async Task<SapTruckLookupDto> RunRawMaterialTruckLookupsAsync(string fromDate, string toDate, CancellationToken cancellationToken = default)
    {
        var safeFromDate = EscapeCommandArgument(fromDate);
        var safeToDate = EscapeCommandArgument(toDate);
        var output = await ExecutePythonScriptAsync(
            $"--mode raw-trucks --from-date \"{safeFromDate}\" --to-date \"{safeToDate}\"",
            cancellationToken);
        return ParseTruckLookup(output);
    }

    public async Task<SapRawMaterialRecordDto> RunRawMaterialRecordAsync(string fromDate, string toDate, string truckNo, CancellationToken cancellationToken = default)
    {
        var safeFromDate = EscapeCommandArgument(fromDate);
        var safeToDate = EscapeCommandArgument(toDate);
        var safeTruckNo = EscapeCommandArgument(truckNo);
        var output = await ExecutePythonScriptAsync(
            $"--mode raw-record --from-date \"{safeFromDate}\" --to-date \"{safeToDate}\" --truck \"{safeTruckNo}\"",
            cancellationToken);
        return ParseRawMaterialRecord(output);
    }

    public async Task<SapLimsPostResponseDto> PostCoalLabResultsAsync(RawMaterialCoal data, CancellationToken cancellationToken = default)
    {
        await SapPostingSemaphore.WaitAsync(cancellationToken);
        try
        {
        var inspectionLot = data.InspectionLot;
        var allowConfiguredInspectionLotFallback =
            string.Equals(
                _configuration["SapLabPosting:AllowConfiguredInspectionLotFallback"],
                "true",
                StringComparison.OrdinalIgnoreCase);

        if (string.IsNullOrWhiteSpace(inspectionLot) && allowConfiguredInspectionLotFallback)
        {
            inspectionLot = _configuration["SapLabPosting:InspectionLot"];
        }
        var inspectionOperation = _configuration["SapLabPosting:InspectionOperation"] ?? "0010";
        var selectedSet = _configuration["SapLabPosting:UsageDecision:SelectedSet"] ?? "01";
        var plant = _configuration["SapLabPosting:UsageDecision:Plant"] ?? "2010";
        var codeGroup = _configuration["SapLabPosting:UsageDecision:CodeGroup"] ?? "01";
        var code = _configuration["SapLabPosting:UsageDecision:Code"] ?? "A";
        var forceCompletion = _configuration["SapLabPosting:UsageDecision:ForceCompletion"] ?? "X";

        if (string.IsNullOrWhiteSpace(inspectionLot))
        {
            throw new ValidationException(
                "The SAP inspection lot is missing for the selected record, so the SAP update could not be completed.",
                "SAP_INSPECTION_LOT_MISSING");
        }

        var characteristics = BuildCoalCharacteristics(data);
        if (characteristics.Count == 0)
        {
            throw new ValidationException("No coal lab values are available to post to SAP.", "SAP_CHARACTERISTICS_MISSING");
        }

        var payload = new
        {
            correlation_id = data.CoalId,
            source_system = "LIMS",
            inspection_lot = inspectionLot.Trim(),
            inspection_operation = inspectionOperation.Trim(),
            characteristics,
            usage_decision = new
            {
                selected_set = selectedSet.Trim(),
                plant = plant.Trim(),
                code_group = codeGroup.Trim(),
                code = code.Trim(),
                force_completion = forceCompletion.Trim(),
            },
        };

        var payloadJson = JsonSerializer.Serialize(payload);
        var payloadFilePath = Path.Combine(Path.GetTempPath(), $"sap-lims-{Guid.NewGuid():N}.json");
        await File.WriteAllTextAsync(payloadFilePath, payloadJson, cancellationToken);

        try
        {
            SapLimsPostResponseDto? lastResponse = null;

            for (var attempt = 1; attempt <= 3; attempt++)
            {
                var output = await ExecutePythonScriptAsync(
                    $"--mode post-lims-results --payload-file \"{EscapeCommandArgument(payloadFilePath)}\"",
                    cancellationToken,
                    BuildSapEnvironmentVariables(),
                    allowStructuredFailureOutput: true);

                var response = ParseSapLimsPostResponse(output);
                lastResponse = response;

                if (!HasSapLock(response) || response.Success)
                {
                    return response;
                }

                if (attempt < 3)
                {
                    _logger.LogWarning(
                        "SAP post lock detected for inspection lot {InspectionLot}. Retrying attempt {Attempt}.",
                        inspectionLot,
                        attempt + 1);
                    await Task.Delay(TimeSpan.FromSeconds(attempt * 2), cancellationToken);
                }
            }

            return lastResponse ?? throw new DependencyFailureException("SAP did not return a usable response.", "SAP_EMPTY_RESPONSE");
        }
        finally
        {
            try
            {
                File.Delete(payloadFilePath);
            }
            catch
            {
            }
        }
        }
        finally
        {
            SapPostingSemaphore.Release();
        }
    }

    private async Task<string> ExecutePythonScriptAsync(
        string args,
        CancellationToken cancellationToken,
        IReadOnlyDictionary<string, string?>? environmentVariables = null,
        bool allowStructuredFailureOutput = false)
    {
        if (!File.Exists(_scriptPath))
        {
            throw new DependencyFailureException("The SAP integration script is unavailable.", "SAP_SCRIPT_NOT_FOUND");
        }

        var start = new ProcessStartInfo
        {
            FileName = "python",
            Arguments = $"\"{_scriptPath}\" {args}",
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true,
            WorkingDirectory = Path.GetDirectoryName(_scriptPath),
        };

        if (environmentVariables is not null)
        {
            foreach (var pair in environmentVariables)
            {
                if (!string.IsNullOrWhiteSpace(pair.Value))
                {
                    start.Environment[pair.Key] = pair.Value;
                }
            }
        }

        using var process = Process.Start(start);
        if (process is null)
        {
            throw new DependencyFailureException("The SAP integration service could not be started.", "SAP_PROCESS_START_FAILED");
        }

        var timeoutSeconds = Math.Max(_configuration.GetValue<int?>("SapPython:TimeoutSeconds") ?? 60, 1);
        using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        linkedCts.CancelAfter(TimeSpan.FromSeconds(timeoutSeconds));

        var outputTask = process.StandardOutput.ReadToEndAsync();
        var errorTask = process.StandardError.ReadToEndAsync();

        try
        {
            await process.WaitForExitAsync(linkedCts.Token);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            try
            {
                if (!process.HasExited)
                {
                    process.Kill(entireProcessTree: true);
                }
            }
            catch (Exception killException)
            {
                _logger.LogWarning(killException, "Failed to stop timed out SAP python process.");
            }

            _logger.LogWarning("SAP Python script timed out after {TimeoutSeconds} seconds.", timeoutSeconds);
            throw new DependencyTimeoutException("The SAP service took too long to respond. Please try again.", "SAP_TIMEOUT");
        }

        var output = await outputTask;
        var error = await errorTask;

        if (process.ExitCode != 0)
        {
            if (allowStructuredFailureOutput && LooksLikeJsonObject(output))
            {
                return output;
            }

            _logger.LogError(
                "SAP Python script failed with exit code {ExitCode}. Error: {Error}. Output: {Output}",
                process.ExitCode,
                error,
                output);

            throw new DependencyFailureException("The SAP integration request failed. Please try again.", "SAP_REQUEST_FAILED");
        }

        if (string.IsNullOrWhiteSpace(output))
        {
            return "{}";
        }

        return output;
    }
    private static string? TryExtractPythonErrorMessage(string output)
    {
        if (string.IsNullOrWhiteSpace(output))
        {
            return null;
        }

        try
        {
            using var doc = JsonDocument.Parse(output);
            if (doc.RootElement.ValueKind != JsonValueKind.Object)
            {
                return output.Trim();
            }

            if (doc.RootElement.TryGetProperty("message", out var messageProperty))
            {
                var message = messageProperty.GetString();
                if (!string.IsNullOrWhiteSpace(message))
                {
                    return message.Trim();
                }
            }

            if (doc.RootElement.TryGetProperty("errorCode", out var errorCodeProperty))
            {
                var errorCode = errorCodeProperty.GetString();
                if (!string.IsNullOrWhiteSpace(errorCode))
                {
                    return errorCode.Trim();
                }
            }

            return output.Trim();
        }
        catch (JsonException)
        {
            return output.Trim();
        }
    }

    private static bool LooksLikeJsonObject(string output)
    {
        if (string.IsNullOrWhiteSpace(output))
        {
            return false;
        }

        try
        {
            using var doc = JsonDocument.Parse(output);
            return doc.RootElement.ValueKind == JsonValueKind.Object;
        }
        catch (JsonException)
        {
            return false;
        }
    }

    private static bool HasSapLock(SapLimsPostResponseDto? response)
    {
        if (response is null)
        {
            return false;
        }

        if (!string.IsNullOrWhiteSpace(response.Message) &&
            response.Message.Contains("lock", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        return response.SapMessagesReadable.Any((message) =>
            message.Contains("blocked by user", StringComparison.OrdinalIgnoreCase) ||
            message.Contains("locked by user", StringComparison.OrdinalIgnoreCase) ||
            message.Contains("QI/104", StringComparison.OrdinalIgnoreCase));
    }

    private static string EscapeCommandArgument(string value) =>
        string.IsNullOrEmpty(value) ? string.Empty : value.Replace("\\", "\\\\").Replace("\"", "\\\"");

    private IReadOnlyDictionary<string, string?> BuildSapEnvironmentVariables()
    {
        return new Dictionary<string, string?>
        {
            ["SAP_USER"] = _configuration["SAP:User"],
            ["SAP_PASSWD"] = _configuration["SAP:Password"],
            ["SAP_ASHOST"] = _configuration["SAP:AppServerHost"],
            ["SAP_SYSNR"] = _configuration["SAP:SystemNumber"],
            ["SAP_CLIENT"] = _configuration["SAP:Client"],
            ["SAP_LANG"] = _configuration["SAP:Language"] ?? "EN",
            ["SAP_PYTHON_LOG_STDERR"] = "false",
        };
    }

    private static List<object> BuildCoalCharacteristics(RawMaterialCoal data)
    {
        var characteristics = new List<object>();

        void AddCharacteristic(string inspChar, string parameterName, double? value)
        {
            if (!value.HasValue) return;

            characteristics.Add(new
            {
                inspchar = inspChar,
                evaluation = "A",
                mean_value = value.Value.ToString("0.###", System.Globalization.CultureInfo.InvariantCulture),
                original_input = value.Value.ToString("0.###", System.Globalization.CultureInfo.InvariantCulture),
                parameter_name = parameterName,
            });
        }

        AddCharacteristic("150", "-3 mm", data.Minus3mm);
        AddCharacteristic("140", "-4 mm", data.Minus4mm);
        AddCharacteristic("130", "-6 mm", data.Minus6mm);
        AddCharacteristic("120", "Stones", data.Stones);
        AddCharacteristic("110", "C Shale", data.Cshale);
        AddCharacteristic("100", "IM", data.Im);
        AddCharacteristic("90", "TM", data.Tm);
        AddCharacteristic("80", "VM", data.Vm);
        AddCharacteristic("70", "ASH", data.Ash);
        AddCharacteristic("60", "FC", data.Fcdb);
        AddCharacteristic("50", "SULPHUR", data.SulphurPct);
        AddCharacteristic("40", "STD FC", data.Fcadb);
        AddCharacteristic("30", "GCV ARB", data.Gcvarb);
        AddCharacteristic("20", "GCV ADB", data.Gcvadb);

        return characteristics;
    }

    private static SapLimsPostResponseDto ParseSapLimsPostResponse(string output)
    {
        using var root = ParseObject(output, "SAP LIMS post output is not a JSON object.");
        var element = root.RootElement;
        return new SapLimsPostResponseDto
        {
            Success = ExtractBoolean(element, "success"),
            CorrelationId = ExtractString(element, "correlation_id"),
            InspectionLot = ExtractString(element, "inspection_lot"),
            InspectionOperation = ExtractString(element, "inspection_operation"),
            ResultsPosted = ExtractBoolean(element, "results_posted"),
            UsageDecisionPosted = ExtractBoolean(element, "usage_decision_posted"),
            Message = ExtractString(element, "message"),
            ErrorCode = ExtractString(element, "error_code"),
            SapMessagesReadable = ExtractStringArray(element, "sap_messages_readable"),
        };
    }

    private static IReadOnlyList<SapMaterialDto> ParseMaterials(string output)
    {
        try
        {
            using var doc = JsonDocument.Parse(output);
            if (doc.RootElement.ValueKind != JsonValueKind.Array)
            {
                throw new InvalidOperationException("SAP output is not a JSON array.");
            }

            var result = new List<SapMaterialDto>();
            foreach (var item in doc.RootElement.EnumerateArray())
            {
                if (item.ValueKind == JsonValueKind.Object)
                {
                    if (item.TryGetProperty("MaterialNumber", out var materialProperty) ||
                        item.TryGetProperty("materialNumber", out materialProperty) ||
                        item.TryGetProperty("MATNR", out materialProperty))
                    {
                        var materialNumber = materialProperty.GetString();
                        if (!string.IsNullOrWhiteSpace(materialNumber))
                        {
                            result.Add(new SapMaterialDto { MaterialNumber = materialNumber.Trim() });
                        }
                    }
                }
                else if (item.ValueKind == JsonValueKind.String)
                {
                    var materialNumber = item.GetString();
                    if (!string.IsNullOrWhiteSpace(materialNumber))
                    {
                        result.Add(new SapMaterialDto { MaterialNumber = materialNumber.Trim() });
                    }
                }
            }

            return result;
        }
        catch (JsonException ex)
        {
            throw new InvalidOperationException("Invalid JSON returned by SAP python script.", ex);
        }
    }

    private static IReadOnlyList<string> ParseTruckNumbers(string output)
    {
        try
        {
            using var doc = JsonDocument.Parse(output);
            if (doc.RootElement.ValueKind != JsonValueKind.Array)
            {
                throw new InvalidOperationException("SAP output is not a JSON array.");
            }

            var result = new List<string>();
            foreach (var item in doc.RootElement.EnumerateArray())
            {
                string? truckNo = null;

                if (item.ValueKind == JsonValueKind.String)
                {
                    truckNo = item.GetString();
                }
                else if (item.ValueKind == JsonValueKind.Object)
                {
                    if (item.TryGetProperty("truckNo", out var truckProperty) ||
                        item.TryGetProperty("TruckNo", out truckProperty) ||
                        item.TryGetProperty("TRUCK_NO", out truckProperty))
                    {
                        truckNo = truckProperty.GetString();
                    }
                }

                if (!string.IsNullOrWhiteSpace(truckNo))
                {
                    result.Add(truckNo.Trim());
                }
            }

            return result.Distinct(StringComparer.OrdinalIgnoreCase).ToList();
        }
        catch (JsonException ex)
        {
            throw new InvalidOperationException("Invalid JSON returned by SAP python script.", ex);
        }
    }

    private static SapRawMaterialLookupsDto ParseRawMaterialLookups(string output)
    {
        using var root = ParseObject(output, "SAP lookup output is not a JSON object.");
        return new SapRawMaterialLookupsDto
        {
            Dates = ExtractStringArray(root.RootElement, "dates"),
            Errors = ExtractStringDictionary(root.RootElement, "errors"),
        };
    }

    private static SapTruckLookupDto ParseTruckLookup(string output)
    {
        using var root = ParseObject(output, "SAP truck lookup output is not a JSON object.");
        return new SapTruckLookupDto
        {
            TruckNumbers = ExtractStringArray(root.RootElement, "truckNumbers"),
            Errors = ExtractStringDictionary(root.RootElement, "errors"),
        };
    }

    private static SapRawMaterialRecordDto ParseRawMaterialRecord(string output)
    {
        using var root = ParseObject(output, "SAP raw material record output is not a JSON object.");
        var element = root.RootElement;
        return new SapRawMaterialRecordDto
        {
            Found = ExtractBoolean(element, "found"),
            Date = ExtractString(element, "date"),
            TruckNo = ExtractString(element, "truckNo"),
            InspectionLot = ExtractString(element, "inspectionLot"),
            Transporter = ExtractString(element, "transporter"),
            PartyName = ExtractString(element, "partyName"),
            PoNumber = ExtractString(element, "poNumber"),
            MaterialCode = ExtractString(element, "materialCode"),
            GateNumber = ExtractString(element, "gateNumber"),
            Quantity = ExtractString(element, "quantity"),
            Errors = ExtractStringDictionary(element, "errors"),
        };
    }

    private static JsonDocument ParseObject(string output, string invalidFormatMessage)
    {
        try
        {
            var doc = JsonDocument.Parse(output);
            if (doc.RootElement.ValueKind != JsonValueKind.Object)
            {
                doc.Dispose();
                throw new InvalidOperationException(invalidFormatMessage);
            }

            return doc;
        }
        catch (JsonException ex)
        {
            throw new InvalidOperationException("Invalid JSON returned by SAP python script.", ex);
        }
    }

    private static string? ExtractString(JsonElement root, string propertyName)
    {
        if (!root.TryGetProperty(propertyName, out var value))
        {
            return null;
        }

        return value.ValueKind switch
        {
            JsonValueKind.String => value.GetString(),
            JsonValueKind.Number => value.GetRawText(),
            JsonValueKind.True => "true",
            JsonValueKind.False => "false",
            _ => null,
        };
    }

    private static bool ExtractBoolean(JsonElement root, string propertyName)
    {
        if (!root.TryGetProperty(propertyName, out var value))
        {
            return false;
        }

        if (value.ValueKind == JsonValueKind.True) return true;
        if (value.ValueKind == JsonValueKind.False) return false;
        if (value.ValueKind == JsonValueKind.String && bool.TryParse(value.GetString(), out var parsed)) return parsed;
        return false;
    }

    private static IReadOnlyList<string> ExtractStringArray(JsonElement root, string propertyName)
    {
        if (!root.TryGetProperty(propertyName, out var arr) || arr.ValueKind != JsonValueKind.Array)
        {
            return Array.Empty<string>();
        }

        var values = new List<string>();
        foreach (var item in arr.EnumerateArray())
        {
            if (item.ValueKind == JsonValueKind.String)
            {
                var value = item.GetString();
                if (!string.IsNullOrWhiteSpace(value))
                {
                    values.Add(value.Trim());
                }
            }
        }

        return values.Distinct(StringComparer.OrdinalIgnoreCase).ToList();
    }

    private static IReadOnlyDictionary<string, string> ExtractStringDictionary(JsonElement root, string propertyName)
    {
        if (!root.TryGetProperty(propertyName, out var obj) || obj.ValueKind != JsonValueKind.Object)
        {
            return new Dictionary<string, string>();
        }

        var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var property in obj.EnumerateObject())
        {
            var value = property.Value.ValueKind == JsonValueKind.String
                ? property.Value.GetString()
                : property.Value.GetRawText();

            if (!string.IsNullOrWhiteSpace(value))
            {
                result[property.Name] = value.Trim();
            }
        }

        return result;
    }
}




