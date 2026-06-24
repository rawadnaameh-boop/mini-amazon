using ECommerce.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ECommerce.Application.Interfaces;

public interface IOrderService
{
    Task<OrderResultDto> CheckoutAsync(int userId, CheckoutRequestDto request);

    Task<OrderResultDto?> GetOrderAsync(int orderId, int userId);

    Task<IEnumerable<OrderResultDto>> GetUserOrderHistoryAsync(int userId);
}