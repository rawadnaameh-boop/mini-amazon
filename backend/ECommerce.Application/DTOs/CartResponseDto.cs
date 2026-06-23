using System.Collections.Generic;

namespace ECommerce.Application.DTOs;

// 1. For incoming requests when a user clicks "Add to Cart"
public class AddToCartDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}

// 2. For incoming requests when a user increments/decrements quantity
public class UpdateCartItemDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}

// 3. For outgoing responses sent to your Next.js frontend
public class CartResponseDto
{
    public int CartId { get; set; }
    public List<CartItemDisplayDto> Items { get; set; } = new();
    public decimal CartTotal { get; set; }
}

public class CartItemDisplayDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal TotalItemPrice => UnitPrice * Quantity;
}