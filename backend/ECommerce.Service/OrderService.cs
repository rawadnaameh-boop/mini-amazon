 using ECommerce.Application.DTOs;
using ECommerce.Application.Exceptions;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;

namespace ECommerce.Service;

public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepository;
    public OrderService(IOrderRepository orderRepository) => _orderRepository = orderRepository;

    public async Task<OrderResultDto> CheckoutAsync(int userId, CheckoutRequestDto request)
    {
        var order = await _orderRepository.PlaceOrderAsync(userId, request);
        return ToDto(order);
    }

    public async Task<OrderResultDto> GetOrderAsync(int orderId)
    {
        var order = await _orderRepository.GetByIdAsync(orderId)
            ?? throw new OrderNotFoundException(orderId);
        return ToDto(order);
    }

    private static OrderResultDto ToDto(Order order) => new()
    {
        OrderId = order.Id,
        CreateAtUtc = order.CreateAtUtc,
        TotalAmount = order.TotalAmount,
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
