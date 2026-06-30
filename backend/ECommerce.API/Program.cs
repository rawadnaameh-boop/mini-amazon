using ECommerce.Infrastructure;
using ECommerce.Infrastructure.Persistence;
using ECommerce.Service;
using Microsoft.EntityFrameworkCore;
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