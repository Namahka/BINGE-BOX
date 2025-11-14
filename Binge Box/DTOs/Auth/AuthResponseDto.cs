namespace BingeBox.Dto.Auth
{
    public class AuthResponseDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;


        public string? AccessToken { get; set; }
        public string? TokenType { get; set; }
        public int? ExpiresIn { get; set; }
    }
}
