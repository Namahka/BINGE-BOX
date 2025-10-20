using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using BingeBox.Data;
using BingeBox.Models;

namespace BingeBox.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MovieOfTheWeekController : ControllerBase
    {
        private readonly AppDbContext _context;
        public MovieOfTheWeekController(AppDbContext context)
        {
            _context = context;
        }

        // 🔹 Hämta aktiv film
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetMovieOfTheWeek()
        {
            var movie = await _context.MovieOfTheWeek
                .OrderByDescending(m => m.SelectedAt)
                .FirstOrDefaultAsync();

            if (movie == null)
                return NotFound("Ingen film vald ännu.");

            return Ok(movie);
        }

        // 🔸 Uppdatera / välj ny (endast Admin)
        [HttpPost("set")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SetMovieOfTheWeek([FromBody] MovieOfTheWeek newMovie)
        {
            if (newMovie == null)
                return BadRequest("Ingen filmdata mottagen.");

            // ✅ Bygg kompletta bild-URL:er om bara paths skickas
            string? posterUrl = newMovie.PosterUrl;
            string? backdropUrl = newMovie.BackdropUrl;

            if (!string.IsNullOrWhiteSpace(posterUrl) && !posterUrl.StartsWith("http"))
                posterUrl = $"https://image.tmdb.org/t/p/w500{posterUrl}";

            if (!string.IsNullOrWhiteSpace(backdropUrl) && !backdropUrl.StartsWith("http"))
                backdropUrl = $"https://image.tmdb.org/t/p/original{backdropUrl}";

            // 🧱 Skapa ny entitet
            var movie = new MovieOfTheWeek
            {
                MovieId = newMovie.MovieId,
                Title = newMovie.Title,
                PosterUrl = posterUrl,
                BackdropUrl = backdropUrl,
                Genre = newMovie.Genre,
                Rating = newMovie.Rating,
                Overview = newMovie.Overview,
                SelectedAt = DateTime.UtcNow
            };

            // 💾 Spara i databasen
            _context.MovieOfTheWeek.Add(movie);
            await _context.SaveChangesAsync();

            return Ok(movie);
        }
    }
}
