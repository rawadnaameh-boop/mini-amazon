using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;

namespace ECommerce.Service;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    public ProductService(IProductRepository productRepository) => _productRepository = productRepository;

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