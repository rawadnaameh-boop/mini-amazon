using ECommerce.Application.DTOs;
using ECommerce.Application.Exceptions;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace ECommerce.Infrastructure.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _db;
    private readonly IHttpClientFactory _httpClientFactory; // 👈 1. Added for Python Communication

    public OrderRepository(AppDbContext db, IHttpClientFactory httpClientFactory)
    {
        _db = db;
        _httpClientFactory = httpClientFactory; // 👈 2. Injected the client factory
    }

    public async Task<Order> PlaceOrderAsync(int userId, CheckoutRequestDto shipping)
    {
        var cart = await _db.Carts
            .Include(c => c.CartItems)
            .ThenInclude(ci => ci.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart is null || cart.CartItems.Count == 0)
            throw new CartEmptyException();

        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var order = new Order
            {
                UserId = userId,
                ShippingFullName = shipping.FullName,
                ShippingAddressLine1 = shipping.AddressLine1,
                ShippingAddressLine2 = shipping.AddressLine2,
                ShippingCity = shipping.City,
                ShippingPostalCode = shipping.PostalCode,
                ShippingCountry = shipping.Country,
                Status = "Pending" // Assumes your entity has a Status string or Enum tracker
            };

            foreach (var cartItem in cart.CartItems)
            {
                if (cartItem.Product is null || !cartItem.Product.IsActive)
                    throw new ProductNotFoundException(cartItem.ProductId);

                var rowsAffected = await _db.Products
                    .Where(p => p.Id == cartItem.ProductId && p.StockQuantity >= cartItem.Quantity)
                    .ExecuteUpdateAsync(setters => setters
                        .SetProperty(p => p.StockQuantity, p => p.StockQuantity - cartItem.Quantity));

                if (rowsAffected == 0)
                    throw new InsufficientStockException(
                        cartItem.ProductId, cartItem.Quantity, cartItem.Product.StockQuantity);

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

            // =================================================================
            // 🛡️ SECURITY CHECKPOINT: CHAT WITH PYTHON ML SERVICE
            // =================================================================
            try
            {
                // Create a managed connection channel to Python using our factory setup
                var httpClient = _httpClientFactory.CreateClient("MLService");

                // Prepare the JSON data package to match exactly what Pydantic expects
                var currentTime = DateTime.UtcNow;
                var checkoutPayload = new
                {
                    total_cost = (double)order.TotalAmount,
                    quantity = order.OrderItems.Sum(oi => oi.Quantity),
                    hour_of_day = currentTime.Hour + (currentTime.Minute / 60.0)
                };

                // Pause and dispatch data over local ports to FastAPI POST endpoint
                var response = await httpClient.PostAsJsonAsync("/api/score-transaction", checkoutPayload);

                if (response.IsSuccessStatusCode)
                {
                    // Read and map the response properties dynamically
                    var result = await response.Content.ReadFromJsonAsync<MlScoreResponse>();

                    if (result != null && result.FraudScore > 0.85)
                    {
                        // 🚨 BUSINESS RULE TRIGGERED: Force structural state change
                        // Note: If your Order entity uses an Enum instead of a string, change this to: OrderStatus.Flagged_For_Review
                        order.Status = "Flagged_For_Review";
                        Console.ForegroundColor = ConsoleColor.Red;
                        Console.WriteLine($"[SECURITY] Order intercepted! Fraud Score: {result.FraudScore}. Flagging for review.");
                        Console.ResetColor();
                    }
                }
            }
            catch (Exception ex)
            {
                // Defensive fallback: If the ML Service is completely down, log the error
                // but let the transaction continue normally so we don't lose sales.
                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine($"[SECURITY WARNING] Could not reach ML service for verification: {ex.Message}");
                Console.ResetColor();
            }
            // =================================================================

            _db.Orders.Add(order);
            _db.CartItems.RemoveRange(cart.CartItems);

            await _db.SaveChangesAsync(); // Final structural persistence write
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

    public async Task<IEnumerable<Order>> GetByUserIdAsync(int userId) =>
        await _db.Orders.AsNoTracking()
           .Include(o => o.OrderItems)
           .Where(o => o.UserId == userId)
           .OrderByDescending(o => o.Id)
           .ToListAsync();

    // Nested Helper DTO to easily unpack Python's JSON data mapping
    private class MlScoreResponse
    {
        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        [JsonPropertyName("fraud_score")]
        public double FraudScore { get; set; }
    }
}