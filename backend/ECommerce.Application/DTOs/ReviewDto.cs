namespace ECommerce.Application.DTOs;

public class ReviewDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string Text { get; set; } = string.Empty;
    public double SentimentScore { get; set; }
    public DateTime CreatedAt { get; set; }
}