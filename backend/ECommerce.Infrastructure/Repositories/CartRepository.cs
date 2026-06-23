using System.Threading.Tasks;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Repositories;

public class CartRepository : ICartRepository
{
    private readonly AppDbContext _context;

    public CartRepository(AppDbContext context)
    {
        _context = context;
    }

    // CRUCIAL: Uses .Include() and .ThenInclude() to pull the cart, the items, 
    // AND your teammate's master Product data all in a single safe SQL JOIN query.
    public async Task<Cart?> GetByUserIdAsync(int userId)
    {
        return await _context.Carts
            .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId);
    }

    // Inserts a brand new staging cart row if this is a user's first time buying an item
    public async Task CreateAsync(Cart cart)
    {
        await _context.Carts.AddAsync(cart);
    }

    // Safely saves all changes (additions, increments, deletions) directly to your MySQL engine
    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}