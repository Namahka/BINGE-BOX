namespace BingeBox.DTOs.Movies
{
    public class MovieUpdateDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Genre { get; set; }
        public string? PosterUrl { get; set; }
        public double? Rating { get; set; }
    }
}
