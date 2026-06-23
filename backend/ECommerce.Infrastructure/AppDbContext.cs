using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // 1. Tell EF Core to turn these entities into MySQL tables
    public DbSet<Product> Products { get; set; } = null!;
    public DbSet<Cart> Carts { get; set; } = null!;
    public DbSet<CartItem> CartItems { get; set; } = null!;

    // 2. Configure the database table relationships (Fluent API)
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Cart table
        modelBuilder.Entity<Cart>(entity =>
        {
            entity.HasKey(c => c.Id);

            // Enforce that a User can only have ONE active cart row
            entity.HasIndex(c => c.UserId).IsUnique();
        });

        // Configure CartItem table
        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.HasKey(ci => ci.Id);

            // Set up Parent-Child relationship: One Cart -> Many CartItems
            entity.HasOne(ci => ci.Cart)
                  .WithMany(c => c.CartItems)
                  .HasForeignKey(ci => ci.CartId)
                  .OnDelete(DeleteBehavior.Cascade); // If cart is deleted, wipe items too!

            // Set up Relationship: A CartItem points to a specific Product
            entity.HasOne(ci => ci.Product)
                  .WithMany()
                  .HasForeignKey(ci => ci.ProductId);
        });
    }
}