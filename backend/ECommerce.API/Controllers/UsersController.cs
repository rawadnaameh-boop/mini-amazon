using ECommerce.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Fetches all users, with optional filtering by AI customer tier.
    /// URL Example: GET /api/users?tier=Tier 1
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetUsers([FromQuery] string? tier)
    {
        var query = _context.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(tier))
        {
            // 🆕 If the user just passed a number like "2", automatically normalize it to "Tier 2"
            if (!tier.StartsWith("Tier", StringComparison.OrdinalIgnoreCase))
            {
                tier = $"Tier {tier}";
            }

            query = query.Where(u => u.CustomerTier == tier);
        }

        var users = await query.ToListAsync();
        return Ok(users);
    }
}