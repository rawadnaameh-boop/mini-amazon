namespace ECommerce.Domain.Entities;

public class Order
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateTime CreateAtUtc { get; set; } = DateTime.UtcNow;
    public string ShippingFullName { get; set; } = string.Empty;
    public string ShippingAddressLine1 { get; set; } = string.Empty;
    public string? ShippingAddressLine2 { get; set; } = string.Empty;
    public string ShippingCity { get; set; } = string.Empty;
    public string? ShippingPostalCode { get; set; } = string.Empty;
    public string ShippingCountry { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }

    public List<OrderItem> OrderItems { get; set; } = new();
}