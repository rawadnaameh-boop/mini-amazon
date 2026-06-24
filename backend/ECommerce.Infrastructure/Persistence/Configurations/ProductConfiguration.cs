using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products", t =>
        {
            t.HasCheckConstraint("CK_Products_Price_NonNegative", "`Price` >= 0");
            t.HasCheckConstraint("CK_Products_StockQuantity_NonNegative", "`StockQuantity` >= 0");
        });

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Sku).HasMaxLength(50).IsRequired();
        builder.Property(p => p.Name).HasMaxLength(200).IsRequired();
        builder.Property(p => p.Description).HasMaxLength(2000).IsRequired();
        builder.Property(p => p.ImageUrl).HasMaxLength(500);
        builder.Property(p => p.Price).HasColumnType("decimal(10,2)");

        builder.HasIndex(p => p.Sku).IsUnique();

        builder.HasData(
            new Product { Id = 1, Sku = "ELEC-WH-001", Name = "Wireless Bluetooth Headphones", Description = "Over-ear noise-cancelling headphones with 30-hour battery life.", ImageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e", Price = 59.99m, StockQuantity = 25, IsActive = true },
            new Product { Id = 2, Sku = "ELEC-SW-002", Name = "Smart Fitness Watch", Description = "Tracks heart rate, steps, and sleep with a 7-day battery.", ImageUrl = "https://picsum.photos/seed/elec-sw-002/400/400", Price = 89.99m, StockQuantity = 40, IsActive = true },
            new Product { Id = 3, Sku = "HOME-CM-003", Name = "12-Cup Programmable Coffee Maker", Description = "Brew up to 12 cups with a 24-hour programmable timer.", ImageUrl = "https://picsum.photos/seed/home-cm-003/400/400", Price = 45.50m, StockQuantity = 15, IsActive = true },
            new Product { Id = 4, Sku = "HOME-BL-004", Name = "High-Speed Countertop Blender", Description = "1200W motor with 6 stainless steel blades for smoothies.", ImageUrl = "https://picsum.photos/seed/home-bl-004/400/400", Price = 69.99m, StockQuantity = 0, IsActive = true },
            new Product { Id = 5, Sku = "SPRT-YM-005", Name = "Non-Slip Yoga Mat", Description = "Extra-thick 6mm eco-friendly TPE yoga mat with carrying strap.", ImageUrl = "https://picsum.photos/seed/sprt-ym-005/400/400", Price = 24.99m, StockQuantity = 60, IsActive = true },
            new Product { Id = 6, Sku = "SPRT-DB-006", Name = "Adjustable Dumbbell Set 20lb", Description = "Pair of adjustable dumbbells for home strength training.", ImageUrl = "https://picsum.photos/seed/sprt-db-006/400/400", Price = 79.99m, StockQuantity = 12, IsActive = true },
            new Product { Id = 7, Sku = "KTCH-KS-007", Name = "15-Piece Kitchen Knife Set", Description = "Stainless steel knives with wooden block and built-in sharpener.", ImageUrl = "https://picsum.photos/seed/ktch-ks-007/400/400", Price = 54.99m, StockQuantity = 8, IsActive = true },
            new Product { Id = 8, Sku = "KTCH-AF-008", Name = "Digital Air Fryer 5.8QT", Description = "Oil-free frying with 8 preset cooking programs.", ImageUrl = "https://picsum.photos/seed/ktch-af-008/400/400", Price = 64.99m, StockQuantity = 0, IsActive = true },
            new Product { Id = 9, Sku = "BOOK-NV-009", Name = "\"The Last Lighthouse\" Novel", Description = "Bestselling mystery novel, paperback edition.", ImageUrl = "https://picsum.photos/seed/book-nv-009/400/400", Price = 14.99m, StockQuantity = 100, IsActive = true },
            new Product { Id = 10, Sku = "TOYS-LB-010", Name = "500-Piece Building Block Set", Description = "Creative building blocks compatible with major brands.", ImageUrl = "https://picsum.photos/seed/toys-lb-010/400/400", Price = 34.99m, StockQuantity = 22, IsActive = true },
            new Product { Id = 11, Sku = "ELEC-PB-011", Name = "20000mAh Portable Power Bank", Description = "Fast-charging power bank with dual USB-C ports.", ImageUrl = "https://picsum.photos/seed/elec-pb-011/400/400", Price = 29.99m, StockQuantity = 50, IsActive = true },
            new Product { Id = 12, Sku = "HOME-VC-012", Name = "Cordless Stick Vacuum Cleaner", Description = "Lightweight cordless vacuum with HEPA filter.", ImageUrl = "https://picsum.photos/seed/home-vc-012/400/400", Price = 129.99m, StockQuantity = 9, IsActive = true },
            new Product { Id = 13, Sku = "GARD-HS-013", Name = "50ft Expandable Garden Hose", Description = "Lightweight expandable hose with 8-pattern spray nozzle.", ImageUrl = "https://picsum.photos/seed/gard-hs-013/400/400", Price = 32.99m, StockQuantity = 18, IsActive = true },
            new Product { Id = 14, Sku = "PETS-DB-014", Name = "Orthopedic Dog Bed (Large)", Description = "Memory foam dog bed with removable, washable cover.", ImageUrl = "https://picsum.photos/seed/pets-db-014/400/400", Price = 49.99m, StockQuantity = 14, IsActive = true },
            new Product { Id = 15, Sku = "OFFC-CH-015", Name = "Ergonomic Mesh Office Chair", Description = "Adjustable lumbar support office chair with breathable mesh back.", ImageUrl = "https://picsum.photos/seed/offc-ch-015/400/400", Price = 149.99m, StockQuantity = 6, IsActive = true }
        );
    }
}
