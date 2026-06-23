using System.Threading.Tasks;
using ECommerce.Application.DTOs;

namespace ECommerce.Application.Interfaces;

public interface ICartService
{
    // 1. Fetch the user's cart securely with calculated totals
    Task<CartResponseDto> GetCartByUserIdAsync(int userId);

    // 2. Add an item while validating price and warehouse stock
    Task<CartResponseDto> AddItemToCartAsync(int userId, AddToCartDto dto);

    // 3. Update numbers when someone uses the [+] or [-] buttons
    Task<CartResponseDto> UpdateItemQuantityAsync(int userId, UpdateCartItemDto dto);

    // 4. Wipe an item completely if they click "Remove"
    Task<CartResponseDto> RemoveItemFromCartAsync(int userId, int productId);
}