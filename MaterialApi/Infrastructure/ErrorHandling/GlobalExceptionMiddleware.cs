using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data.Common;
using System.Text.Json;

namespace MaterialApi.Infrastructure.ErrorHandling;

public sealed class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
        {
            _logger.LogInformation(
                "Request was cancelled by the client. TraceId: {TraceId}, Method: {Method}, Path: {Path}",
                context.TraceIdentifier,
                context.Request.Method,
                context.Request.Path);
        }
        catch (Exception exception)
        {
            await HandleExceptionAsync(context, exception);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, message, errorCode) = MapException(exception);

        using (_logger.BeginScope(new Dictionary<string, object?>
        {
            ["TraceId"] = context.TraceIdentifier,
            ["Method"] = context.Request.Method,
            ["Path"] = context.Request.Path.Value,
            ["QueryString"] = context.Request.QueryString.Value,
            ["RemoteIp"] = context.Connection.RemoteIpAddress?.ToString(),
            ["User"] = context.User.Identity?.Name,
            ["TimestampUtc"] = DateTimeOffset.UtcNow,
        }))
        {
            if (statusCode >= StatusCodes.Status500InternalServerError)
            {
                _logger.LogError(exception, "Unhandled server exception for request {Method} {Path}", context.Request.Method, context.Request.Path);
            }
            else
            {
                _logger.LogWarning(exception, "Request failed with a handled exception for {Method} {Path}", context.Request.Method, context.Request.Path);
            }
        }

        if (context.Response.HasStarted)
        {
            _logger.LogWarning("The response has already started, so the global error handler could not write a standardized response.");
            throw exception;
        }

        context.Response.Clear();
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        var response = ApiErrorResponseFactory.Create(statusCode, message, errorCode, context.TraceIdentifier);
        await context.Response.WriteAsJsonAsync(response);
    }

    private static (int StatusCode, string Message, string ErrorCode) MapException(Exception exception) => exception switch
    {
        ApiException apiException => (apiException.StatusCode, apiException.UserMessage, apiException.ErrorCode),
        BadHttpRequestException => (StatusCodes.Status400BadRequest, "Invalid request data was received.", "BAD_REQUEST"),
        JsonException => (StatusCodes.Status400BadRequest, "The request body contains invalid JSON.", "INVALID_JSON"),
        DbUpdateException => (StatusCodes.Status503ServiceUnavailable, "The database is temporarily unavailable. Please try again shortly.", "DATABASE_UNAVAILABLE"),
        DbException => (StatusCodes.Status503ServiceUnavailable, "The database is temporarily unavailable. Please try again shortly.", "DATABASE_UNAVAILABLE"),
        TimeoutException => (StatusCodes.Status504GatewayTimeout, "A dependent service took too long to respond. Please try again.", "DEPENDENCY_TIMEOUT"),
        TaskCanceledException => (StatusCodes.Status504GatewayTimeout, "A dependent service took too long to respond. Please try again.", "DEPENDENCY_TIMEOUT"),
        UnauthorizedAccessException => (StatusCodes.Status403Forbidden, "You do not have permission to perform this action.", "ACCESS_DENIED"),
        _ => (StatusCodes.Status500InternalServerError, "Something went wrong on our side. Please try again later.", "INTERNAL_SERVER_ERROR"),
    };
}

