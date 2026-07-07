namespace ECommerce.Domain.Entities;

	public class Product
	{
	public int Id { get; set; }
	public string Sku { get; set; } = string.Empty;
	public string Name { get; set; } = string.Empty;
	public string Description { get; set; } = string.Empty;
	public string? ImageUrl { get; set; }
	public decimal Price { get; set; }
	public int StockQuantity { get; set; }

	public bool IsActive { get; set; } = true;
	public ICollection<Review> Reviews { get; set; } = new List<Review>();
}

