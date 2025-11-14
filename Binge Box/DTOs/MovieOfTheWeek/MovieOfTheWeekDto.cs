namespace BingeBox.DTOs.MovieOfTheWeek
{
    public class MovieOfTheWeekDto
    {
        public int Id { get; set; }
        public int MovieId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? PosterUrl { get; set; }
        public string? BackdropUrl { get; set; }
        public string? Genre { get; set; }
        public double? Rating { get; set; }
        public string? Overview { get; set; }
        public DateTime SelectedAt { get; set; }
    }
}
