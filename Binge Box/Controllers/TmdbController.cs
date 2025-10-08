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
                    result = await _tmdb.SearchMultiAsync(query, page);
                    break;
            }

            var items = result.results.Select(m =>
            {
                // PERSON
                if (cat == "person" || cat == "celebs")
                {
                    var knownForList = m.known_for?.Select(k => k.title ?? k.name)?.ToList() ?? new();
                    var overview = knownForList.Count > 0
                        ? $"Known for: {string.Join(", ", knownForList)}"
                        : "No works listed.";

                    return new TmdbMovieDto
                    {
                        Id = m.id,
                        Title = m.name ?? "(Unknown Person)",
                        Overview = overview,
                        Rating = m.vote_average,
                        PosterUrl = string.IsNullOrEmpty(m.profile_path) ? null : $"{_imageBase}/w500{m.profile_path}",
                        ReleaseDate = null
                    };
                }

                // FILMER / TV / ANNAT
                return new TmdbMovieDto
                {
                    Id = m.id,
                    Title = m.title ?? m.name,
                    Overview = m.overview,
                    Rating = m.vote_average,
                    PosterUrl = !string.IsNullOrEmpty(m.poster_path)
                        ? $"{_imageBase}/w500{m.poster_path}"
                        : !string.IsNullOrEmpty(m.profile_path)
                            ? $"{_imageBase}/w500{m.profile_path}"
                            : null,
                    ReleaseDate = m.release_date ?? m.first_air_date
                };
            });

            return Ok(items);
        }
    }
}
