using ECommerce.Infrastructure;
using ECommerce.Infrastructure.Persistence;
using ECommerce.Service;
using Microsoft.EntityFrameworkCore;
using ECommerce.API.BackgroundServices; // 🆕 Namespace for your new background worker

var builder = WebApplication.CreateBuilder(args);
const string FrontendCorsPolicy = "FrontendCors";

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddServices();

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var mlServiceUrl = builder.Configuration["ML_SERVICE_URL"] ?? "http://localhost:8000";

builder.Services.AddHttpClient("MLService", client =>
{
    client.BaseAddress = new Uri(mlServiceUrl);
    client.Timeout = TimeSpan.FromSeconds(5);
});

builder.Services.AddScoped<MlRecommendationClient>();

// 🆕 Register your new daily customer segmentation background task here
builder.Services.AddHostedService<CustomerTierWorker>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.Migrate();
    }
    catch (Exception ex)
    {
        Console.Error.WriteLine($"[Startup] Migration failed: {ex.Message}");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(FrontendCorsPolicy);
app.UseAuthorization();

app.MapGet("/api/health", () => Results.Ok(new { status = "Healthy" }));
app.MapControllers();

app.Run();