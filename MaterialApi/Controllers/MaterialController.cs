using MaterialApi.Infrastructure.ErrorHandling;
using Microsoft.AspNetCore.Mvc;

namespace MaterialApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MaterialController : ControllerBase
{
    [HttpGet("{type}")]
    public IActionResult GetFields(string type)
    {
        if (string.IsNullOrWhiteSpace(type))
        {
            throw new ValidationException("Material type is required.", "MATERIAL_TYPE_REQUIRED");
        }

        var fields = type.Trim().ToLowerInvariant() switch
        {
            "coal" => new[] { "Moisture", "Ash", "VM", "FC", "Sulphur" },
            "ironore" => new[] { "Fe", "Silica", "Alumina", "LOI" },
            "pellets" => new[] { "CCS", "Tumbler", "Abrasion" },
            "dolomite" => new[] { "CaO", "MgO", "Silica" },
            _ => throw new ResourceNotFoundException("Material type not found.", "MATERIAL_TYPE_NOT_FOUND")
        };

        return Ok(fields);
    }

    [HttpPost("save")]
    public async Task<IActionResult> SaveEntry([FromBody] List<MaterialEntry> entries, [FromServices] AppDbContext context)
    {
        if (entries == null || entries.Count == 0)
        {
            throw new ValidationException("No material data was provided.", "MATERIAL_DATA_REQUIRED");
        }

        context.MaterialEntries.AddRange(entries);
        await context.SaveChangesAsync();

        return Ok(new { message = "Data saved successfully to Oracle." });
    }
}
