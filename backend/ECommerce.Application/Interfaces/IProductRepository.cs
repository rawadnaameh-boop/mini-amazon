using System;
using System.Collections.Generic;
using System.Text;
using ECommerce.Domain.Entities;
namespace ECommerce.Application.Interfaces
{
    public interface IProductRepository
    {
        Task<List<Product>> GetAllActiveAsync();
        Task<Product?> GetActiveByIdAsync(int id);
    }
}
