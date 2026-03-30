$p = 'C:\Users\Ajinkya\Desktop\New .net\MaterialApi\MaterialApi\Services\SapPythonService.cs'
$c = Get-Content $p -Raw

$pattern = '(?s)    private async Task<string> ExecutePythonScriptAsync\(.*?\n    }\n\n    private static string\? TryExtractPythonErrorMessage'
$replacement = @"
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

    private static string? TryExtractPythonErrorMessage
"@

$updated = [regex]::Replace($c, $pattern, $replacement)
Set-Content $p $updated
