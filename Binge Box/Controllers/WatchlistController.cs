using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using BingeBox.Data;
using BingeBox.Models;
using BingeBox.External.Tmdb;

namespace BingeBox.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Kräver inloggning (JWT)
    public class WatchlistController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ITmdbClient _tmdb;

        public WatchlistController(AppDbContext context, ITmdbClient tmdb)
        {
            _context = context;
            _tmdb = tmdb;
        }

        // 🧠 Hämta userId från JWT-token
        private int GetUserId()
        {
            var claim = User.FindFirst("nameid")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(claim))
                throw new UnauthorizedAccessException("User ID saknas i token.");

            return int.Parse(claim);
        }

        // --------------------------------------------------------
        // 🟩 GET /api/watchlist
        // Hämtar alla poster för inloggad användare
        // --------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetUserWatchlist()
        {
            var userId = GetUserId();

            var items = await _context.WatchlistItems
                .Where(w => w.UserId == userId)
                .OrderByDescending(w => w.AddedAt)
                .ToListAsync();

            return Ok(items);
        }

        // --------------------------------------------------------
        // 🟦 POST /api/watchlist/add
        // Lägg till ny film i watchlist + hämta info från TMDb
        // --------------------------------------------------------
        [HttpPost("add")]
        public async Task<IActionResult> AddToWatchlist([FromBody] WatchlistItem item)
        {
            var userId = GetUserId();

            var existing = await _context.WatchlistItems
                .FirstOrDefaultAsync(w => w.UserId == userId && w.MovieId == item.MovieId);

            if (existing != null)
                return BadRequest("Item already exists in your watchlist.");

            item.UserId = userId;
            item.AddedAt = DateTime.UtcNow;

            // 🧩 Hämta film från TMDb
            try
            {
                JsonDocument? tmdbData = await _tmdb.GetMovieDetailsAsync(item.MovieId);
                if (tmdbData != null)
                {
                    var root = tmdbData.RootElement;
                    var title = root.GetProperty("title").GetString() ?? "Untitled";
                    var overview = root.GetProperty("overview").GetString() ?? "No description available.";
                    var rating = root.TryGetProperty("vote_average", out var r) ? r.GetDouble() : 0;
                    var poster = root.TryGetProperty("poster_path", out var p)
                        ? $"https://image.tmdb.org/t/p/w500{p.GetString()}"
                        : null;

                    var genres = root.TryGetProperty("genres", out var gArray)
                        ? string.Join(", ", gArray.EnumerateArray().Select(g => g.GetProperty("name").GetString()))
                        : "Unknown";

                    // Spara även i Movies-tabellen om den saknas
                    var existingMovie = await _context.Movies.FirstOrDefaultAsync(m => m.Id == item.MovieId);
                    if (existingMovie == null)
                    {
                        var newMovie = new Movie
                        {
                      
                            Title = title,
                            Description = overview,
                            Rating = rating,
                            Genre = genres,
                            PosterUrl = poster,
                            ReleaseDate = DateTime.UtcNow,
                            CreatedAt = DateTime.UtcNow
                        };
                        _context.Movies.Add(newMovie);
                        await _context.SaveChangesAsync();
                    }

                    // koppla info till watchlist-item
                    item.Title = title;
                    item.PosterUrl = poster;
                    item.Type = "movie";
                    item.Status = item.Status ?? "to-watch";
                }
                else
                {
                    Console.WriteLine($"⚠️ Kunde inte hitta TMDb-info för ID {item.MovieId}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Fel vid TMDb-hämtning: {ex.Message}");
            }

            _context.WatchlistItems.Add(item);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Added to watchlist", item });
        }

        // --------------------------------------------------------
        // 🟨 POST /api/watchlist/update
        // Ändra status (t.ex. "to-watch" -> "watched")
        // --------------------------------------------------------
        [HttpPost("update")]
        public async Task<IActionResult> UpdateWatchlistStatus([FromBody] WatchlistItem update)
        {
            var userId = GetUserId();

            var existing = await _context.WatchlistItems
                .FirstOrDefaultAsync(w => w.MovieId == update.MovieId && w.UserId == userId);

            if (existing == null)
                return NotFound();

            existing.Status = update.Status;
            await _context.SaveChangesAsync();

            return Ok(existing);
        }

        // --------------------------------------------------------
        // 🟥 DELETE /api/watchlist/{id}
        // Tar bort en post från listan
        // --------------------------------------------------------
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWatchlistItem(int id)
        {
            var userId = GetUserId();

            var item = await _context.WatchlistItems
                .FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);

            if (item == null)
                return NotFound();

            _context.WatchlistItems.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // --------------------------------------------------------
        // 🧩 Debug-endpoint (valfri)
        // --------------------------------------------------------
        [HttpGet("debug-claims")]
        public IActionResult DebugClaims()
        {
            var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
            return Ok(claims);
        }
    }
}
