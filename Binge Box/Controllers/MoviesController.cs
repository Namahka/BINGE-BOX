using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BingeBox.Data;
using BingeBox.Models;

namespace BingeBox.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MoviesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MoviesController(AppDbContext context)
        {
            _context = context;
        }

        // ======================================================
        // 🟢 GET: /api/movies?page=1&pageSize=10&genre=Action&rating=desc&year=2020s&slug=the-batman
        // ======================================================
        [HttpGet]
        public async Task<IActionResult> GetMovies(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? slug = null,
            [FromQuery] string? genre = null,
            [FromQuery] string? rating = null,
            [FromQuery] string? year = null)
        {
            // 🎯 Hämta specifik film via slug
            if (!string.IsNullOrEmpty(slug))
            {
                var movieBySlug = await _context.Movies
                    .Where(m => m.Slug == slug)
                    .ToListAsync();

                return Ok(movieBySlug);
            }

            // 🔍 Starta query
            var query = _context.Movies.AsQueryable();

            // 🔹 Filtrera på genre (ex: ?genre=Horror)
            if (!string.IsNullOrEmpty(genre))
            {
                query = query.Where(m => m.Genre.Contains(genre));
            }

            // 🔹 Filtrera på årtionde (ex: ?year=2020s)
            if (!string.IsNullOrEmpty(year))
            {
                if (year.EndsWith("s") && int.TryParse(year[..4], out int decadeStart))
                {
                    int decadeEnd = decadeStart + 9;
                    query = query.Where(m => m.ReleaseDate.Year >= decadeStart && m.ReleaseDate.Year <= decadeEnd);
                }
                else if (int.TryParse(year, out int specificYear))
                {
                    query = query.Where(m => m.ReleaseDate.Year == specificYear);
                }
            }

            // 🔹 Sortering efter rating (ex: ?rating=desc eller ?rating=asc)
            if (!string.IsNullOrEmpty(rating))
            {
                query = rating.ToLower() switch
                {
                    "asc" or "low" => query.OrderBy(m => m.Rating),
                    "desc" or "high" => query.OrderByDescending(m => m.Rating),
                    _ => query.OrderByDescending(m => m.Id)
                };
            }
            else
            {
                query = query.OrderByDescending(m => m.Id);
            }

            // 🔹 Paginering
            var movies = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(movies);
        }

        // ======================================================
        // 🟣 GET: /api/movies/{id}
        // ======================================================
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetMovie(int id)
        {
            var movie = await _context.Movies.FindAsync(id);
            if (movie == null)
                return NotFound();

            return Ok(movie);
        }

        // ======================================================
        // 🟣 GET: /api/movies/slug/{slug}
        // ======================================================
        [HttpGet("slug/{slug}")]
        public async Task<IActionResult> GetMovieBySlug(string slug)
        {
            var movie = await _context.Movies
                .FirstOrDefaultAsync(m => m.Slug == slug);

            if (movie == null)
                return NotFound();

            return Ok(movie);
        }

        // ======================================================
        // 🟡 POST: /api/movies  (kräver inloggning)
        // ======================================================
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> PostMovie([FromBody] Movie movie)
        {
            if (string.IsNullOrWhiteSpace(movie.Title))
                return BadRequest("Title is required.");

            // 🧠 Skapa slug automatiskt baserat på titel
            movie.Slug = GenerateSlug(movie.Title);
            movie.CreatedAt = DateTime.UtcNow;

            _context.Movies.Add(movie);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMovie), new { id = movie.Id }, movie);
        }

        // ======================================================
        // ✏️ PATCH: /api/movies/{id}  (kräver inloggning)
        // ======================================================
        [HttpPatch("{id:int}")]
        [Authorize]
        public async Task<IActionResult> PatchMovie(int id, [FromBody] Movie updated)
        {
            var movie = await _context.Movies.FindAsync(id);
            if (movie == null)
                return NotFound();

            if (!string.IsNullOrWhiteSpace(updated.Title))
            {
                movie.Title = updated.Title;
                movie.Slug = GenerateSlug(updated.Title);
            }

            if (!string.IsNullOrWhiteSpace(updated.Description))
                movie.Description = updated.Description;

            if (!string.IsNullOrWhiteSpace(updated.PosterUrl))
                movie.PosterUrl = updated.PosterUrl;

            if (!string.IsNullOrWhiteSpace(updated.Genre))
                movie.Genre = updated.Genre;

            if (updated.Rating > 0)
                movie.Rating = updated.Rating;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ======================================================
        // ❌ DELETE: /api/movies/{id}  (kräver inloggning)
        // ======================================================
        [HttpDelete("{id:int}")]
        [Authorize]
        public async Task<IActionResult> DeleteMovie(int id)
        {
            var movie = await _context.Movies.FindAsync(id);
            if (movie == null)
                return NotFound();

            _context.Movies.Remove(movie);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ======================================================
        // 🧩 Hjälpmetod för att skapa slug
        // ======================================================
        private static string GenerateSlug(string title)
        {
            return new string(title
                .ToLower()
                .Trim()
                .Replace(" ", "-")
                .Replace(":", "")
                .Replace("'", "")
                .Replace("\"", "")
                .Replace(".", "")
                .Replace(",", "")
                .Where(c => char.IsLetterOrDigit(c) || c == '-')
                .ToArray());
        }
    }
}
