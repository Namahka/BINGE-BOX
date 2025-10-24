using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BingeBox.Models
{
    public class Favorite
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int MovieId { get; set; }

        [MaxLength(255)]
        public string? Title { get; set; } // ❗ inte Required längre

        [MaxLength(500)]
        public string? PosterUrl { get; set; }

        [MaxLength(100)]
        public string? Genre { get; set; }

        public double? Rating { get; set; }

        [MaxLength(2000)]
        public string? Overview { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // 🔗 Relation till användare (valfritt, samma som Watchlist)
        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
