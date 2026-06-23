using System.Threading.Tasks;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace ECommerce.Infrastructure.Repositories;

    public class ProductRepository : IProductRepository
{
    // NOTE: Replace 'AppDbContext' with whatever your teammate named their DbContext file!
    private readonly AppDbContext _context;

    public ProductRepository(AppDbContext context)
    {
        _context = context;
    }
        private readonly AppDbContext _db;
        public ProductRepository(AppDbContext db) => _db = db;
        public Task<List<Product>> GetAllActiveAsync() =>
        _db.Products.AsNoTracking().Where(p => p.IsActive)
           .OrderBy(p => p.Name)
           .ToListAsync();

    // Connects to MySQL to find the authentic price and warehouse stock count
    public async Task<Product?> GetByIdAsync(int id)
    {
        return await _context.Products.FindAsync(id);
        public Task<Product?> GetActiveByIdAsync(int id) =>
            _db.Products.AsNoTracking()
               .FirstOrDefaultAsync(p => p.Id == id && p.IsActive);
    }

    // Prepares EF Core to track updates to a product (like reducing warehouse stock)
    public async Task UpdateAsync(Product product)
    {
        _context.Products.Update(product);
        await Task.CompletedTask;
    }
}