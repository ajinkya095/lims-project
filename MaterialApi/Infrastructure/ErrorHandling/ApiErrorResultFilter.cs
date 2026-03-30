using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace MaterialApi.Infrastructure.ErrorHandling;

public sealed class ApiErrorResultFilter : IAsyncAlwaysRunResultFilter
{
    public Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
    {
        var result = context.Result;
        var traceId = context.HttpContext.TraceIdentifier;

        switch (result)
        {
            case ObjectResult objectResult when (objectResult.StatusCode ?? context.HttpContext.Response.StatusCode) >= StatusCodes.Status400BadRequest:
            {
                var statusCode = objectResult.StatusCode ?? context.HttpContext.Response.StatusCode;
                objectResult.StatusCode = statusCode;
                objectResult.Value = ApiErrorResponseFactory.CreateFromResult(statusCode, objectResult.Value, traceId);
                break;
            }
            case StatusCodeResult statusCodeResult when statusCodeResult.StatusCode >= StatusCodes.Status400BadRequest:
            {
                context.Result = new ObjectResult(ApiErrorResponseFactory.Create(statusCodeResult.StatusCode, traceId: traceId))
                {
                    StatusCode = statusCodeResult.StatusCode,
                };
                break;
            }
        }

        return next();
    }
}
