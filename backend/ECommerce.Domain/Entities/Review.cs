namespace ECommerce.Domain.Entities;

public class Review
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string Text { get; set; } = string.Empty;
    public double SentimentScore { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

}