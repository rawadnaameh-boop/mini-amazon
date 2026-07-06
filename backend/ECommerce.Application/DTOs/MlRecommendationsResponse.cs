using System.Text.Json.Serialization;

namespace ECommerce.Application.DTOs;

public class MlRecommendationsResponse
{
    [JsonPropertyName("product_id")]
    public int ProductId { get; set; }

    [JsonPropertyName("recommended_product_ids")]
    public List<int> RecommendedProductIds { get; set; } = new();
}