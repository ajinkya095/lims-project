public sealed class SapLimsPostResponseDto
{
    public bool Success { get; init; }
    public string? CorrelationId { get; init; }
    public string? InspectionLot { get; init; }
    public string? InspectionOperation { get; init; }
    public bool ResultsPosted { get; init; }
    public bool UsageDecisionPosted { get; init; }
    public string? Message { get; init; }
    public string? ErrorCode { get; init; }
    public IReadOnlyList<string> SapMessagesReadable { get; init; } = Array.Empty<string>();
}
