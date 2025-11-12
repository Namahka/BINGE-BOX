using System;
using System.ComponentModel.DataAnnotations;

namespace BingeBox.Models
{
    public class Movie
    {
        public int Id { get; set; }

        [Required, MaxLength(120)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Description { get; set; }

        [Range(0, 10)]
        public double Rating { get; set; }  // IMDB-liknande betyg 0–10

        [MaxLength(80)]
        public string? Genre { get; set; }

        public DateTime ReleaseDate { get; set; }
        [MaxLength(150)]
        public string? Slug { get; set; }


        [MaxLength(500)]
        public string? PosterUrl { get; set; } // länk till filmens bild

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int? CategoryId { get; set; }
        public Category? Category { get; set; }

    }
}
