using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BingeBox.Models
{
    public class Comment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ReviewId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required, MaxLength(2000)]
        public string Content { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(ReviewId))]
        public Review? Review { get; set; }

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
    }
}
