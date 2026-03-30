namespace MaterialApi.Infrastructure.ErrorHandling;

public abstract class ApiException : Exception
{
    protected ApiException(int statusCode, string userMessage, string errorCode, Exception? innerException = null)
        : base(userMessage, innerException)
    {
        StatusCode = statusCode;
        UserMessage = userMessage;
        ErrorCode = errorCode;
    }

    public int StatusCode { get; }
    public string UserMessage { get; }
    public string ErrorCode { get; }
}

public sealed class ValidationException : ApiException
{
    public ValidationException(string userMessage, string errorCode = "VALIDATION_ERROR", Exception? innerException = null)
        : base(StatusCodes.Status400BadRequest, userMessage, errorCode, innerException) { }
}

public sealed class AuthenticationException : ApiException
{
    public AuthenticationException(string userMessage = "Authentication is required to access this resource.", string errorCode = "AUTH_REQUIRED", Exception? innerException = null)
        : base(StatusCodes.Status401Unauthorized, userMessage, errorCode, innerException) { }
}

public sealed class AuthorizationException : ApiException
{
    public AuthorizationException(string userMessage = "You do not have permission to perform this action.", string errorCode = "ACCESS_DENIED", Exception? innerException = null)
        : base(StatusCodes.Status403Forbidden, userMessage, errorCode, innerException) { }
}

public sealed class ResourceNotFoundException : ApiException
{
    public ResourceNotFoundException(string userMessage, string errorCode = "RESOURCE_NOT_FOUND", Exception? innerException = null)
        : base(StatusCodes.Status404NotFound, userMessage, errorCode, innerException) { }
}

public sealed class ConflictException : ApiException
{
    public ConflictException(string userMessage, string errorCode = "RESOURCE_CONFLICT", Exception? innerException = null)
        : base(StatusCodes.Status409Conflict, userMessage, errorCode, innerException) { }
}

public sealed class DependencyFailureException : ApiException
{
    public DependencyFailureException(string userMessage = "A dependent service is temporarily unavailable. Please try again shortly.", string errorCode = "DEPENDENCY_FAILURE", Exception? innerException = null)
        : base(StatusCodes.Status503ServiceUnavailable, userMessage, errorCode, innerException) { }
}

public sealed class DependencyTimeoutException : ApiException
{
    public DependencyTimeoutException(string userMessage = "A dependent service took too long to respond. Please try again.", string errorCode = "DEPENDENCY_TIMEOUT", Exception? innerException = null)
        : base(StatusCodes.Status504GatewayTimeout, userMessage, errorCode, innerException) { }
}
