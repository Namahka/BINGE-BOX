using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BingeBox.Data;
using BingeBox.Models;
using System.Security.Claims;

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

        [HttpGet]
        public async Task<IActionResult> GetFavorites()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var favorites = await _context.Favorites
                .Where(f => f.UserId == userId)
                .Select(f => new {
                    f.MovieId,
                    f.Title,
                    f.PosterUrl,
                    f.Genre,
                    f.Rating
                })
                .ToListAsync();

            return Ok(favorites);
        }

        [HttpPost("toggle")]
        public async Task<IActionResult> ToggleFavorite([FromBody] Favorite fav)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var existing = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.MovieId == fav.MovieId);

            if (existing != null)
            {
                _context.Favorites.Remove(existing);
                await _context.SaveChangesAsync();
                return Ok(new { favorite = false });
            }

            var newFav = new Favorite
            {
                UserId = userId,
                MovieId = fav.MovieId,
                Title = fav.Title,
                PosterUrl = fav.PosterUrl,
                Genre = fav.Genre,
                Rating = fav.Rating
            };

            _context.Favorites.Add(newFav);
            await _context.SaveChangesAsync();
            return Ok(new { favorite = true });
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserFavorites(int userId)
        {
            var favorites = await _context.Favorites
                .Where(f => f.UserId == userId)
                .Select(f => new {
                    f.MovieId,
                    f.Title,
                    f.PosterUrl,
                    f.Genre,
                    f.Rating
                })
                .ToListAsync();

            return Ok(favorites);
        }
    }
}
