using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using BingeBox.External.Tmdb;
using BingeBox.Models;
using BingeBox.Options;
using System.Collections.Generic;
using System.Text.Json;

namespace BingeBox.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TmdbController : ControllerBase
    {
        private readonly ITmdbClient _tmdb;
        private readonly string _imageBase;

        // TMDb genre mapping
        private static readonly Dictionary<int, string> GenreNames = new()
        {
            { 28, "Action" },
            { 12, "Adventure" },
            { 16, "Animation" },
            { 35, "Comedy" },
            { 80, "Crime" },
            { 99, "Documentary" },
            { 18, "Drama" },
            { 10751, "Family" },
            { 14, "Fantasy" },
            { 36, "History" },
            { 27, "Horror" },
            { 10402, "Music" },
            { 9648, "Mystery" },
            { 10749, "Romance" },
            { 878, "Science Fiction" },
            { 10770, "TV Movie" },
            { 53, "Thriller" },
            { 10752, "War" },
            { 37, "Western" }
        };

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
                    : $"{_imageBase}/w500/placeholder.jpg",
                ReleaseDate = m.release_date ?? m.first_air_date,
                Genres = (m.genre_ids != null && m.genre_ids.Count > 0)
                    ? m.genre_ids.Select(id => GenreNames.ContainsKey(id) ? GenreNames[id] : "Unknown").ToList()
                    : new List<string>()
            });

            return Ok(movies);
        }

        // =============================
        // SEARCH
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

                if (isPerson && m.name?.ToLower() == query.Trim().ToLower())
                {
                    matchedPerson = m;
                    continue;
                }

                items.Add(MapItem(m, false));
            }

            if (matchedPerson != null)
                items.Insert(0, MapItem(matchedPerson, true));

            items = items
                .OrderByDescending(i => i.ReleaseDate == null && i.Overview.StartsWith("Known for"))
                .ThenByDescending(i => i.Rating ?? 0)
                .ToList();

            return Ok(items);
        }

        // =============================
        // MAP ITEM
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

            var genres = (m.genre_ids != null && m.genre_ids.Count > 0)
                ? m.genre_ids.Select(id => GenreNames.ContainsKey(id) ? GenreNames[id] : "Unknown").ToList()
                : new List<string>();

            var title = m.title ?? m.name ?? "(Untitled)";
            var overviewText = string.IsNullOrWhiteSpace(m.overview)
                ? "No description available."
                : m.overview.Trim();

            var image =
                !string.IsNullOrEmpty(m.poster_path)
                    ? $"{_imageBase}/w500{m.poster_path}"
                    : $"{_imageBase}/w500/placeholder.jpg";

            return new TmdbMovieDto
            {
                Id = m.id,
                Title = title,
                Overview = overviewText,
                Rating = m.vote_average > 0 ? m.vote_average : null,
                PosterUrl = image,
                ReleaseDate = m.release_date ?? m.first_air_date,
                Genres = genres
            };
        }

        // =============================
        // 🎬 MOVIE DETAILS (extended)
        // =============================
        [HttpGet("movie/{id}")]
        public async Task<IActionResult> GetMovieById(int id)
        {
            var details = await _tmdb.GetMovieDetailsAsync(id);
            if (details == null)
                return NotFound(new { message = "Movie not found" });

            var root = details.RootElement;

            var title = root.GetProperty("title").GetString();
            var overview = root.TryGetProperty("overview", out var o) ? o.GetString() : "No overview available.";
            var rating = root.TryGetProperty("vote_average", out var v) ? v.GetDouble() : 0;
            var release = root.TryGetProperty("release_date", out var rd) ? rd.GetString() : null;
            var poster = root.TryGetProperty("poster_path", out var p) ? $"{_imageBase}/w500{p.GetString()}" : null;

            // === Genres ===
            var genres = new List<string>();
            if (root.TryGetProperty("genres", out var gEl))
            {
                foreach (var g in gEl.EnumerateArray())
                {
                    genres.Add(g.GetProperty("name").GetString());
                }
            }

            // === Trailer ===
            string? trailer = null;
            if (root.TryGetProperty("videos", out var videos) && videos.TryGetProperty("results", out var results))
            {
                string? fallback = null;

                foreach (var vid in results.EnumerateArray())
                {
                    if (vid.TryGetProperty("site", out var site) && site.GetString() == "YouTube" &&
                        vid.TryGetProperty("key", out var key))
                    {
                        var url = $"https://www.youtube.com/embed/{key.GetString()}";

                        if (vid.TryGetProperty("type", out var type))
                        {
                            var typeStr = type.GetString()?.ToLower() ?? "";

                            if (typeStr.Contains("trailer"))
                            {
                                trailer = url; // 🎬 Hittade trailer → använd direkt
                                break;
                            }
                            else if (fallback == null && (typeStr.Contains("teaser") || typeStr.Contains("clip")))
                            {
                                fallback = url; // 💾 Fallback om trailer saknas
                            }
                        }
                    }
                }

                // Om ingen trailer hittades, använd fallback (teaser/clip)
                trailer ??= fallback;
            }


            // === Cast ===
            var castList = new List<object>();
            if (root.TryGetProperty("credits", out var credits) && credits.TryGetProperty("cast", out var cast))
            {
                foreach (var actor in cast.EnumerateArray().Take(10))
                {
                    castList.Add(new
                    {
                        Id = actor.GetProperty("id").GetInt32(),
                        Name = actor.GetProperty("name").GetString(),
                        Character = actor.GetProperty("character").GetString(),
                        Profile = actor.TryGetProperty("profile_path", out var pp) && pp.ValueKind != JsonValueKind.Null
                            ? $"{_imageBase}/w200{pp.GetString()}"
                            : null
                    });
                }
            }

            return Ok(new
            {
                Id = id,
                Title = title,
                Overview = overview,
                Rating = rating,
                ReleaseDate = release,
                PosterUrl = poster,
                Trailer = trailer,
                Genres = genres,
                Cast = castList
            });
        }

        // =============================
        // 👤 PERSON DETAILS
        // =============================
        [HttpGet("person/{id}")]
        public async Task<IActionResult> GetPersonDetails(int id, [FromServices] IOptions<TmdbOptions> opts)
        {
            var apiKey = opts.Value.ApiKey;
            var url = $"https://api.themoviedb.org/3/person/{id}?api_key={apiKey}&language=en-US&append_to_response=combined_credits";

            using var client = new HttpClient();
            var result = await client.GetFromJsonAsync<JsonElement>(url);

            if (result.ValueKind == JsonValueKind.Undefined)
                return NotFound();

            var name = result.GetProperty("name").GetString();
            var biography = result.TryGetProperty("biography", out var bioEl)
                ? bioEl.GetString()
                : "Ingen biografi tillgänglig.";

            var profile = result.TryGetProperty("profile_path", out var profEl)
                ? $"{_imageBase}/w500{profEl.GetString()}"
                : $"{_imageBase}/w500/placeholder.jpg";

            var knownFor = new List<object>();
            if (result.TryGetProperty("combined_credits", out var credits) &&
                credits.TryGetProperty("cast", out var castArray))
            {
                foreach (var item in castArray.EnumerateArray().Take(10))
                {
                    knownFor.Add(new
                    {
                        Id = item.GetProperty("id").GetInt32(),
                        Title = item.GetProperty("title").GetString() ?? item.GetProperty("name").GetString(),
                        Poster = item.TryGetProperty("poster_path", out var poster)
                            ? $"{_imageBase}/w300{poster.GetString()}"
                            : null,
                        Character = item.TryGetProperty("character", out var ch)
                            ? ch.GetString()
                            : null
                    });
                }
            }

            return Ok(new
            {
                Id = id,
                Name = name,
                Biography = biography,
                Profile = profile,
                KnownFor = knownFor
            });
        }
    }
}
