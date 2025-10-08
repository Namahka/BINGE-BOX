using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using BingeBox.External.Tmdb;
using BingeBox.Models;
using BingeBox.Options;

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
                PosterUrl = string.IsNullOrEmpty(m.poster_path) ? null : $"{_imageBase}/w500{m.poster_path}",
                ReleaseDate = m.release_date
            });

            return Ok(movies);
        }

        // GET /api/tmdb/search/movie?query=matrix&page=1
        [HttpGet("search/movie")]
        public async Task<IActionResult> SearchMovie([FromQuery] string query, int page = 1)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Query is required.");

            var result = await _tmdb.SearchMoviesAsync(query, page);

            var movies = result.results.Select(m => new TmdbMovieDto
            {
                Id = m.id,
                Title = m.title,
                Overview = m.overview,
                Rating = m.vote_average,
                PosterUrl = string.IsNullOrEmpty(m.poster_path) ? null : $"{_imageBase}/w500{m.poster_path}",
                ReleaseDate = m.release_date
            });

            return Ok(movies);
        }
    }
}
