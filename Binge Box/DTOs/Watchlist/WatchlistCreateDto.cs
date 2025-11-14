using System.ComponentModel.DataAnnotations;

namespace BingeBox.DTOs.Watchlist
{
    public class WatchlistCreateDto
    {
        [Required]
        public int MovieId { get; set; }

        public string? Title { get; set; }
        public string? PosterUrl { get; set; }
        public string Type { get; set; } = "movie";
        public string Status { get; set; } = "to-watch";
    }
}
