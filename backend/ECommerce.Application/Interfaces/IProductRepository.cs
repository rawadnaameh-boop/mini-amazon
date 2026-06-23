using System.Threading.Tasks;
using ECommerce.Domain.Entities;

namespace ECommerce.Application.Interfaces;

public interface IProductRepository
{
    // Used to look up the authentic master price and stock from the warehouse
    Task<Product?> GetByIdAsync(int id);

    // Used to update stock numbers later if necessary
    Task UpdateAsync(Product product);
}