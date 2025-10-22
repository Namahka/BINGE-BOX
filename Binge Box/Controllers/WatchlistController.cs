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
    [Authorize] // Kräver inloggning (JWT)
    public class WatchlistController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WatchlistController(AppDbContext context)
        {
            _context = context;
        }

        // 🧠 Hjälpmetod: Hämta userId från JWT-token
        private int GetUserId()
        {
            // Försök hitta både "nameid" och standardclaimen
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
        // Lägg till ny film/serie i watchlist
        // --------------------------------------------------------
        [HttpPost("add")]
        public async Task<IActionResult> AddToWatchlist([FromBody] WatchlistItem item)
        {
            var userId = GetUserId();

            // Kontrollera om filmen redan finns i listan
            var existing = await _context.WatchlistItems
                .FirstOrDefaultAsync(w => w.UserId == userId && w.MovieId == item.MovieId && w.Type == item.Type);

            if (existing != null)
                return BadRequest("Item already exists in your watchlist.");

            item.UserId = userId;
            item.AddedAt = DateTime.Now;

            _context.WatchlistItems.Add(item);
            await _context.SaveChangesAsync();

            return Ok(item);
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
                .FirstOrDefaultAsync(w => w.Id == update.Id && w.UserId == userId);

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
        // 🧩 Debug-endpoint (frivillig)
        // Visar vilka claims tokenen innehåller
        // --------------------------------------------------------
        [HttpGet("debug-claims")]
        public IActionResult DebugClaims()
        {
            var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
            return Ok(claims);
        }
    }
}
