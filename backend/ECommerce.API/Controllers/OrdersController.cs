using ECommerce.Application.DTOs;
using ECommerce.Application.Exceptions;
using ECommerce.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    public OrdersController(IOrderService orderService) => _orderService = orderService;

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromQuery] int userId, [FromBody] CheckoutRequestDto request)
    {
        try
        {
            var order = await _orderService.CheckoutAsync(userId, request);
            return CreatedAtAction(nameof(GetById), new { id = order.OrderId, userId = userId }, order);
        }
        catch (CartEmptyException ex) { return BadRequest(new { message = ex.Message }); }
        catch (ProductNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InsufficientStockException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpGet]
    public async Task<IActionResult> GetMyOrders([FromQuery] int userId = 1)
    {
        var orders = await _orderService.GetUserOrderHistoryAsync(userId);
        return Ok(orders);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, [FromQuery] int userId = 1)
    {
        var order = await _orderService.GetOrderAsync(id, userId);

        if (order == null)
        {
            return NotFound(new { message = $"Order #{id} not found or access denied." });
        }

        return Ok(order);
    }
}