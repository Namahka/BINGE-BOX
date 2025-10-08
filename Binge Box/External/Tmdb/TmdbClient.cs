using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using BingeBox.Options;
using Microsoft.Extensions.Options;

namespace BingeBox.External.Tmdb
{
    /// <summary>
    /// Implementation som pratar med TMDb v3-API via en named HttpClient ("tmdb").
    /// </summary>
    public class TmdbClient : ITmdbClient
    {
        private readonly HttpClient _http;
        private readonly TmdbOptions _opts;

        public TmdbClient(IHttpClientFactory factory, IOptions<TmdbOptions> opts)
        {
            _http = factory.CreateClient("tmdb");   // registrerad i Program.cs
            _opts = opts.Value ?? throw new ArgumentNullException(nameof(opts));
        }

        private async Task<TmdbSearchResult> GetAsync(string endpoint, CancellationToken ct = default)
        {
            var result = await _http.GetFromJsonAsync<TmdbSearchResult>(endpoint, ct);
            return result ?? new TmdbSearchResult();
        }

        // =============================
        // POPULAR MOVIES
        // =============================
        public async Task<TmdbSearchResult> GetPopularAsync(int page = 1, CancellationToken ct = default)
        {
            var url = $"movie/popular?api_key={_opts.ApiKey}&language=en-US&page={page}";
            return await GetAsync(url, ct);
        }

        // =============================
        // SEARCH ENDPOINTS
        // =============================

        public async Task<TmdbSearchResult> SearchMoviesAsync(string query, int page = 1, CancellationToken ct = default)
        {
            var q = Uri.EscapeDataString(query ?? string.Empty);
            var url = $"search/movie?api_key={_opts.ApiKey}&language=en-US&query={q}&page={page}&include_adult=false";
            return await GetAsync(url, ct);
        }

        public async Task<TmdbSearchResult> SearchTvAsync(string query, int page = 1, CancellationToken ct = default)
        {
            var q = Uri.EscapeDataString(query ?? string.Empty);
            var url = $"search/tv?api_key={_opts.ApiKey}&language=en-US&query={q}&page={page}&include_adult=false";
            return await GetAsync(url, ct);
        }

        public async Task<TmdbSearchResult> SearchPersonAsync(string query, int page = 1, CancellationToken ct = default)
        {
            var q = Uri.EscapeDataString(query ?? string.Empty);
            var url = $"search/person?api_key={_opts.ApiKey}&language=en-US&query={q}&page={page}";
            return await GetAsync(url, ct);
        }

        public async Task<TmdbSearchResult> SearchCompanyAsync(string query, int page = 1, CancellationToken ct = default)
        {
            var q = Uri.EscapeDataString(query ?? string.Empty);
            var url = $"search/company?api_key={_opts.ApiKey}&query={q}&page={page}";
            return await GetAsync(url, ct);
        }

        public async Task<TmdbSearchResult> SearchKeywordAsync(string query, int page = 1, CancellationToken ct = default)
        {
            var q = Uri.EscapeDataString(query ?? string.Empty);
            var url = $"search/keyword?api_key={_opts.ApiKey}&query={q}&page={page}";
            return await GetAsync(url, ct);
        }

        public async Task<TmdbSearchResult> SearchMultiAsync(string query, int page = 1, CancellationToken ct = default)
        {
            var q = Uri.EscapeDataString(query ?? string.Empty);
            var url = $"search/multi?api_key={_opts.ApiKey}&language=en-US&query={q}&page={page}&include_adult=false";
            return await GetAsync(url, ct);
        }
    }
}
