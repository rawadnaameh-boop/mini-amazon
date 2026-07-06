using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;

namespace ECommerce.Service;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly MlRecommendationClient _mlRecommendationClient;
    public ProductService(
    IProductRepository productRepository,
    MlRecommendationClient mlRecommendationClient)
    {
        _productRepository = productRepository;
        _mlRecommendationClient = mlRecommendationClient;
    }

    public async Task<List<ProductDto>> GetAllProductsAsync()
    {
        var products = await _productRepository.GetAllActiveAsync();
        return products.Select(ToDto).ToList();
    }

    public async Task<ProductDto?> GetProductByIdAsync(int id)
    {
        var product = await _productRepository.GetActiveByIdAsync(id);
        return product is null ? null : ToDto(product);
    }
    public async Task<ProductDetailsDto?> GetByIdWithRecommendationsAsync(
    int id,
    CancellationToken cancellationToken = default)
    {
        var product = await GetProductByIdAsync(id);

        if (product == null)
        {
            return null;
        }

        var recommendedIds =
            await _mlRecommendationClient.GetRecommendedProductIdsAsync(id, cancellationToken);

        var allProducts = await GetAllProductsAsync();

        var recommendedProducts = allProducts
            .Where(p => recommendedIds.Contains(p.Id) && p.Id != id && p.IsInStock)
            .ToList();

        var recommendedMap = recommendedProducts.ToDictionary(p => p.Id);

        var orderedRecommendations = recommendedIds
            .Where(recommendedMap.ContainsKey)
            .Select(recommendedId =>
            {
                var recommendedProduct = recommendedMap[recommendedId];

                return new RecommendedProductDto
                {
                    Id = recommendedProduct.Id,
                    Sku = recommendedProduct.Sku,
                    Name = recommendedProduct.Name,
                    ImageUrl = recommendedProduct.ImageUrl,
                    Price = recommendedProduct.Price,
                    StockQuantity = recommendedProduct.StockQuantity,
                    IsInStock = recommendedProduct.IsInStock
                };
            })
            .ToList();

        return new ProductDetailsDto
        {
            Id = product.Id,
            Sku = product.Sku,
            Name = product.Name,
            Description = product.Description,
            ImageUrl = product.ImageUrl,
            Price = product.Price,
            StockQuantity = product.StockQuantity,
            IsInStock = product.IsInStock,
            Recommendations = orderedRecommendations
        };
    }

    private static ProductDto ToDto(Product p) => new()
    {
        Id = p.Id,
        Sku = p.Sku,
        Name = p.Name,
        Description = p.Description,
        ImageUrl = p.ImageUrl,
        Price = p.Price,
        StockQuantity = p.StockQuantity,
        IsInStock = p.StockQuantity > 0
    };
}