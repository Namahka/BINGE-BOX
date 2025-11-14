namespace BingeBox.DTOs.Watchlist
{
    public class WatchlistItemDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int MovieId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? PosterUrl { get; set; }
        public string Type { get; set; } = "movie";
        public string Status { get; set; } = "to-watch";
        public DateTime AddedAt { get; set; }
    }
}
