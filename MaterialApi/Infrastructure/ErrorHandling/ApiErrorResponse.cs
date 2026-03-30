namespace MaterialApi.Infrastructure.ErrorHandling;

public sealed record ApiErrorResponse(
    string Status,
    string Message,
    string? ErrorCode = null,
    string? TraceId = null);
