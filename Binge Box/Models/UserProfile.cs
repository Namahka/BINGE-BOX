using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BingeBox.Models
{
    public class UserProfile
    {
        [Key, ForeignKey("User")]
        public int UserId { get; set; }

        public string? ProfileImageUrl { get; set; }
        public string? Bio { get; set; }
        public string? Note { get; set; }
        public string? AboutMe { get; set; }

        public User User { get; set; }
    }
}
