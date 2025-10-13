using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BingeBox.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(120)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Description { get; set; }

        [Range(0, 999999)]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Price { get; set; }

        [MaxLength(500)]
        public string? Image { get; set; }

        [Required]
        [MaxLength(120)]
        public string Slug { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // 🔗 Relation till Category
        public int? CategoryId { get; set; }
        public Category? Category { get; set; }
    }
}
