namespace ECommerce.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;

    // 🆕 This is the AI-generated tier column the marketing team needs
    public string? CustomerTier { get; set; }
}