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

        // 🟢 Hämta alla favoriter för inloggad användare
        [HttpGet]
        public async Task<IActionResult> GetFavorites()
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

                var favorites = await _context.Favorites
                    .Where(f => f.UserId == userId)
                    .Select(f => new
                    {
                        f.Id,
                        f.MovieId,
                        f.Title,
                        f.PosterUrl,
                        f.Genre,
                        f.Rating,
                        f.Overview
                    })
                    .ToListAsync();

                return Ok(favorites);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ [FavoritesController.GetFavorites] Error: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        // 🟡 Lägg till / ta bort favorit (toggle)
        [HttpPost("toggle")]
        public async Task<IActionResult> ToggleFavorite([FromBody] Favorite favorite)
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

                if (favorite == null)
                    return BadRequest("Ingen favoritdata mottagen.");

                // 🎯 Säkerställ rätt MovieId
                var realMovieId = favorite.MovieId > 0 ? favorite.MovieId : favorite.Id;

                // 🔍 Leta upp befintlig favorit (oavsett varifrån den kommer)
                var existing = await _context.Favorites
                    .FirstOrDefaultAsync(f => f.UserId == userId && f.MovieId == realMovieId);

                if (existing != null)
                {
                    _context.Favorites.Remove(existing);
                    await _context.SaveChangesAsync();
                    return Ok(new { favorite = false });
                }

                // 🧹 Dublettskydd – ta bort eventuella gamla rader med samma MovieId
                var duplicates = await _context.Favorites
                    .Where(f => f.UserId == userId && (f.MovieId == favorite.MovieId || f.MovieId == favorite.Id))
                    .ToListAsync();

                if (duplicates.Any())
                {
                    _context.Favorites.RemoveRange(duplicates);
                    await _context.SaveChangesAsync();
                }

                // 🆕 Skapa ny favorit
                var newFav = new Favorite
                {
                    UserId = userId,
                    MovieId = realMovieId,
                    Title = favorite.Title?.Trim() ?? "Okänd titel",
                    PosterUrl = favorite.PosterUrl ?? string.Empty,
                    Genre = string.IsNullOrWhiteSpace(favorite.Genre) ? "Okänd genre" : favorite.Genre.Trim(),
                    Rating = favorite.Rating ?? 0,
                    Overview = favorite.Overview ?? string.Empty,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Favorites.Add(newFav);
                await _context.SaveChangesAsync();

                return Ok(new { favorite = true });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ [FavoritesController.ToggleFavorite] {ex.Message}");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }


        // 🟣 Hämta favoriter för en specifik användare
        [HttpGet("user/{userId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserFavorites(int userId)
        {
            if (userId <= 0)
                return BadRequest("Ogiltigt användar-ID.");

            var favorites = await _context.Favorites
                .Where(f => f.UserId == userId)
                .Select(f => new
                {
                    f.MovieId,
                    f.Title,
                    f.PosterUrl,
                    f.Genre,
                    f.Rating,
                    f.Overview
                })
                .ToListAsync();

            return Ok(favorites);
        }

        // 🧹 Admin cleanup för dubbletter
        [HttpPost("cleanup")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CleanupDuplicates()
        {
            var duplicates = await _context.Favorites
                .GroupBy(f => new { f.UserId, f.MovieId })
                .Where(g => g.Count() > 1)
                .ToListAsync();

            foreach (var group in duplicates)
            {
                var keep = group.First();
                var remove = group.Skip(1).ToList();
                _context.Favorites.RemoveRange(remove);
            }

            await _context.SaveChangesAsync();
            return Ok(new { cleaned = duplicates.Count });
        }
    }
}
