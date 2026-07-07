using System.Net.Http.Json;
using ECommerce.Application.DTOs;
using ECommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.BackgroundServices;

public class CustomerTierWorker : BackgroundService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<CustomerTierWorker> _logger;

    public CustomerTierWorker(
        IHttpClientFactory httpClientFactory,
        IServiceScopeFactory scopeFactory,
        ILogger<CustomerTierWorker> logger)
    {
        _httpClientFactory = httpClientFactory;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("[AI-Sync] Customer Tier pipeline initiated.");

            try
            {
                // 1. Leverage your existing named HTTP client setup
                var client = _httpClientFactory.CreateClient("MLService");

                // 2. Fetch the segments from the FastAPI endpoint
                var segments = await client.GetFromJsonAsync<List<CustomerSegmentDto>>(
                    "customer-segments", stoppingToken);

                if (segments != null && segments.Any())
                {
                    // 3. Create a scope to securely use your AppDbContext
                    using var scope = _scopeFactory.CreateScope();
                    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                    _logger.LogInformation("[AI-Sync] Processing {Count} profiles from ML service.", segments.Count);

                    // 4. Update matching users in your MySQL database
                    foreach (var segment in segments)
                    {
                        // Safely parse string "user_42" into integer 42 to match your DB schema
                        string cleanId = segment.UserId.Replace("user_", "");
                        if (int.TryParse(cleanId, out int numericId))
                        {
                            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == numericId, stoppingToken);
                            if (user != null)
                            {
                                user.CustomerTier = segment.Tier;
                            }
                        }
                    }

                    // 5. Commit updates
                    await dbContext.SaveChangesAsync(stoppingToken);
                    _logger.LogInformation("[AI-Sync] Database successfully synchronized with behavioral tiers.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AI-Sync] Error occurred while running background tier updates.");
            }

            // 6. Sleep for 24 hours before calculating customer groups again
            _logger.LogInformation("[AI-Sync] Pipeline complete. Sleeping for 24 hours.");
            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }
}