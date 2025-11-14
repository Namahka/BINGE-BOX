namespace BingeBox.DTOs.Movies
{
    public class MovieDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public double Rating { get; set; }
        public string? Genre { get; set; }
        public DateTime ReleaseDate { get; set; }
        public string? PosterUrl { get; set; }
        public string? Slug { get; set; }
    }
}
