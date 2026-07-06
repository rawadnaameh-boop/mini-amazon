using System;
using System.Collections.Generic;
using System.Text;

namespace ECommerce.Application.DTOs;

    public class RecommendedProductDto
    {
    public int Id { get; set; }
    public string Sku { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? ImageUrl { get; set; }

    public decimal Price { get; set; }

    public int StockQuantity { get; set; }
    public bool IsInStock { get; set; }
}

