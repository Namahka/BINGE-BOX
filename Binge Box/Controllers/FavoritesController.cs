using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BingeBox.Data;
using BingeBox.Models;
using BingeBox.External.Tmdb;
using System.Security.Claims;
using System.Text.Json;

namespace BingeBox.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FavoritesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ITmdbClient _tmdb;

        public FavoritesController(AppDbContext context, ITmdbClient tmdb)
        {
            _context = context;
            _tmdb = tmdb;
        }

        // 🧠 Hämta userId
        private int GetUserId()
        {
            var claim = User.FindFirst("nameid")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(claim))
                throw new UnauthorizedAccessException("User ID saknas i token.");
            return int.Parse(claim);
        }

        // 🟩 GET /api/favorites
        [HttpGet]
        public async Task<IActionResult> GetFavorites()
        {
            var userId = GetUserId();

            var favorites = await _context.Favorites
                .Where(f => f.UserId == userId)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();

            return Ok(favorites);
        }

        // 🟦 POST /api/favorites/toggle
        [HttpPost("toggle")]
        public async Task<IActionResult> ToggleFavorite([FromBody] Favorite favorite)
        {
            try
            {
                var userId = GetUserId();
                if (favorite == null)
                    return BadRequest("Ingen favoritdata mottagen.");

                var movieId = favorite.MovieId > 0 ? favorite.MovieId : favorite.Id;

                var existing = await _context.Favorites
                    .FirstOrDefaultAsync(f => f.UserId == userId && f.MovieId == movieId);

                if (existing != null)
                {
                    _context.Favorites.Remove(existing);
                    await _context.SaveChangesAsync();
                    return Ok(new { favorite = false });
                }

                // 🎬 Hämta detaljer från TMDb
                string title = "Okänd titel";
                string overview = "Ingen beskrivning tillgänglig.";
                string genre = "Okänd genre";
                string poster = string.Empty;
                double rating = 0;

                try
                {
                    var tmdbData = await _tmdb.GetMovieDetailsAsync(movieId);
                    if (tmdbData != null)
                    {
                        var root = tmdbData.RootElement;

                        if (root.TryGetProperty("title", out var titleProp))
                            title = titleProp.GetString() ?? title;

                        if (root.TryGetProperty("overview", out var overviewProp))
                            overview = overviewProp.GetString() ?? overview;

                        if (root.TryGetProperty("vote_average", out var ratingProp))
                            rating = ratingProp.GetDouble();

                        if (root.TryGetProperty("poster_path", out var posterProp))
                        {
                            var posterPath = posterProp.GetString();
                            if (!string.IsNullOrWhiteSpace(posterPath))
                                poster = $"https://image.tmdb.org/t/p/w500{posterPath}";
                        }

                        if (root.TryGetProperty("genres", out var genresProp))
                        {
                            var genreList = genresProp
                                .EnumerateArray()
                                .Select(g => g.GetProperty("name").GetString())
                                .Where(n => !string.IsNullOrWhiteSpace(n));
                            genre = string.Join(", ", genreList);
                        }
                    }
                    else
                    {
                        Console.WriteLine($"⚠️ Ingen TMDb-data för {movieId}");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ TMDb-hämtning misslyckades: {ex.Message}");
                }

                // 🆕 Skapa ny favorit
                var newFav = new Favorite
                {
                    UserId = userId,
                    MovieId = movieId,
                    Title = title,
                    PosterUrl = poster,
                    Genre = genre,
                    Rating = rating,
                    Overview = overview,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Favorites.Add(newFav);
                await _context.SaveChangesAsync();

                return Ok(new { favorite = true, item = newFav });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ [FavoritesController.ToggleFavorite] {ex.Message}");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        // 🟣 GET /api/favorites/user/{userId}
        [HttpGet("user/{userId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserFavorites(int userId)
        {
            if (userId <= 0)
                return BadRequest("Ogiltigt användar-ID.");

            var favorites = await _context.Favorites
                .Where(f => f.UserId == userId)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();

            return Ok(favorites);
        }

        // 🧹 POST /api/favorites/cleanup
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
                var remove = group.Skip(1).ToList();
                _context.Favorites.RemoveRange(remove);
            }

            await _context.SaveChangesAsync();
            return Ok(new { cleaned = duplicates.Count });
        }
    }
}
