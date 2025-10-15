using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BingeBox.Models
{
    [Table("Follows")]
    public class Follower
    {
        [Key]
        public int Id { get; set; }

        // 🟡 ID för användaren som följer
        [Required]
        public int FollowerId { get; set; }

        // 🟡 ID för användaren som blir följd
        [Required]
        public int FollowedId { get; set; }

        // 🕒 När relationen skapades
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // 🧭 Navigation property till den användare som följer
        [ForeignKey(nameof(FollowerId))]
        public User FollowerUser { get; set; }

        // 🧭 Navigation property till den användare som blir följd
        [ForeignKey(nameof(FollowedId))]
        public User FollowedUser { get; set; }
    }
}
