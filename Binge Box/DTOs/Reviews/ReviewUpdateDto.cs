using System.ComponentModel.DataAnnotations;

namespace BingeBox.DTOs.Reviews
{
    public class ReviewUpdateDto
    {
        [Range(0, 10)]
        public decimal? Rating { get; set; }

        [MaxLength(2000)]
        public string? Content { get; set; }
    }
}
