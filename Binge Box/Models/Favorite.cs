using System.ComponentModel.DataAnnotations;

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

        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(500)]
        public string PosterUrl { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Genre { get; set; } = string.Empty;

        public double? Rating { get; set; }

        [MaxLength(2000)]
        public string Overview { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
