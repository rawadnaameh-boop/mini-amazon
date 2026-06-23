using System.Threading.Tasks;
using ECommerce.Domain.Entities;

namespace ECommerce.Application.Interfaces;

public interface ICartRepository
{
    // Fetches a user's active cart and loads all internal cart items
    Task<Cart?> GetByUserIdAsync(int userId);

    // Creates a fresh cart if the user doesn't have one yet
    Task CreateAsync(Cart cart);

    // Saves changes (adds, updates, or deletes) to the database
    Task SaveChangesAsync();
}