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

        public string? ProfileImageUrl { get; set; } // 👈 profilbild
        public string? Bio { get; set; }             // 👈 biotext

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // 🧠 Nytt fält: användarroll (User eller Admin)
        [Required]
        [StringLength(20)]
        public string Role { get; set; } = "User";
    }
}
