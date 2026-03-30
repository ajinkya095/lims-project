public sealed class SapRawMaterialRecordDto
{
    public bool Found { get; init; }
    public string? Date { get; init; }
    public string? TruckNo { get; init; }
    public string? InspectionLot { get; init; }
    public string? Transporter { get; init; }
    public string? PartyName { get; init; }
    public string? PoNumber { get; init; }
    public string? MaterialCode { get; init; }
    public string? GateNumber { get; init; }
    public string? Quantity { get; init; }
    public IReadOnlyDictionary<string, string> Errors { get; init; } = new Dictionary<string, string>();
}
