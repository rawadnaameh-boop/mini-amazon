using System;
using System.Linq;
using System.Threading.Tasks;
using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;

namespace ECommerce.Service;

public class CartService : ICartService
{
    private readonly ICartRepository _cartRepository;
    private readonly IProductRepository _productRepository;

    // constructor injection: We ask for our database contracts blindly
    public CartService(ICartRepository cartRepository, IProductRepository productRepository)
    {
        _cartRepository = cartRepository;
        _productRepository = productRepository;
    }

    public async Task<CartResponseDto> AddItemToCartAsync(int userId, AddToCartDto dto)
    {
        // 1. SECURITY & VALIDATION: Fetch the authentic master product details from DB
        var product = await _productRepository.GetByIdAsync(dto.ProductId);
        if (product == null)
        {
            throw new Exception("Product not found.");
        }

        // CRUCIAL BUSINESS LOGIC: Intercept and reject if stock is insufficient
        if (dto.Quantity > product.StockQuantity)
        {
            throw new InvalidOperationException("ITEM_SOLD_OUT");
        }

        // 2. Fetch the user's existing cart, or spin up a new one if it's their first item
        var cart = await _cartRepository.GetByUserIdAsync(userId);
        if (cart == null)
        {
            cart = new Cart { UserId = userId };
            await _cartRepository.CreateAsync(cart);
        }

        // 3. Check if this exact product is already sitting in the cart
        var existingItem = cart.CartItems.FirstOrDefault(ci => ci.ProductId == dto.ProductId);

        if (existingItem != null)
        {
            // If it's already there, ensure the combined new quantity doesn't exceed warehouse stock
            if (existingItem.Quantity + dto.Quantity > product.StockQuantity)
            {
                throw new InvalidOperationException("ITEM_SOLD_OUT");
            }
            existingItem.Quantity += dto.Quantity;
        }
        else
        {
            // If it's a fresh item, attach it to the parent cart
            cart.CartItems.Add(new CartItem
            {
                ProductId = dto.ProductId,
                Quantity = dto.Quantity
            });
        }

        // 4. Commit changes to MySQL via the repository
        await _cartRepository.SaveChangesAsync();

        // 5. Map the results to our secure CartResponseDto and calculate totals server-side
        return MapToResponseDto(cart);
    }

    public async Task<CartResponseDto> GetCartByUserIdAsync(int userId)
    {
        var cart = await _cartRepository.GetByUserIdAsync(userId);
        if (cart == null)
        {
            return new CartResponseDto(); // Return an empty cart structure
        }

        return MapToResponseDto(cart);
    }

    // Helper Method: Securely calculates totals server-side using master database prices
    private CartResponseDto MapToResponseDto(Cart cart)
    {
        var response = new CartResponseDto
        {
            CartId = cart.Id,
            Items = cart.CartItems.Select(item => new CartItemDisplayDto
            {
                ProductId = item.ProductId,
                ProductName = item.Product.Name,     // Pulled safely via navigation property
                UnitPrice = item.Product.Price,     // Master price directly from teammate's entity
                Quantity = item.Quantity
            }).ToList()
        };

        // SERVER-SIDE GRAND TOTAL COMPUTATION
        response.CartTotal = response.Items.Sum(item => item.TotalItemPrice);

        return response;
    }

    public async Task<CartResponseDto> UpdateItemQuantityAsync(int userId, UpdateCartItemDto dto)
    {
        var cart = await _cartRepository.GetByUserIdAsync(userId)
            ?? throw new Exception("Cart not found.");

        var existingItem = cart.CartItems.FirstOrDefault(ci => ci.ProductId == dto.ProductId)
            ?? throw new Exception("Item not found in cart.");

        if (dto.Quantity <= 0)
        {
            cart.CartItems.Remove(existingItem);
        }
        else
        {
            var product = await _productRepository.GetByIdAsync(dto.ProductId)
                ?? throw new Exception("Product not found.");

            // CRUCIAL BUSINESS LOGIC: Intercept and reject if stock is insufficient
            if (dto.Quantity > product.StockQuantity)
            {
                throw new InvalidOperationException("ITEM_SOLD_OUT");
            }

            existingItem.Quantity = dto.Quantity;
        }

        await _cartRepository.SaveChangesAsync();
        return MapToResponseDto(cart);
    }

    public async Task<CartResponseDto> RemoveItemFromCartAsync(int userId, int productId)
    {
        var cart = await _cartRepository.GetByUserIdAsync(userId)
            ?? throw new Exception("Cart not found.");

        var existingItem = cart.CartItems.FirstOrDefault(ci => ci.ProductId == productId);
        if (existingItem != null)
        {
            cart.CartItems.Remove(existingItem);
            await _cartRepository.SaveChangesAsync();
        }

        return MapToResponseDto(cart);
    }
}