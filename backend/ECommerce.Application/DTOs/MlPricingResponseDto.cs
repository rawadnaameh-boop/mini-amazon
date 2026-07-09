using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace ECommerce.Application.DTOs
{
    public class MlPricingResponseDto
    {
        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        [JsonPropertyName("source")]
        public string Source { get; set; } = string.Empty;

        [JsonPropertyName("data")]
        public List<OptimizedProductDto> Data { get; set; } = new();
    }

    public class OptimizedProductDto
    {
        [JsonPropertyName("product_id")]
        public int ProductId { get; set; }

        [JsonPropertyName("product_name")]
        public string ProductName { get; set; } = string.Empty;

        [JsonPropertyName("current_stock")]
        public int CurrentStock { get; set; }

        [JsonPropertyName("sales_velocity_24h")]
        public int SalesVelocity24h { get; set; }

        [JsonPropertyName("competitor_price")]
        public decimal CompetitorPrice { get; set; }

        [JsonPropertyName("optimized_price")]
        public decimal OptimizedPrice { get; set; }
    }
}