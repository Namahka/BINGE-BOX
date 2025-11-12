using System.ComponentModel.DataAnnotations;

namespace BingeBox.Models
{
    public class Category
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        public string Slug { get; set; } = string.Empty;
        public string? Image { get; set; }

        public ICollection<Movie>? Movies { get; set; }
    }
}
