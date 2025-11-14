namespace BingeBox.Dto.Comments
{
    public class CommentDto
    {
        public int Id { get; set; }
        public int ReviewId { get; set; }
        public int UserId { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        public string Username { get; set; } = string.Empty;
        public string ProfileImageUrl { get; set; } = string.Empty;
    }
}
