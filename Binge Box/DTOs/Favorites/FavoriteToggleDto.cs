using System.ComponentModel.DataAnnotations;

namespace BingeBox.Dto.Favorites
{
    public class FavoriteToggleDto
    {
        [Required]
        public int MovieId { get; set; }
    }
}
