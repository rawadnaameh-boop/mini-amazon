using ECommerce.Application.DTOs;
using ECommerce.Application.Exceptions;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ECommerce.Service;

public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepository;
    public OrderService(IOrderRepository orderRepository) => _orderRepository = orderRepository;

    // 1. Handles Checkout Transaction
    public async Task<OrderResultDto> CheckoutAsync(int userId, CheckoutRequestDto request)
    {
        var order = await _orderRepository.PlaceOrderAsync(userId, request);
        return ToDto(order);
    }

    // 2. Fetch Deep-Dive Receipt with Ownership Security Check
    public async Task<OrderResultDto?> GetOrderAsync(int orderId, int userId)
    {
        var order = await _orderRepository.GetByIdAsync(orderId);

        // Security Check: If order doesn't exist or doesn't belong to this user, block access
        if (order == null || order.UserId != userId)
        {
            return null;
        }

        return ToDto(order);
    }

    // 3. Fetch Summary List for the "My Orders" History Page
    public async Task<IEnumerable<OrderResultDto>> GetUserOrderHistoryAsync(int userId)
    {
        var orders = await _orderRepository.GetByUserIdAsync(userId);
        return orders.Select(ToDto);
    }

    // 4. Historical Pricing Safe Mapper
    private static OrderResultDto ToDto(Order order) => new()
    {
        OrderId = order.Id,
        CreateAtUtc = order.CreateAtUtc,
        TotalAmount = order.TotalAmount,
        Status = order.Status, // 👈 ADD THIS LINE
        Items = order.OrderItems.Select(oi => new OrderItemResultDto
        {
            ProductId = oi.ProductId,
            ProductName = oi.ProductNameSnapshot,
            Quantity = oi.Quantity,
            UnitPrice = oi.UnitPriceSnapshot,
            LineTotal = oi.LineTotal,
        }).ToList()
    };
}