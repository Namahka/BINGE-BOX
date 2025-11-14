using Microsoft.AspNetCore.Http;

namespace BingeBox.DTOs.Users
{
    public class UserUpdateDto
    {
        public string? Bio { get; set; }
        public string? Note { get; set; }
        public string? AboutMe { get; set; }
        public IFormFile? ProfileImage { get; set; }
    }
}
