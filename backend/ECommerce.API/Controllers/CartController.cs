using System;
using System.Threading.Tasks;
using ECommerce.Application.DTOs;
using ECommerce.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")] // This makes the base URL: api/cart
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    // Dependency Injection: The API asks for the service contract blindly
    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    // 1. GET: api/cart?userId=1
    // Used by the frontend to view the current cart and totals
    [HttpGet]
    public async Task<IActionResult> GetCart([FromQuery] int userId)
    {
        var cart = await _cartService.GetCartByUserIdAsync(userId);
        return Ok(cart);
    }

    // 2. POST: api/cart/add?userId=1
    // Used when a user clicks the "Add to Cart" button
    [HttpPost("add")]
    public async Task<IActionResult> AddToCart([FromQuery] int userId, [FromBody] AddToCartDto dto)
    {
        try
        {
            var updatedCart = await _cartService.AddItemToCartAsync(userId, dto);
            return Ok(updatedCart);
        }
        catch (InvalidOperationException ex) when (ex.Message == "ITEM_SOLD_OUT")
        {
            // CRUCIAL: Intercept the "Sold Out" validation rule and return a 400 Bad Request
            // with a distinct textual flag that Next.js can easily look for.
            return BadRequest(new { error = "ITEM_SOLD_OUT" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}