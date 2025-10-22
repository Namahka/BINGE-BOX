using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BingeBox.Models
{
    public class WatchlistItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int MovieId { get; set; }

        [Required]
        public string Title { get; set; }

        public string? PosterUrl { get; set; }

        [Required]
        public string Type { get; set; } // "movie" eller "tv"

        [Required]
        public string Status { get; set; } // "watched" eller "to-watch"

        public DateTime AddedAt { get; set; } = DateTime.Now;

        [ForeignKey("UserId")]
        public User? User { get; set; } // <-- gjort nullable ✅
    }
}
