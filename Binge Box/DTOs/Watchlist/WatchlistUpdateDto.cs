using System.ComponentModel.DataAnnotations;

namespace BingeBox.DTOs.Watchlist
{
    public class WatchlistUpdateDto
    {
        [Required]
        public int MovieId { get; set; }

        [Required]
        public string Status { get; set; } = "to-watch";
    }
}
