namespace ECommerce.Domain.Entities;

public class CartItem
{
    // 1. Primary Key
    public int Id { get; set; }

    // 2. Foreign Key linking back to the parent Cart
    public int CartId { get; set; }

    // 3. Foreign Key linking to the Product being purchased
    public int ProductId { get; set; }

    // 4. Quantity of this product in the cart (Defaults to 1)
    public int Quantity { get; set; } = 1;

    // 5. Navigation Properties: Tells Entity Framework how these tables relate
    public virtual Cart Cart { get; set; } = null!;
    public virtual Product Product { get; set; } = null!;
}