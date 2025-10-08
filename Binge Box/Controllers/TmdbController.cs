using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using BingeBox.External.Tmdb;
using BingeBox.Models;
using BingeBox.Options;
using System.Collections.Generic;

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
        [HttpGet("popular")]
        public async Task<IActionResult> GetPopular(int page = 1)
        {
            var result = await _tmdb.GetPopularAsync(page);

            var movies = result.results.Select(m => new TmdbMovieDto
            {
                Id = m.id,
                Title = m.title ?? m.name,
                Overview = string.IsNullOrWhiteSpace(m.overview)
                    ? "No description available."
                    : m.overview.Trim(),
                Rating = m.vote_average > 0 ? m.vote_average : null,
                PosterUrl = !string.IsNullOrEmpty(m.poster_path)
                    ? $"{_imageBase}/w500{m.poster_path}"
                    : !string.IsNullOrEmpty(m.profile_path)
                        ? $"{_imageBase}/w500{m.profile_path}"
                        : $"{_imageBase}/w500/placeholder.jpg",
                ReleaseDate = m.release_date ?? m.first_air_date
            });

            return Ok(movies);
        }

        // =============================
        // SEARCH (All categories)
        // =============================
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
                default:
                    result = await _tmdb.SearchMultiAsync(query, page);
                    break;
            }

            var items = new List<TmdbMovieDto>();
            TmdbItem? matchedPerson = null;

            foreach (var m in result.results)
            {
                bool isPerson =
                    (cat == "person" || cat == "celebs") ||
                    (m.known_for != null && m.known_for.Count > 0) ||
                    (string.IsNullOrEmpty(m.title) && !string.IsNullOrEmpty(m.name) && string.IsNullOrEmpty(m.release_date));

                // Spara exakt matchande person
                if (isPerson && m.name?.ToLower() == query.Trim().ToLower())
                {
                    matchedPerson = m;
                    continue;
                }

                // Lägg till film eller serie
                items.Add(MapItem(m, false));
            }

            if (matchedPerson != null)
                items.Insert(0, MapItem(matchedPerson, true));

            // Sortera filmer & serier efter högst betyg
            items = items
                .OrderByDescending(i => i.ReleaseDate == null && i.Overview.StartsWith("Known for"))
                .ThenByDescending(i => i.Rating ?? 0)
                .ToList();

            return Ok(items);
        }

        // =============================
        // MAP ITEM (film / serie / person)
        // =============================
        private TmdbMovieDto MapItem(TmdbItem m, bool isPerson)
        {
            if (isPerson)
            {
                var knownForList = m.known_for?
                    .Select(k => k.title ?? k.name)
                    .Where(s => !string.IsNullOrEmpty(s))
                    .Take(3)
                    .ToList() ?? new();

                var overview = knownForList.Count > 0
                    ? $"Known for: {string.Join(", ", knownForList)}"
                    : "Known for: Not available";

                var imageUrl = !string.IsNullOrEmpty(m.profile_path)
                    ? $"{_imageBase}/w500{m.profile_path}"
                    : (m.known_for?.FirstOrDefault(k => !string.IsNullOrEmpty(k.poster_path))?.poster_path != null
                        ? $"{_imageBase}/w500{m.known_for.First(k => !string.IsNullOrEmpty(k.poster_path)).poster_path}"
                        : $"{_imageBase}/w500/placeholder.jpg");

                return new TmdbMovieDto
                {
                    Id = m.id,
                    Title = m.name ?? "(Unknown Person)",
                    Overview = overview,
                    Rating = null,
                    PosterUrl = imageUrl,
                    ReleaseDate = null
                };
            }

            // ====== FILM / TV ======
            var title = m.title ?? m.name ?? "(Untitled)";
            var overviewText = string.IsNullOrWhiteSpace(m.overview)
                ? "No description available."
                : m.overview.Trim();

            var image =
                !string.IsNullOrEmpty(m.poster_path)
                    ? $"{_imageBase}/w500{m.poster_path}"
                    : !string.IsNullOrEmpty(m.profile_path)
                        ? $"{_imageBase}/w500{m.profile_path}"
                        : $"{_imageBase}/w500/placeholder.jpg";

            return new TmdbMovieDto
            {
                Id = m.id,
                Title = title,
                Overview = overviewText,
                Rating = m.vote_average > 0 ? m.vote_average : null,
                PosterUrl = image,
                ReleaseDate = m.release_date ?? m.first_air_date
            };
        }
    }
}
