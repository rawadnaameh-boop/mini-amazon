namespace ECommerce.Application.DTOs;

public class OrderItemResultDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}

public class OrderResultDto
{
    public int OrderId { get; set; }
    public DateTime CreateAtUtc { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public List<OrderItemResultDto> Items { get; set; } = new();
}