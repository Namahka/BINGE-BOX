using System.ComponentModel.DataAnnotations;

namespace BingeBox.DTOs.Reviews
{
    public class ReviewCreateDto
    {
        [Required]
        public int MovieId { get; set; }

        [Range(0, 10)]
        public decimal Rating { get; set; }

        [Required, MaxLength(2000)]
        public string Content { get; set; } = string.Empty;
    }
}
