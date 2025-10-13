using System.ComponentModel.DataAnnotations;

namespace BingeBox.Models
{
    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(120)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(120)]
        public string Slug { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Image { get; set; }

        // 🔗 Relation – en kategori kan ha flera produkter
        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
