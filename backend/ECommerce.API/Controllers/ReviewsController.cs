using ECommerce.Application.DTOs;
using ECommerce.Domain.Entities;
using ECommerce.Infrastructure.Persistence;
using ECommerce.Service;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/products/{productId:int}/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly MlSentimentClient _mlSentimentClient;

    public ReviewsController(AppDbContext dbContext, MlSentimentClient mlSentimentClient)
    {
        _dbContext = dbContext;
        _mlSentimentClient = mlSentimentClient;
    }

    [HttpPost]
    public async Task<ActionResult<ReviewDto>> CreateReview(
        int productId,
        [FromBody] CreateReviewRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Text))
        {
            return BadRequest("Review text cannot be empty.");
        }

        var productExists = await _dbContext.Products.AnyAsync(p => p.Id == productId);

        if (!productExists)
        {
            return NotFound($"Product with id {productId} was not found.");
        }

        var sentimentScore = await _mlSentimentClient.AnalyzeReviewAsync(request.Text);

        var review = new Review
        {
            ProductId = productId,
            Text = request.Text,
            SentimentScore = sentimentScore,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Reviews.Add(review);
        await _dbContext.SaveChangesAsync();

        var reviewDto = new ReviewDto
        {
            Id = review.Id,
            ProductId = review.ProductId,
            Text = review.Text,
            SentimentScore = review.SentimentScore,
            CreatedAt = review.CreatedAt
        };

        return Ok(reviewDto);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetReviewsForProduct(int productId)
    {
        var reviews = await _dbContext.Reviews
            .Where(r => r.ProductId == productId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                ProductId = r.ProductId,
                Text = r.Text,
                SentimentScore = r.SentimentScore,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return Ok(reviews);
    }
}