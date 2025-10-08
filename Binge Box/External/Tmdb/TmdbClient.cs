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

        public async Task<TmdbSearchResult> GetPopularAsync(int page = 1, CancellationToken ct = default)
        {
            // /movie/popular
            var url = $"movie/popular?api_key={_opts.ApiKey}&language=en-US&page={page}";
            var result = await _http.GetFromJsonAsync<TmdbSearchResult>(url, ct);
            return result ?? new TmdbSearchResult();
        }

        public async Task<TmdbSearchResult> SearchMoviesAsync(string query, int page = 1, CancellationToken ct = default)
        {
            // /search/movie
            var q = Uri.EscapeDataString(query ?? string.Empty);
            var url = $"search/movie?api_key={_opts.ApiKey}&language=en-US&query={q}&page={page}&include_adult=false";
            var result = await _http.GetFromJsonAsync<TmdbSearchResult>(url, ct);
            return result ?? new TmdbSearchResult();
        }
    }
}
