namespace BingeBox.Models
{
    public class LoginRequest
    {
        // 👇 Kan vara antingen användarnamn eller e-post
        public string Identifier { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;
    }
}
