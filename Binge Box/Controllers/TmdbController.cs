using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using BingeBox.External.Tmdb;

namespace BingeBox.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TmdbController : ControllerBase
    {
        private readonly ITmdbClient _tmdb;
        private readonly string _imageBase = "https://image.tmdb.org/t/p/";

        public TmdbController(ITmdbClient tmdb)
        {
            _tmdb = tmdb;
        }

        // 🔥 Populära filmer
        [HttpGet("popular")]
        public async Task<IActionResult> GetPopular([FromQuery] int page = 1)
        {
            var result = await _tmdb.GetPopularAsync(page);
            var formatted = result.results
                .OrderByDescending(m => m.vote_average)
                .ThenByDescending(m => m.release_date)
                .Select(m => new
                {
                    id = m.id,
                    title = m.title ?? m.name,
                    overview = m.overview,
                    rating = m.vote_average,
                    releaseDate = m.release_date ?? m.first_air_date,
                    posterUrl = m.poster_path != null ? $"{_imageBase}w500{m.poster_path}" : null,
                    mediaType = m.title != null ? "movie" : "tv"
                });
            return Ok(formatted);
        }

        // 🔍 Dynamisk sökning
        [HttpGet("search/{category}")]
        public async Task<IActionResult> Search(string category, [FromQuery] string query, [FromQuery] int page = 1)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Query cannot be empty.");

            var result = category.ToLower() switch
            {
                "movie" => await _tmdb.SearchMoviesAsync(query, page),
                "tv" => await _tmdb.SearchTvAsync(query, page),
                "person" => await _tmdb.SearchPersonAsync(query, page),
                _ => await _tmdb.SearchMultiAsync(query, page)
            };

            var formatted = result.results
                .OrderByDescending(r => r.vote_average)
                .ThenByDescending(r => r.release_date)
                .Select(r => new
                {
                    id = r.id,
                    title = r.title ?? r.name,
                    overview = r.overview ?? "",
                    rating = r.vote_average,
                    posterUrl = r.poster_path != null
                        ? $"{_imageBase}w500{r.poster_path}"
                        : (r.profile_path != null ? $"{_imageBase}w300{r.profile_path}" : null),
                    mediaType = (r.title != null ? "movie" : r.first_air_date != null ? "tv" : "person"),
                    knownFor = r.known_for?.Select(k => new
                    {
                        id = k.id,
                        title = k.title ?? k.name,
                        mediaType = k.media_type,
                        overview = k.overview,
                        rating = k.vote_average,
                        posterUrl = k.poster_path != null ? $"{_imageBase}w500{k.poster_path}" : null
                    })
                });

            return Ok(formatted);
        }

        // 🎬 Film eller serie-detaljer
        [HttpGet("details/{type}/{id}")]
        public async Task<IActionResult> GetDetails(string type, int id)
        {
            JsonDocument? json = type.ToLower() switch
            {
                "movie" => await _tmdb.GetMovieDetailsAsync(id),
                "tv" => await _tmdb.GetTvDetailsAsync(id),
                _ => null
            };

            if (json == null) return NotFound();

            var root = json.RootElement;
            string title = root.TryGetProperty("title", out var t)
                ? t.GetString()
                : root.GetProperty("name").GetString();

            string overview = root.TryGetProperty("overview", out var o) ? o.GetString() : "";
            string poster = root.TryGetProperty("poster_path", out var posterProp) && posterProp.ValueKind != JsonValueKind.Null
                ? $"{_imageBase}w500{posterProp.GetString()}"
                : null;
            string releaseDate = root.TryGetProperty("release_date", out var r1)
                ? r1.GetString()
                : (root.TryGetProperty("first_air_date", out var r2) ? r2.GetString() : null);
            double rating = root.TryGetProperty("vote_average", out var ra) ? ra.GetDouble() : 0;

            string? trailer = null;
            if (root.TryGetProperty("videos", out var vids))
            {
                foreach (var v in vids.GetProperty("results").EnumerateArray())
                {
                    if (v.GetProperty("site").GetString() == "YouTube" &&
                        v.GetProperty("type").GetString() == "Trailer")
                    {
                        trailer = $"https://www.youtube.com/watch?v={v.GetProperty("key").GetString()}";
                        break;
                    }
                }
            }

            var cast = new List<object>();
            if (root.TryGetProperty("credits", out var credits))
            {
                cast = credits.GetProperty("cast").EnumerateArray()
                    .OrderByDescending(c => c.TryGetProperty("popularity", out var pop) ? pop.GetDouble() : 0)
                    .Take(10)
                    .Select(c => new
                    {
                        id = c.GetProperty("id").GetInt32(),
                        name = c.GetProperty("name").GetString(),
                        character = c.TryGetProperty("character", out var ch) ? ch.GetString() : "",
                        profile = c.TryGetProperty("profile_path", out var prof) && prof.ValueKind != JsonValueKind.Null
                            ? $"{_imageBase}w200{prof.GetString()}"
                            : null
                    })
                    .ToList<object>();
            }

            return Ok(new
            {
                id,
                title,
                overview,
                rating,
                releaseDate,
                posterUrl = poster,
                trailer,
                cast
            });
        }

        // 👤 Person-detaljer
        [HttpGet("person/{id}")]
        public async Task<IActionResult> GetPerson(int id)
        {
            var json = await _tmdb.GetPersonDetailsAsync(id);
            if (json == null) return NotFound();

            var root = json.RootElement;
            string name = root.GetProperty("name").GetString() ?? "Okänd";
            string biography = root.TryGetProperty("biography", out var b) ? b.GetString() ?? "" : "";
            string profile = root.TryGetProperty("profile_path", out var p) && p.ValueKind != JsonValueKind.Null
                ? $"{_imageBase}w500{p.GetString()}"
                : null;

            var knownFor = new List<object>();
            if (root.TryGetProperty("combined_credits", out var credits))
            {
                knownFor = credits.GetProperty("cast").EnumerateArray()
                    .Where(c => c.TryGetProperty("poster_path", out _))
                    .OrderByDescending(c => c.TryGetProperty("vote_average", out var va) ? va.GetDouble() : 0)
                    .ThenByDescending(c => c.TryGetProperty("popularity", out var pop) ? pop.GetDouble() : 0)
                    .Take(12)
                    .Select(c => new
                    {
                        id = c.GetProperty("id").GetInt32(),
                        title = c.TryGetProperty("title", out var tt)
                            ? tt.GetString()
                            : (c.TryGetProperty("name", out var nn) ? nn.GetString() : "Untitled"),
                        character = c.TryGetProperty("character", out var ch) ? ch.GetString() : "",
                        mediaType = c.TryGetProperty("media_type", out var mt) ? mt.GetString() : "movie",
                        posterUrl = c.TryGetProperty("poster_path", out var pp) && pp.ValueKind != JsonValueKind.Null
                            ? $"{_imageBase}w500{pp.GetString()}"
                            : null
                    })
                    .ToList<object>();
            }

            return Ok(new
            {
                id,
                name,
                biography,
                profile,
                knownFor
            });
        }
    }
}
