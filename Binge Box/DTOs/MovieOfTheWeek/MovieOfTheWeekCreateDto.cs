using System.ComponentModel.DataAnnotations;

namespace BingeBox.DTOs.MovieOfTheWeek
{
    public class MovieOfTheWeekCreateDto
    {
        [Required]
        public int MovieId { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string? PosterUrl { get; set; }
        public string? BackdropUrl { get; set; }
        public string? Genre { get; set; }
        public double? Rating { get; set; }
        public string? Overview { get; set; }
    }
}
