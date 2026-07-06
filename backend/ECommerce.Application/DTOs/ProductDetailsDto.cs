namespace ECommerce.Application.DTOs;

public class ProductDetailsDto : ProductDto
{
    public List<RecommendedProductDto> Recommendations { get; set; } = new();
}