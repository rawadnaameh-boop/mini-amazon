using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders", t =>
        {
            t.HasCheckConstraint("CK_Orders_TotalAmount_NonNegative", "`TotalAmount` >= 0");
        });
        builder.HasKey(o => o.Id);

        builder.Property(o => o.ShippingFullName).HasMaxLength(200).IsRequired();
        builder.Property(o => o.ShippingAddressLine1).HasMaxLength(300).IsRequired();
        builder.Property(o => o.ShippingAddressLine2).HasMaxLength(300);
        builder.Property(o => o.ShippingCity).HasMaxLength(100).IsRequired();
        builder.Property(o => o.ShippingPostalCode).HasMaxLength(20).IsRequired();
        builder.Property(o => o.ShippingCountry).HasMaxLength(100).IsRequired();
        builder.Property(o => o.TotalAmount).HasColumnType("decimal(10,2)");

        builder.HasMany(o => o.OrderItems)
               .WithOne(i => i.Order)
               .HasForeignKey(i => i.OrderId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}