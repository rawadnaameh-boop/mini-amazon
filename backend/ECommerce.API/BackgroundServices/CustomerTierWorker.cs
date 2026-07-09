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
                var client = _httpClientFactory.CreateClient("MLService");

                // 🆕 1. Fetch using the new wrapper DTO instead of a raw List
                var response = await client.GetFromJsonAsync<MlCustomerSegmentResponseDto>(
                    "customer-segments", stoppingToken);

                // 🆕 2. Read the elements out of the response data list
                if (response != null && response.Status == "success" && response.Data.Any())
                {
                    using var scope = _scopeFactory.CreateScope();
                    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                    _logger.LogInformation("[AI-Sync] Processing {Count} profiles from ML service.", response.Data.Count);

                    foreach (var segment in response.Data)
                    {
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

                    await dbContext.SaveChangesAsync(stoppingToken);
                    _logger.LogInformation("[AI-Sync] Database successfully synchronized with behavioral tiers.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AI-Sync] Error occurred while running background tier updates.");
            }

            _logger.LogInformation("[AI-Sync] Pipeline complete. Sleeping for 24 hours.");
            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }
}