using ECommerce.Application.DTOs;
using ECommerce.Application.Exceptions;
using ECommerce.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    public OrdersController(IOrderService orderService) => _orderService = orderService;

    // POST /api/orders/checkout?userId=1
    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromQuery] int userId, [FromBody] CheckoutRequestDto request)
    {
        try
        {
            var order = await _orderService.CheckoutAsync(userId, request);
            return CreatedAtAction(nameof(GetById), new { id = order.OrderId }, order);
        }
        catch (CartEmptyException ex) { return BadRequest(new { message = ex.Message }); }
        catch (ProductNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InsufficientStockException ex) { return Conflict(new { message = ex.Message }); }
    }

    // GET /api/orders/5
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            return Ok(await _orderService.GetOrderAsync(id));
        }
        catch (OrderNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }
}
