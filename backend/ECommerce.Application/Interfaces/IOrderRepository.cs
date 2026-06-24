using ECommerce.Application.DTOs;
using ECommerce.Domain.Entities;

namespace ECommerce.Application.Interfaces;

public interface IOrderRepository
{
    // This single method owns the entire ACID transaction.
    Task<Order> PlaceOrderAsync(int userId, CheckoutRequestDto shipping);
    Task<Order?> GetByIdAsync(int id);
}