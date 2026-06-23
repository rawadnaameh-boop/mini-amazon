namespace ECommerce.Application.Exceptions;

public class CartEmptyException : Exception
{
    public CartEmptyException() : base("Your cart is empty.") { }
}

public class ProductNotFoundException : Exception
{
    public int ProductId { get; }
    public ProductNotFoundException(int productId)
        : base($"Product {productId} was not found or is no longer available.")
        => ProductId = productId;
}

public class InsufficientStockException : Exception
{
    public int ProductId { get; }
    public int Requested { get; }
    public int Available { get; }

    public InsufficientStockException(int productId, int requested, int available)
        : base($"Only {available} unit(s) of product {productId} are available (requested {requested}).")
    {
        ProductId = productId;
        Requested = requested;
        Available = available;
    }
}

public class OrderNotFoundException : Exception
{
    public OrderNotFoundException(int id) : base($"Order {id} was not found.") { }
}