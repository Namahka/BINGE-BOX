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

        // =============================
        // POPULAR
        // =============================
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

        // =============================
        // GENERIC SEARCH (IMDb-style dropdown)
        // =============================
        // GET /api/tmdb/search/{category}?query=matrix&page=1
        [HttpGet("search/{category}")]
        public async Task<IActionResult> SearchByCategory(string category, [FromQuery] string query, int page = 1)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Query is required.");

            var cat = category?.ToLower() ?? "all";
            TmdbSearchResult result;

            switch (cat)
            {
                case "movie":
                case "titles":
                    result = await _tmdb.SearchMoviesAsync(query, page);
                    break;
                case "tv":
                case "episodes":
                    result = await _tmdb.SearchTvAsync(query, page);
                    break;
                case "person":
                case "celebs":
                    result = await _tmdb.SearchPersonAsync(query, page);
                    break;
                case "company":
                case "companies":
                    result = await _tmdb.SearchCompanyAsync(query, page);
                    break;
                case "keyword":
                case "keywords":
                    result = await _tmdb.SearchKeywordAsync(query, page);
                    break;
                default:
                    // "all" or anything else = multi search
                    result = await _tmdb.SearchMultiAsync(query, page);
                    break;
            }

            // Mappa resultatet till ett gemensamt DTO-format
            var items = result.results.Select(m => new TmdbMovieDto
            {
                Id = m.id,
                Title = m.title ?? m.name, // vissa (t.ex. TV/person) har 'name' istället för 'title'
                Overview = m.overview,
                Rating = m.vote_average,
                PosterUrl = string.IsNullOrEmpty(m.poster_path) ? null : $"{_imageBase}/w500{m.poster_path}",
                ReleaseDate = m.release_date ?? m.first_air_date
            });

            return Ok(items);
        }

        // =============================
        // (Optional) Original endpoint /search/movie för kompatibilitet
        // =============================
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
