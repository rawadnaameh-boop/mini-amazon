using ECommerce.Application.DTOs;
namespace ECommerce.Application.Interfaces;

public interface IOrderService
{
    Task<OrderResultDto> CheckoutAsync(int userId, CheckoutRequestDto request);
    Task<OrderResultDto> GetOrderAsync(int orderId);
}