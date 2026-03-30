using MaterialApi.Infrastructure.ErrorHandling;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class SapController : ControllerBase
{
    private readonly SapPythonService _sapService;

    public SapController(SapPythonService sapService)
    {
        _sapService = sapService;
    }

    [HttpGet("test-sap")]
    public async Task<IActionResult> TestSap(CancellationToken cancellationToken)
    {
        var result = await _sapService.RunPythonScriptAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("truck-numbers")]
    public async Task<IActionResult> GetTruckNumbers(CancellationToken cancellationToken)
    {
        var result = await _sapService.RunTruckNumbersAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("raw-material-lookups")]
    public async Task<IActionResult> GetRawMaterialLookups(CancellationToken cancellationToken)
    {
        var result = await _sapService.RunRawMaterialLookupsAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("raw-material-trucks")]
    public async Task<IActionResult> GetRawMaterialTrucks([FromQuery] string? fromDate, [FromQuery] string? toDate, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(fromDate) || string.IsNullOrWhiteSpace(toDate))
        {
            throw new ValidationException("From date and to date are required.", "RAW_MATERIAL_DATES_REQUIRED");
        }

        var result = await _sapService.RunRawMaterialTruckLookupsAsync(fromDate, toDate, cancellationToken);
        return Ok(result);
    }

    [HttpGet("raw-material-record")]
    public async Task<IActionResult> GetRawMaterialRecord([FromQuery] string? fromDate, [FromQuery] string? toDate, [FromQuery] string? truckNo, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(fromDate) || string.IsNullOrWhiteSpace(toDate) || string.IsNullOrWhiteSpace(truckNo))
        {
            throw new ValidationException("From date, to date, and truck number are required.", "RAW_MATERIAL_LOOKUP_REQUIRED");
        }

        var result = await _sapService.RunRawMaterialRecordAsync(fromDate, toDate, truckNo, cancellationToken);
        return Ok(result);
    }
}
