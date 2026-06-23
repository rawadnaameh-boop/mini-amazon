using System;
using System.Collections.Generic;
using System.Text;
using ECommerce.Domain.Entities;

namespace ECommerce.Application.Interfaces;

    public interface IProductRepository
    {
        Task<List<Product>> GetAllActiveAsync();
        Task<Product?> GetActiveByIdAsync(int id);

       // Used to look up the authentic master price and stock from the warehouse
    Task<Product?> GetByIdAsync(int id);

    // Used to update stock numbers later if necessary
    Task UpdateAsync(Product product);
}
