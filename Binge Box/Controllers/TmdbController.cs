using BingeBox.External.Tmdb;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

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

        // 🎭 Genre-map för TMDb ID:n
        private static readonly Dictionary<int, string> GenreMap = new()
        {
            { 28, "Action" }, { 12, "Adventure" }, { 16, "Animation" },
            { 35, "Comedy" }, { 80, "Crime" }, { 99, "Documentary" },
            { 18, "Drama" }, { 10751, "Family" }, { 14, "Fantasy" },
            { 36, "History" }, { 27, "Horror" }, { 10402, "Music" },
            { 9648, "Mystery" }, { 10749, "Romance" }, { 878, "Science Fiction" },
            { 10770, "TV Movie" }, { 53, "Thriller" }, { 10752, "War" },
            { 37, "Western" }
        };

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
                    genre = m.genre_ids != null && m.genre_ids.Count > 0
                        ? string.Join(", ", m.genre_ids.Select(id => GenreMap.ContainsKey(id) ? GenreMap[id] : "Okänd"))
                        : "Okänd genre",
                    mediaType = m.title != null ? "movie" : "tv"
                });
            return Ok(formatted);
        }

        // 🔍 Dynamisk sökning (filmer, serier, personer)
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
                    genre = r.genre_ids != null && r.genre_ids.Count > 0
                        ? string.Join(", ", r.genre_ids.Select(id => GenreMap.ContainsKey(id) ? GenreMap[id] : "Okänd"))
                        : "Okänd genre",
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

        // 🎬 Detaljer för film/serie
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

            // 🎞️ Genrelistan
            string genreText = "Okänd genre";
            if (root.TryGetProperty("genres", out var genreArray) && genreArray.ValueKind == JsonValueKind.Array)
            {
                var genres = genreArray.EnumerateArray()
                    .Select(g => g.GetProperty("name").GetString())
                    .Where(g => !string.IsNullOrEmpty(g))
                    .ToList();
                if (genres.Any())
                    genreText = string.Join(", ", genres);
            }

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
                genre = genreText,
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

        // 🧭 BROWSE — år, årtionde, genre, rating, upcoming
        [HttpGet("browse")]
        public async Task<IActionResult> BrowseMovies(
      [FromQuery] string? decade = null,
      [FromQuery] string? genre = null,
      [FromQuery] string? ratingSort = null,   // "High to Low" eller "Low to High"
      [FromQuery] int page = 1)
        {
            var apiKey = "ce1d432c64f5d84d0cc30b70d6f30600";
            var baseUrl = "https://api.themoviedb.org/3/discover/movie";

            // --- 🧩 Basparametrar ---
            var sb = new System.Text.StringBuilder(
                $"{baseUrl}?api_key={apiKey}&language=en-US&region=US&include_adult=false&page={page}");

            // --- 🗓️ Årtionde ---
            // Endast decennier tillåts, t.ex. "1980s", "1990s", "2000s", "2010s", "2020s"
            if (!string.IsNullOrEmpty(decade))
            {
                decade = decade.Trim().ToLower();
                if (decade.EndsWith("s"))
                {
                    var decadeStr = decade.Substring(0, 4); // "1980" ur "1980s"
                    if (int.TryParse(decadeStr, out int d))
                    {
                        var start = $"{d}-01-01";
                        var end = $"{d + 9}-12-31";
                        sb.Append($"&primary_release_date.gte={start}&primary_release_date.lte={end}");
                    }
                }
            }

            // --- 🎭 Genre ---
            if (!string.IsNullOrEmpty(genre))
            {
                var match = GenreMap.FirstOrDefault(g => g.Value.Equals(genre, StringComparison.OrdinalIgnoreCase));
                if (match.Key != 0)
                    sb.Append($"&with_genres={match.Key}");
            }

            // --- ⭐ Sortering ---
            // TMDb stöder inte global sortering på rating för alla filmer direkt,
            // men vi kan använda "vote_average.desc" för att få globalt högst betyg.
            if (!string.IsNullOrEmpty(ratingSort))
            {
                if (ratingSort.Equals("High to Low", StringComparison.OrdinalIgnoreCase))
                    sb.Append("&sort_by=vote_average.desc&vote_count.gte=100"); // filtrera bort skräp med 1 röst
                else if (ratingSort.Equals("Low to High", StringComparison.OrdinalIgnoreCase))
                    sb.Append("&sort_by=vote_average.asc&vote_count.gte=100");
                else
                    sb.Append("&sort_by=popularity.desc");
            }
            else
            {
                sb.Append("&sort_by=popularity.desc");
            }

            var url = sb.ToString();
            Console.WriteLine($"📡 TMDB QUERY: {url}");

            // --- 🔗 Anrop till TMDb ---
            using var client = new HttpClient();
            var response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode)
                return StatusCode((int)response.StatusCode, "TMDb API request failed");

            var json = await response.Content.ReadAsStringAsync();
            var doc = JsonDocument.Parse(json);

            if (!doc.RootElement.TryGetProperty("results", out var results))
                return Ok(new { movies = new List<object>(), totalPages = 1, currentPage = page });

            var movies = new List<object>();

            foreach (var m in results.EnumerateArray())
            {
                if (!m.TryGetProperty("id", out var idProp)) continue;

                string? title = m.TryGetProperty("title", out var t) ? t.GetString() : null;
                if (string.IsNullOrEmpty(title)) continue;

                string? poster = m.TryGetProperty("poster_path", out var p) && p.ValueKind != JsonValueKind.Null
                    ? $"https://image.tmdb.org/t/p/w500{p.GetString()}"
                    : null;

                string? releaseDate = m.TryGetProperty("release_date", out var d) ? d.GetString() : null;
                double rating = m.TryGetProperty("vote_average", out var r) ? r.GetDouble() : 0;

                movies.Add(new
                {
                    id = idProp.GetInt32(),
                    title,
                    overview = m.TryGetProperty("overview", out var o) ? o.GetString() ?? "" : "",
                    rating,
                    releaseDate = releaseDate ?? "Unknown",
                    posterUrl = poster,
                    genre = m.TryGetProperty("genre_ids", out var g) && g.ValueKind == JsonValueKind.Array
                        ? string.Join(", ", g.EnumerateArray().Select(id =>
                            GenreMap.ContainsKey(id.GetInt32()) ? GenreMap[id.GetInt32()] : "Unknown"))
                        : "Unknown"
                });
            }

            var totalPages = doc.RootElement.TryGetProperty("total_pages", out var tp) ? tp.GetInt32() : 1;

            // --- 🔥 Returnera korrekt ---
            return Ok(new
            {
                currentPage = page,
                totalPages,
                movies = movies.OrderByDescending(m => ratingSort == "Low to High" ? 0 : ((dynamic)m).rating)
            });
        }


        // ======================================================
        // 🟣 GET: /api/tmdb/slug/{slug}
        // Hämta film via slug direkt från TMDb (ex: "the-dark-knight")
        // ======================================================
        [HttpGet("slug/{slug}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBySlug(string slug)
        {
            try
            {
                // 🧠 Gör om slug till vanlig söktext ("the-dark-knight" -> "The Dark Knight")
                var query = System.Globalization.CultureInfo.CurrentCulture.TextInfo
                    .ToTitleCase(slug.Replace("-", " "));

                // 🔍 Anropa TMDb SearchMoviesAsync
                var searchResults = await _tmdb.SearchMoviesAsync(query);

                if (searchResults == null || searchResults.results == null || searchResults.results.Count == 0)
                    return NotFound(new { message = $"Ingen film hittades för slug '{slug}'." });

                var first = searchResults.results.First();

                return Ok(new
                {
                    id = first.id,
                    title = first.title ?? "Okänd titel",
                    overview = first.overview ?? "Ingen beskrivning tillgänglig.",
                    rating = first.vote_average,
                    releaseDate = first.release_date ?? "Okänt datum",
                    posterUrl = first.poster_path != null
                        ? $"https://image.tmdb.org/t/p/w500{first.poster_path}"
                        : null,
                    genre = first.genre_ids != null && first.genre_ids.Count > 0
                        ? string.Join(", ", first.genre_ids.Select(id =>
                            GenreMap.ContainsKey(id) ? GenreMap[id] : "Okänd"))
                        : "Okänd genre"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ [GetBySlug] Fel: {ex.Message}");
                return StatusCode(500, new { message = "Ett internt fel uppstod.", error = ex.Message });
            }
        }
    }
}