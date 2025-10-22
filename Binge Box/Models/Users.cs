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

        public string? ProfileImageUrl { get; set; } // profilbild
        public string? Bio { get; set; }             // äldre fält
        public string? Note { get; set; }            // 👈 visas under profilbild
        public string? AboutMe { get; set; }         // 👈 visas under fliken "About me"

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        [StringLength(20)]
        public string Role { get; set; } = "User";
    }
}
