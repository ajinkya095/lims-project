using MaterialApi;
using MaterialApi.Infrastructure.ErrorHandling;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<ApiErrorResultFilter>();

builder.Services.AddControllers(options =>
    {
        options.Filters.AddService<ApiErrorResultFilter>();
    })
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var response = ApiErrorResponseFactory.Create(
            StatusCodes.Status400BadRequest,
            "Invalid input data. Please review the submitted fields and try again.",
            "INVALID_INPUT",
            context.HttpContext.TraceIdentifier);

        return new BadRequestObjectResult(response);
    };
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://localhost:5173", "http://192.168.3.45:5173")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var jwtSettings = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSettings["Key"];
if (string.IsNullOrEmpty(jwtKey))
{
    throw new InvalidOperationException("JWT Key is not configured");
}

var key = Encoding.UTF8.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };

    options.Events = new JwtBearerEvents
    {
        OnChallenge = async context =>
        {
            context.HandleResponse();
            await WriteErrorResponseAsync(context.Response, StatusCodes.Status401Unauthorized, "Authentication is required to access this resource.", "AUTH_REQUIRED", context.HttpContext.TraceIdentifier);
        },
        OnForbidden = async context =>
        {
            await WriteErrorResponseAsync(context.Response, StatusCodes.Status403Forbidden, "You do not have permission to perform this action.", "ACCESS_DENIED", context.HttpContext.TraceIdentifier);
        }
    };
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseOracle(builder.Configuration.GetConnectionString("OracleDb")));

builder.Services.AddScoped<SapPythonService>();

var app = builder.Build();
var lifecycleLogger = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("MaterialApiLifecycle");

AppDomain.CurrentDomain.UnhandledException += (_, eventArgs) =>
{
    if (eventArgs.ExceptionObject is Exception exception)
    {
        lifecycleLogger.LogCritical(exception, "A process-level unhandled exception occurred. IsTerminating: {IsTerminating}", eventArgs.IsTerminating);
    }
    else
    {
        lifecycleLogger.LogCritical("A process-level unhandled exception occurred with a non-exception payload. IsTerminating: {IsTerminating}", eventArgs.IsTerminating);
    }
};

TaskScheduler.UnobservedTaskException += (_, eventArgs) =>
{
    lifecycleLogger.LogError(eventArgs.Exception, "An unobserved background task exception was captured.");
    eventArgs.SetObserved();
};

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseStatusCodePages(async statusCodeContext =>
{
    var response = statusCodeContext.HttpContext.Response;
    if (response.HasStarted || response.StatusCode < StatusCodes.Status400BadRequest)
    {
        return;
    }

    if (response.ContentLength is > 0)
    {
        return;
    }

    await WriteErrorResponseAsync(response, response.StatusCode, null, null, statusCodeContext.HttpContext.TraceIdentifier);
});

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowReact");
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

static Task WriteErrorResponseAsync(HttpResponse response, int statusCode, string? message, string? errorCode, string traceId)
{
    response.StatusCode = statusCode;
    response.ContentType = "application/json";

    var payload = ApiErrorResponseFactory.Create(statusCode, message, errorCode, traceId);
    return response.WriteAsJsonAsync(payload);
}

