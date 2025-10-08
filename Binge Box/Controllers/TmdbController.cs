using Microsoft.AspNetCore.Mvc;
using BingeBox.External.Tmdb;
using BingeBox.Models;            // TmdbMovieDto
using BingeBox.Options;          // TmdbOptions (för ImageBase)
using Microsoft.Extensions.Options;
using System.Linq;

namespace BingeBox.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TmdbController : ControllerBase
    {
        private readonly ITmdbClient _tmdb;
        private readonly string _imageBase;

        public TmdbController(ITmdbClient tmdb, IOptions<TmdbOptions> opts)
        {
            _tmdb = tmdb;
            _imageBase = (opts.Value.ImageBase ?? "https://image.tmdb.org/t/p").TrimEnd('/');
        }

        // GET /api/tmdb/popular?page=1
        [HttpGet("popular")]
        public async Task<IActionResult> GetPopular(int page = 1)
        {
            var result = await _tmdb.GetPopularAsync(page);

            var movies = result.results.Select(m => new TmdbMovieDto
            {
                Id = m.id,
                Title = m.title,
                Overview = m.overview,
                Rating = m.vote_average,
                PosterUrl = string.IsNullOrEmpty(m.poster_path)
                    ? null
                    : $"{_imageBase}/w500{m.poster_path}",
                ReleaseDate = m.release_date
            });

            return Ok(movies);
        }
    }
}
