using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using BingeBox.Data;
using BingeBox.Models;
using BingeBox.External.Tmdb;
using BingeBox.DTOs.Watchlist;

namespace BingeBox.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WatchlistController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ITmdbClient _tmdb;

        public WatchlistController(AppDbContext context, ITmdbClient tmdb)
        {
            _context = context;
            _tmdb = tmdb;
        }

        private int GetUserId()
        {
            var claim = User.FindFirst("nameid")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(claim))
                throw new UnauthorizedAccessException("User ID saknas i token.");

            return int.Parse(claim);
        }

        [HttpGet]
        public async Task<IActionResult> GetUserWatchlist()
        {
            var userId = GetUserId();

            var items = await _context.WatchlistItems
                .Where(w => w.UserId == userId)
                .OrderByDescending(w => w.AddedAt)
                .Select(w => new WatchlistItemDto
                {
                    Id = w.Id,
                    UserId = w.UserId,
                    MovieId = w.MovieId,
                    Title = w.Title,
                    PosterUrl = w.PosterUrl,
                    Type = w.Type,
                    Status = w.Status,
                    AddedAt = w.AddedAt
                })
                .ToListAsync();

            return Ok(items);
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddToWatchlist([FromBody] WatchlistCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();

            var exists = await _context.WatchlistItems
                .FirstOrDefaultAsync(w => w.UserId == userId && w.MovieId == dto.MovieId);

            if (exists != null)
                return BadRequest("Item already exists in your watchlist.");

            var item = new WatchlistItem
            {
                UserId = userId,
                MovieId = dto.MovieId,
                Title = dto.Title ?? "Untitled",
                PosterUrl = dto.PosterUrl,
                Type = dto.Type,
                Status = dto.Status,
                AddedAt = DateTime.UtcNow
            };

            try
            {
                JsonDocument? tmdbData = await _tmdb.GetMovieDetailsAsync(dto.MovieId);
                if (tmdbData != null)
                {
                    var root = tmdbData.RootElement;
                    item.Title = root.GetProperty("title").GetString() ?? item.Title;
                    item.PosterUrl = root.TryGetProperty("poster_path", out var p)
                        ? $"https://image.tmdb.org/t/p/w500{p.GetString()}"
                        : dto.PosterUrl;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Fel vid TMDb-hämtning: {ex.Message}");
            }

            _context.WatchlistItems.Add(item);
            await _context.SaveChangesAsync();

            var response = new WatchlistItemDto
            {
                Id = item.Id,
                UserId = item.UserId,
                MovieId = item.MovieId,
                Title = item.Title,
                PosterUrl = item.PosterUrl,
                Type = item.Type,
                Status = item.Status,
                AddedAt = item.AddedAt
            };

            return CreatedAtAction(nameof(GetUserWatchlist), response);
        }

  
        [HttpPost("update")]
        public async Task<IActionResult> UpdateWatchlistStatus([FromBody] WatchlistUpdateDto dto)
        {
            var userId = GetUserId();

            var existing = await _context.WatchlistItems
                .FirstOrDefaultAsync(w => w.MovieId == dto.MovieId && w.UserId == userId);

            if (existing == null)
                return NotFound("Ingen film hittades i din watchlist.");

            existing.Status = dto.Status.ToLower().Trim();
            await _context.SaveChangesAsync();

            return Ok(new { message = "Status updated", existing.Status });
        }


        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteById(int id)
        {
            var item = await _context.WatchlistItems.FindAsync(id);
            if (item == null)
                return NoContent();

            _context.WatchlistItems.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        [HttpDelete("by-movie/{movieId:int}")]
        public async Task<IActionResult> DeleteByMovieId(int movieId)
        {
            var userId = GetUserId();

            var item = await _context.WatchlistItems
                .FirstOrDefaultAsync(w => w.MovieId == movieId && w.UserId == userId);

            if (item == null)
                return NoContent();

            _context.WatchlistItems.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserWatchlistById(int userId)
        {
            var items = await _context.WatchlistItems
                .Where(w => w.UserId == userId)
                .Select(w => new WatchlistItemDto
                {
                    Id = w.Id,
                    UserId = w.UserId,
                    MovieId = w.MovieId,
                    Title = w.Title,
                    PosterUrl = w.PosterUrl,
                    Type = w.Type,
                    Status = w.Status,
                    AddedAt = w.AddedAt
                })
                .ToListAsync();

            return Ok(items);
        }


        [HttpGet("debug-claims")]
        public IActionResult DebugClaims()
        {
            var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
            return Ok(claims);
        }
    }
}
