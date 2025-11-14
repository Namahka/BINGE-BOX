using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BingeBox.Data;
using BingeBox.Models;
using BingeBox.DTOs.Movies;

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

      
        [HttpGet]
        public async Task<IActionResult> GetMovies(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? slug = null,
            [FromQuery] string? genre = null,
            [FromQuery] string? rating = null,
            [FromQuery] string? year = null)
        {
            if (!string.IsNullOrEmpty(slug))
            {
                var movieBySlug = await _context.Movies
                    .Where(m => m.Slug == slug)
                    .Select(m => new MovieDto
                    {
                        Id = m.Id,
                        Title = m.Title,
                        Description = m.Description,
                        Rating = m.Rating,
                        Genre = m.Genre,
                        ReleaseDate = m.ReleaseDate,
                        PosterUrl = m.PosterUrl,
                        Slug = m.Slug
                    })
                    .ToListAsync();

                return Ok(movieBySlug);
            }

            var query = _context.Movies.AsQueryable();

            if (!string.IsNullOrEmpty(genre))
                query = query.Where(m => m.Genre.Contains(genre));

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

            var movies = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(m => new MovieDto
                {
                    Id = m.Id,
                    Title = m.Title,
                    Description = m.Description,
                    Rating = m.Rating,
                    Genre = m.Genre,
                    ReleaseDate = m.ReleaseDate,
                    PosterUrl = m.PosterUrl,
                    Slug = m.Slug
                })
                .ToListAsync();

            return Ok(movies);
        }

  
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetMovie(int id)
        {
            var movie = await _context.Movies
                .Select(m => new MovieDto
                {
                    Id = m.Id,
                    Title = m.Title,
                    Description = m.Description,
                    Rating = m.Rating,
                    Genre = m.Genre,
                    ReleaseDate = m.ReleaseDate,
                    PosterUrl = m.PosterUrl,
                    Slug = m.Slug
                })
                .FirstOrDefaultAsync(m => m.Id == id);

            if (movie == null)
                return NotFound();

            return Ok(movie);
        }

 
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> PostMovie([FromBody] MovieCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var movie = new Movie
            {
                Title = dto.Title,
                Description = dto.Description,
                Rating = dto.Rating ?? 0,
                Genre = dto.Genre,
                ReleaseDate = dto.ReleaseDate,
                PosterUrl = dto.PosterUrl,
                CreatedAt = DateTime.UtcNow,
                Slug = GenerateSlug(dto.Title)
            };

            _context.Movies.Add(movie);
            await _context.SaveChangesAsync();

            var response = new MovieDto
            {
                Id = movie.Id,
                Title = movie.Title,
                Description = movie.Description,
                Rating = movie.Rating,
                Genre = movie.Genre,
                ReleaseDate = movie.ReleaseDate,
                PosterUrl = movie.PosterUrl,
                Slug = movie.Slug
            };

            return CreatedAtAction(nameof(GetMovie), new { id = movie.Id }, response);
        }


        [HttpPatch("{id:int}")]
        [Authorize]
        public async Task<IActionResult> PatchMovie(int id, [FromBody] MovieUpdateDto dto)
        {
            var movie = await _context.Movies.FindAsync(id);
            if (movie == null)
                return NotFound();

            if (!string.IsNullOrWhiteSpace(dto.Title))
            {
                movie.Title = dto.Title;
                movie.Slug = GenerateSlug(dto.Title);
            }

            if (!string.IsNullOrWhiteSpace(dto.Description))
                movie.Description = dto.Description;

            if (!string.IsNullOrWhiteSpace(dto.PosterUrl))
                movie.PosterUrl = dto.PosterUrl;

            if (!string.IsNullOrWhiteSpace(dto.Genre))
                movie.Genre = dto.Genre;

            if (dto.Rating.HasValue && dto.Rating > 0)
                movie.Rating = dto.Rating.Value;

            await _context.SaveChangesAsync();
            return NoContent();
        }

  
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
