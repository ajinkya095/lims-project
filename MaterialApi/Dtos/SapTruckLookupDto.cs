public sealed class SapTruckLookupDto
{
    public IReadOnlyList<string> TruckNumbers { get; init; } = Array.Empty<string>();
    public IReadOnlyDictionary<string, string> Errors { get; init; } = new Dictionary<string, string>();
}
