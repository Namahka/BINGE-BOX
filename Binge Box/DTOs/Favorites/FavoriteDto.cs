namespace BingeBox.Dto.Favorites
{
    public class FavoriteDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int MovieId { get; set; }
        public string? Title { get; set; }
        public string? PosterUrl { get; set; }
        public string? Genre { get; set; }
        public double? Rating { get; set; }
        public string? Overview { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
