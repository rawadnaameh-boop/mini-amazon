using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Persistence;
public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Text).IsRequired();
        builder.Property(r => r.SentimentScore).IsRequired();
        builder.Property(r => r.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP(6)");
       
        builder.HasOne(r => r.Product)
               .WithMany(p => p.Reviews)
               .HasForeignKey(r => r.ProductId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}