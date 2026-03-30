public sealed class SapRawMaterialLookupsDto
{
    public IReadOnlyList<string> Dates { get; init; } = Array.Empty<string>();
    public IReadOnlyDictionary<string, string> Errors { get; init; } = new Dictionary<string, string>();
}
