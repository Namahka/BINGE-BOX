using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BingeBox.Data;
using BingeBox.Models;

namespace BingeBox.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FavoritesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FavoritesController(AppDbContext context)
        {
            _context = context;
        }

        // 🟡 TOGGLE – lägg till eller ta bort favorit
        [HttpPost("toggle")]
        public async Task<IActionResult> ToggleFavorite([FromBody] FavoriteRequest req)
        {
            try
            {
                if (req == null || req.MovieId == 0)
                    return BadRequest("Ogiltig data");

                var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized("Token saknar användar-ID");

                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized("Ogiltigt användar-ID i token");

                var existing = await _context.Favorites
                    .FirstOrDefaultAsync(f => f.MovieId == req.MovieId && f.UserId == userId);

                if (existing != null)
                {
                    _context.Favorites.Remove(existing);
                    await _context.SaveChangesAsync();
                    return Ok(new { message = "❌ Borttagen från favoriter" });
                }

                var fav = new Favorite
                {
                    UserId = userId,
                    MovieId = req.MovieId,
                    Title = req.Title ?? "",
                    PosterUrl = req.PosterUrl,
                    Rating = req.Rating,
                    Genre = req.Genre
                };

                _context.Favorites.Add(fav);
                await _context.SaveChangesAsync();

                return Ok(new { message = "⭐ Tillagd i favoriter" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ FEL I FAVORITES: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // 🟢 Hämta alla favoriter för inloggad användare
        [HttpGet]
        public async Task<IActionResult> GetFavorites()
        {
            try
            {
                var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized("Token saknar användar-ID");

                if (!int.TryParse(userIdClaim, out int userId))
                    return Unauthorized("Ogiltigt användar-ID i token");

                var favorites = await _context.Favorites
                    .Where(f => f.UserId == userId)
                    .Select(f => new
                    {
                        f.Id,
                        f.MovieId,
                        f.Title,
                        f.PosterUrl,
                        f.Rating,
                        f.Genre
                    })
                    .ToListAsync();

                return Ok(favorites);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ FEL VID HÄMTNING AV FAVORITER: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    // 📦 DTO för POST-data
    public class FavoriteRequest
    {
        public int MovieId { get; set; }
        public string? Title { get; set; }
        public string? PosterUrl { get; set; }
        public double? Rating { get; set; }
        public string? Genre { get; set; }
    }
}
