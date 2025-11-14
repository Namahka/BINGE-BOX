namespace BingeBox.DTOs.Users
{
    public class UserProfileDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;


        public string? ProfileImageUrl { get; set; }
        public string? Bio { get; set; }
        public string? Note { get; set; }
        public string? AboutMe { get; set; }

        public DateTime CreatedAt { get; set; }
        public string Role { get; set; } = "User";
    }
}
