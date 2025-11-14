using System.ComponentModel.DataAnnotations;

namespace BingeBox.Dto.Comments
{
    public class CommentCreateDto
    {
        [Required]
        public int ReviewId { get; set; }

        [Required, MaxLength(2000)]
        public string Content { get; set; } = string.Empty;
    }
}
