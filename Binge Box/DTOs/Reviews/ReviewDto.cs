namespace BingeBox.DTOs.Reviews
{
    public class ReviewDto
    {
        public int Id { get; set; }
        public int MovieId { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = "";
        public decimal Rating { get; set; }
        public string Content { get; set; } = "";
        public int LikesCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
