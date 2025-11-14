using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using BingeBox.Data;
using BingeBox.Models;
using BingeBox.DTOs.MovieOfTheWeek;
using BingeBox.DTOs.MovieOfTheWeek;


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

   
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetMovieOfTheWeek()
        {
            var movie = await _context.MovieOfTheWeek
                .OrderByDescending(m => m.SelectedAt)
                .FirstOrDefaultAsync();

            if (movie == null)
                return NotFound("Ingen film vald ännu.");

            var dto = new MovieOfTheWeekDto
            {
                Id = movie.Id,
                MovieId = movie.MovieId,
                Title = movie.Title,
                PosterUrl = movie.PosterUrl,
                BackdropUrl = movie.BackdropUrl,
                Genre = movie.Genre,
                Rating = movie.Rating,
                Overview = movie.Overview,
                SelectedAt = movie.SelectedAt
            };

            return Ok(dto);
        }

        [HttpPost("set")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SetMovieOfTheWeek([FromBody] MovieOfTheWeekCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            string? posterUrl = dto.PosterUrl;
            string? backdropUrl = dto.BackdropUrl;

   
            if (!string.IsNullOrWhiteSpace(posterUrl) && !posterUrl.StartsWith("http"))
                posterUrl = $"https://image.tmdb.org/t/p/w500{posterUrl}";

            if (!string.IsNullOrWhiteSpace(backdropUrl) && !backdropUrl.StartsWith("http"))
                backdropUrl = $"https://image.tmdb.org/t/p/original{backdropUrl}";

            var movie = new MovieOfTheWeek
            {
                MovieId = dto.MovieId,
                Title = dto.Title,
                PosterUrl = posterUrl,
                BackdropUrl = backdropUrl,
                Genre = dto.Genre,
                Rating = dto.Rating,
                Overview = dto.Overview,
                SelectedAt = DateTime.UtcNow
            };

            _context.MovieOfTheWeek.Add(movie);
            await _context.SaveChangesAsync();

            var response = new MovieOfTheWeekDto
            {
                Id = movie.Id,
                MovieId = movie.MovieId,
                Title = movie.Title,
                PosterUrl = movie.PosterUrl,
                BackdropUrl = movie.BackdropUrl,
                Genre = movie.Genre,
                Rating = movie.Rating,
                Overview = movie.Overview,
                SelectedAt = movie.SelectedAt
            };

            return CreatedAtAction(nameof(GetMovieOfTheWeek), response);
        }
    }
}
