using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BingeBox.Models
{
    public class Favorite
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }

        public int MovieId { get; set; }

        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        public string? PosterUrl { get; set; }

        public double? Rating { get; set; }

        public string? Genre { get; set; }

        public User? User { get; set; }
    }
}
