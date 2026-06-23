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
        private readonly AppDbContext _db;
        public ProductRepository(AppDbContext db) => _db = db;
        public Task<List<Product>> GetAllActiveAsync() =>
        _db.Products.AsNoTracking().Where(p => p.IsActive)
           .OrderBy(p => p.Name)
           .ToListAsync();

        public Task<Product?> GetActiveByIdAsync(int id) =>
            _db.Products.AsNoTracking()
               .FirstOrDefaultAsync(p => p.Id == id && p.IsActive);
    }

