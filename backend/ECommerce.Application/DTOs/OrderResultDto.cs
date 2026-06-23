namespace ECommerce.Application.DTOs;

public class OrderItemResultDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quatity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}

public class OrderResultDto
{
    public int OrderId { get; set; }
    public DateTime CreateAtUtc { get; set; }
    public decimal TotalAmount { get; set; }
    public List<OrderItemResultDto> Items { get; set; } = new();

}