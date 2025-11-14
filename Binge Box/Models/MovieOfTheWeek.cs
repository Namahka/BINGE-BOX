using System.ComponentModel.DataAnnotations;

namespace BingeBox.Models
{
    public class MovieOfTheWeek
    {
        [Key]
        public int Id { get; set; }

        // TMDB-id eller ditt lokala MovieId
        [Required]
        public int MovieId { get; set; }

        // Grundläggande info som sparas för att visa på startsidan
        [Required]
        public string Title { get; set; } = string.Empty;

        public string? PosterUrl { get; set; }
        public string? BackdropUrl { get; set; }
        public string? Genre { get; set; }

        // ✅ Gör Rating nullable så det matchar din DTO (double?)
        public double? Rating { get; set; }

        public string? Overview { get; set; }

        // ✅ Behåll auto-tidstämpel
        public DateTime SelectedAt { get; set; } = DateTime.UtcNow;
    }
}
