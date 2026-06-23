using ECommerce.Application.DTOs;
using ECommerce.Application.Exceptions;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _db;
    public OrderRepository(AppDbContext db) => _db = db;

    public async Task<Order> PlaceOrderAsync(int userId, CheckoutRequestDto shipping)
    {
        var cart = await _db.Carts
            .Include(c => c.CartItems)
            .ThenInclude(ci => ci.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart is null || cart.CartItems.Count == 0)
            throw new CartEmptyException();

        // 1) Create the Order, 2) move cart items -> order items (freezing price),
        // 3) deduct inventory, 4) clear the cart - all inside one transaction.
        // Any exception below triggers RollbackAsync, undoing every step.
        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var order = new Order
            {
                ShippingFullName = shipping.FullName,
                ShippingAddressLine1 = shipping.AddressLine1,
                ShippingAddressLine2 = shipping.AddressLine2,
                ShippingCity = shipping.City,
                ShippingPostalCode = shipping.PostalCode,
                ShippingCountry = shipping.Country,
            };

            foreach (var cartItem in cart.CartItems)
            {
                if (cartItem.Product is null || !cartItem.Product.IsActive)
                    throw new ProductNotFoundException(cartItem.ProductId);

                // Atomic, race-safe stock deduction. This single UPDATE statement
                // only succeeds if StockQuantity is still >= the requested amount
                // AT THIS EXACT MOMENT - not when the item was added to the cart.
                var rowsAffected = await _db.Products
                    .Where(p => p.Id == cartItem.ProductId && p.StockQuantity >= cartItem.Quantity)
                    .ExecuteUpdateAsync(setters => setters
                        .SetProperty(p => p.StockQuantity, p => p.StockQuantity - cartItem.Quantity));

                if (rowsAffected == 0)
                    throw new InsufficientStockException(
                        cartItem.ProductId, cartItem.Quantity, cartItem.Product.StockQuantity);

                // Freeze price/name/SKU onto the order line so historical receipts
                // are immune to later price changes.
                order.OrderItems.Add(new OrderItem
                {
                    ProductId = cartItem.ProductId,
                    ProductNameSnapshot = cartItem.Product.Name,
                    ProductSkuSnapshot = cartItem.Product.Sku,
                    UnitPriceSnapshot = cartItem.Product.Price,
                    Quantity = cartItem.Quantity,
                    LineTotal = cartItem.Product.Price * cartItem.Quantity,
                });
            }

            order.TotalAmount = order.OrderItems.Sum(oi => oi.LineTotal);
            _db.Orders.Add(order);

            // Cart is transient - empty it now that its items are locked into the order.
            _db.CartItems.RemoveRange(cart.CartItems);

            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            return order;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public Task<Order?> GetByIdAsync(int id) =>
        _db.Orders.AsNoTracking()
           .Include(o => o.OrderItems)
           .FirstOrDefaultAsync(o => o.Id == id);
}
