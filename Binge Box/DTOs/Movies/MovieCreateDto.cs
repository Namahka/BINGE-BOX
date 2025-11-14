using System.ComponentModel.DataAnnotations;

namespace BingeBox.DTOs.Movies
{
    public class MovieCreateDto
    {
        [Required, MaxLength(120)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Description { get; set; }

        [Range(0, 10)]
        public double? Rating { get; set; }

        [MaxLength(80)]
        public string? Genre { get; set; }

        public DateTime ReleaseDate { get; set; }
        public string? PosterUrl { get; set; }
    }
}
