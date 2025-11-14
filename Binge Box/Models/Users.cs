using BingeBox.Models;
using System.ComponentModel.DataAnnotations;

public class User
{
    public int Id { get; set; }

    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public UserProfile? Profile { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required]
    [StringLength(20)]
    public string Role { get; set; } = "User";
}
