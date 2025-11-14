using System.ComponentModel.DataAnnotations;

namespace BingeBox.DTOs.Followers
{
    public class FollowToggleDto
    {
        [Required]
        public int TargetId { get; set; }
    }
}
