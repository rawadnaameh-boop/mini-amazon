using ECommerce.Application.DTOs;
using Microsoft.Extensions.Logging;
using System.Net.Http.Json;

namespace ECommerce.Service;

public class MlRecommendationClient
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<MlRecommendationClient> _logger;

    public MlRecommendationClient(
        IHttpClientFactory httpClientFactory,
        ILogger<MlRecommendationClient> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<List<int>> GetRecommendedProductIdsAsync(
        int productId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var client = _httpClientFactory.CreateClient("MLService");

            var response = await client.GetAsync(
                $"/recommendations/{productId}",
                cancellationToken
            );

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "ML service returned {StatusCode} for product {ProductId}",
                    response.StatusCode,
                    productId
                );

                return new List<int>();
            }

            var result = await response.Content.ReadFromJsonAsync<MlRecommendationsResponse>(
                cancellationToken: cancellationToken
            );

            return result?.RecommendedProductIds ?? new List<int>();
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to call ML recommendation service for product {ProductId}",
                productId
            );

            return new List<int>();
        }
    }
}