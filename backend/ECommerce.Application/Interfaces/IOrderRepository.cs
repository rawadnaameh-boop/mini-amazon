using ECommerce.Application.DTOs;
using ECommerce.Domain.Entities;
using System.Collections.Generic; // Required for IEnumerable
using System.Threading.Tasks;

namespace ECommerce.Application.Interfaces;

public interface IOrderRepository
{
    Task<Order> PlaceOrderAsync(int userId, CheckoutRequestDto shipping);
    Task<Order?> GetByIdAsync(int id);

    // ADD THIS LINE: For fetching the customer's full order history summary
    Task<IEnumerable<Order>> GetByUserIdAsync(int userId);
}