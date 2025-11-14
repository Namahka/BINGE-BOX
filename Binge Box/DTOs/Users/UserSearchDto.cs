namespace BingeBox.DTOs.Users
{
    public class UserSearchDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string? ProfileImageUrl { get; set; }
    }
}
