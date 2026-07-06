using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces;

public interface IProductService
{
    Task<List<ProductDto>> GetAllProductsAsync();
    Task<ProductDto?> GetProductByIdAsync(int id);
    Task<ProductDetailsDto?> GetByIdWithRecommendationsAsync(
    int id,
    CancellationToken cancellationToken = default);
}