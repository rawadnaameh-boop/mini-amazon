using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using ECommerce.Infrastructure.Persistence;
using ECommerce.Application.DTOs;

namespace ECommerce.API.BackgroundServices
{
    public class PricingBackgroundWorker : BackgroundService
    {
        private readonly IHttpClientFactory _httpClientFactory; // 🆕 Swapped to Factory
        private readonly ILogger<PricingBackgroundWorker> _logger;
        private readonly IServiceScopeFactory _scopeFactory;

        public PricingBackgroundWorker(
            IHttpClientFactory httpClientFactory, // 🆕 Inject factory instead of raw client
            ILogger<PricingBackgroundWorker> logger,
            IServiceScopeFactory scopeFactory)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Dynamic Pricing Background Worker has started.");

            // Loop every 15 seconds for verification testing
            using PeriodicTimer timer = new(TimeSpan.FromHours(1));

            while (await timer.WaitForNextTickAsync(stoppingToken) && !stoppingToken.IsCancellationRequested)
            {
                try
                {
                    _logger.LogInformation("Fetching optimized prices from Python ML engine...");

                    // 🆕 Create the client using your existing "MLService" configuration from Program.cs
                    var httpClient = _httpClientFactory.CreateClient("MLService");

                    var response = await httpClient.GetFromJsonAsync<MlPricingResponseDto>("optimize-prices", stoppingToken);

                    if (response != null && response.Status == "success" && response.Data != null)
                    {
                        _logger.LogInformation("Successfully received {Count} optimized prices from ML service.", response.Data.Count);

                        using var scope = _scopeFactory.CreateScope();
                        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                        foreach (var item in response.Data)
                        {
                            _logger.LogInformation("Updating Product ID: {Id} ({Name}) to Optimized Price: {OptPrice}",
                                item.ProductId, item.ProductName, item.OptimizedPrice);

                            string updateQuery = "UPDATE Products SET Price = {0} WHERE Id = {1}";
                            int rowsUpdated = await dbContext.Database.ExecuteSqlRawAsync(updateQuery, item.OptimizedPrice, item.ProductId);

                            if (rowsUpdated > 0)
                            {
                                _logger.LogInformation("Successfully saved new price for Product ID {Id} in database.", item.ProductId);
                            }
                            else
                            {
                                _logger.LogWarning("Product ID {Id} was not found in the database. No price updated.", item.ProductId);
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred during the pricing optimization loop.");
                }
            }
        }
    }
}