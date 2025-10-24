using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BingeBox.Models
{
    public class ReviewLike
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ReviewId { get; set; }

        [Required]
        public int UserId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(ReviewId))]
        public Review? Review { get; set; }

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
    }
}
