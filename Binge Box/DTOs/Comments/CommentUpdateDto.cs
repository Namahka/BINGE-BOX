using System.ComponentModel.DataAnnotations;

namespace BingeBox.Dto.Comments
{
    public class CommentUpdateDto
    {
        [Required, MaxLength(2000)]
        public string Content { get; set; } = string.Empty;
    }
}
