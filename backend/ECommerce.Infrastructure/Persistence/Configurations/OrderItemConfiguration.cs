using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Persistence.Configurations;

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.ToTable("OrderItems", t =>
        {
            t.HasCheckConstraint("CK_OrderItems_Quantity_Positive", "`Quantity` > 0");
            t.HasCheckConstraint("CK_OrderItems_UnitPriceSnapshot_NonNegative", "`UnitPriceSnapshot` >= 0");
        });
        builder.HasKey(oi => oi.Id);

        builder.Property(oi => oi.ProductNameSnapshot).HasMaxLength(200).IsRequired();
        builder.Property(oi => oi.ProductSkuSnapshot).HasMaxLength(50).IsRequired();
        builder.Property(oi => oi.UnitPriceSnapshot).HasColumnType("decimal(10,2)");
        builder.Property(oi => oi.LineTotal).HasColumnType("decimal(10,2)");

        builder.HasOne(oi => oi.Product)
               .WithMany()
               .HasForeignKey(oi => oi.ProductId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}