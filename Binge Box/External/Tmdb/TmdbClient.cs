using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using BingeBox.Options;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace BingeBox.External.Tmdb
{
    public class TmdbClient : ITmdbClient
    {
        private readonly HttpClient _http;
        private readonly TmdbOptions _opts;

        public TmdbClient(IHttpClientFactory factory, IOptions<TmdbOptions> opts)
        {
            _http = factory.CreateClient("tmdb");
            _opts = opts.Value ?? throw new ArgumentNullException(nameof(opts));
        }

        private async Task<TmdbSearchResult> GetAsync(string endpoint, int page, string query = "", CancellationToken ct = default)
        {
            var q = Uri.EscapeDataString(query ?? string.Empty);
            var url = $"{endpoint}?api_key={_opts.ApiKey}&language=en-US&page={page}";
            if (!string.IsNullOrWhiteSpace(query))
                url += $"&query={q}";
            try
            {
                var result = await _http.GetFromJsonAsync<TmdbSearchResult>(url, ct);
                return result ?? new TmdbSearchResult();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Fel vid anrop till TMDb ({endpoint}): {ex.Message}");
                return new TmdbSearchResult();
            }
        }

        public Task<TmdbSearchResult> GetPopularAsync(int page = 1, CancellationToken ct = default)
            => GetAsync("movie/popular", page, "", ct);
        public Task<TmdbSearchResult> SearchMoviesAsync(string query, int page = 1, CancellationToken ct = default)
            => GetAsync("search/movie", page, query, ct);
        public Task<TmdbSearchResult> SearchTvAsync(string query, int page = 1, CancellationToken ct = default)
            => GetAsync("search/tv", page, query, ct);
        public Task<TmdbSearchResult> SearchPersonAsync(string query, int page = 1, CancellationToken ct = default)
            => GetAsync("search/person", page, query, ct);
        public Task<TmdbSearchResult> SearchCompanyAsync(string query, int page = 1, CancellationToken ct = default)
            => GetAsync("search/company", page, query, ct);
        public Task<TmdbSearchResult> SearchKeywordAsync(string query, int page = 1, CancellationToken ct = default)
            => GetAsync("search/keyword", page, query, ct);
        public Task<TmdbSearchResult> SearchMultiAsync(string query, int page = 1, CancellationToken ct = default)
            => GetAsync("search/multi", page, query, ct);

        public async Task<JsonDocument?> GetMovieDetailsAsync(int id, CancellationToken ct = default)
            => await GetDetailsAsync("movie", id, ct);

        public async Task<JsonDocument?> GetTvDetailsAsync(int id, CancellationToken ct = default)
            => await GetDetailsAsync("tv", id, ct);

        // 👤 Person-detaljer
        public async Task<JsonDocument?> GetPersonDetailsAsync(int id, CancellationToken ct = default)
        {
            var url = $"person/{id}?api_key={_opts.ApiKey}&language=en-US&append_to_response=combined_credits";
            try
            {
                var response = await _http.GetAsync(url, ct);
                response.EnsureSuccessStatusCode();
                var stream = await response.Content.ReadAsStreamAsync(ct);
                return await JsonDocument.ParseAsync(stream, cancellationToken: ct);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Fel vid hämtning av person ({id}): {ex.Message}");
                return null;
            }
        }

        public async Task<JsonDocument?> GetDetailsAsync(string type, int id, CancellationToken ct = default)
        {
            var url = $"{type}/{id}?api_key={_opts.ApiKey}&language=en-US&append_to_response=videos,credits";
            try
            {
                var response = await _http.GetAsync(url, ct);
                response.EnsureSuccessStatusCode();
                var stream = await response.Content.ReadAsStreamAsync(ct);
                return await JsonDocument.ParseAsync(stream, cancellationToken: ct);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Fel vid hämtning av {type}-detaljer (ID {id}): {ex.Message}");
                return null;
            }
        }
    }
}
