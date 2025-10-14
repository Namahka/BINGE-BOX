using System;
using System.ComponentModel.DataAnnotations;

namespace BingeBox.Models
{
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

        public string? ProfileImageUrl { get; set; } // 👈 måste finnas
        public string? Bio { get; set; } // 👈 måste finnas

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
