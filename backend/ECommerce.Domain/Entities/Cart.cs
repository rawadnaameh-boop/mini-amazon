using System;
using System.Collections.Generic;

namespace ECommerce.Domain.Entities;

public class Cart
{
    // 1. Primary Key
    public int Id { get; set; }

    // 2. Foreign Key linking this cart to a specific user
    public int UserId { get; set; }

    // 3. Timestamp of when the cart was created
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // 4. Navigation Property: One cart can hold many cart items
    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
}