namespace BingeBox.Models
{
    public class TmdbMovieDto
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Overview { get; set; }
        public double? Rating { get; set; }
        public string? PosterUrl { get; set; }
        public string? ReleaseDate { get; set; }
    }
}
