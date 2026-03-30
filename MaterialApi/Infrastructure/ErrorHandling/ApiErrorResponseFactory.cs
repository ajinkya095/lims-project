using Microsoft.AspNetCore.Mvc;
using System.Reflection;

namespace MaterialApi.Infrastructure.ErrorHandling;

public static class ApiErrorResponseFactory
{
    public static ApiErrorResponse Create(int statusCode, string? message = null, string? errorCode = null, string? traceId = null)
    {
        var status = statusCode >= StatusCodes.Status500InternalServerError ? "error" : "fail";
        var finalMessage = string.IsNullOrWhiteSpace(message) ? GetDefaultMessage(statusCode) : message;
        return new ApiErrorResponse(status, finalMessage, errorCode, traceId);
    }

    public static ApiErrorResponse CreateFromResult(int statusCode, object? value, string traceId)
    {
        if (value is ApiErrorResponse apiError)
        {
            return apiError with { TraceId = apiError.TraceId ?? traceId };
        }

        var message = statusCode >= StatusCodes.Status500InternalServerError ? null : ExtractMessage(value);
        var errorCode = statusCode >= StatusCodes.Status500InternalServerError ? null : ExtractErrorCode(value);
        return Create(statusCode, message, errorCode, traceId);
    }

    private static string? ExtractMessage(object? value)
    {
        if (value is null) return null;
        if (value is string text && !string.IsNullOrWhiteSpace(text)) return text;

        if (value is ValidationProblemDetails validationProblem)
        {
            var validationMessage = validationProblem.Errors.SelectMany(pair => pair.Value).FirstOrDefault(static item => !string.IsNullOrWhiteSpace(item));
            return string.IsNullOrWhiteSpace(validationMessage)
                ? "Invalid input data. Please review the submitted fields and try again."
                : validationMessage;
        }

        if (value is ProblemDetails problemDetails)
        {
            if (!string.IsNullOrWhiteSpace(problemDetails.Detail)) return problemDetails.Detail;
            if (!string.IsNullOrWhiteSpace(problemDetails.Title)) return problemDetails.Title;
        }

        return ReadStringProperty(value, "message", "Message", "detail", "Detail", "title", "Title");
    }

    private static string? ExtractErrorCode(object? value)
    {
        if (value is ApiErrorResponse apiError) return apiError.ErrorCode;
        return value is null ? null : ReadStringProperty(value, "errorCode", "ErrorCode", "error_code", "Error_Code");
    }

    private static string GetDefaultMessage(int statusCode) => statusCode switch
    {
        StatusCodes.Status400BadRequest => "Invalid input data. Please review the submitted fields and try again.",
        StatusCodes.Status401Unauthorized => "Authentication is required to access this resource.",
        StatusCodes.Status403Forbidden => "You do not have permission to perform this action.",
        StatusCodes.Status404NotFound => "The requested resource was not found.",
        StatusCodes.Status405MethodNotAllowed => "The requested operation is not allowed for this endpoint.",
        StatusCodes.Status409Conflict => "The request could not be completed because of a conflict.",
        StatusCodes.Status503ServiceUnavailable => "A required service is temporarily unavailable. Please try again shortly.",
        StatusCodes.Status504GatewayTimeout => "The request timed out while waiting for a dependent service.",
        _ => "Something went wrong on our side. Please try again later."
    };

    private static string? ReadStringProperty(object value, params string[] propertyNames)
    {
        var type = value.GetType();
        foreach (var propertyName in propertyNames)
        {
            var property = type.GetProperty(propertyName, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
            if (property?.PropertyType == typeof(string))
            {
                var propertyValue = property.GetValue(value) as string;
                if (!string.IsNullOrWhiteSpace(propertyValue)) return propertyValue;
            }
        }

        return null;
    }
}
