using System.Net.Http;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using BingeBox.Options;
using Microsoft.Extensions.Options;

namespace BingeBox.External.Tmdb
{
    public class TmdbClient : ITmdbClient
    {
        private readonly HttpClient _http;
        private readonly TmdbOptions _opts;

        public TmdbClient(IHttpClientFactory factory, IOptions<TmdbOptions> opts)
        {
            _http = factory.CreateClient("tmdb");   // använder named client från Program.cs
            _opts = opts.Value;
        }

        public async Task<TmdbSearchResult> GetPopularAsync(int page = 1, CancellationToken ct = default)
        {
            // v3-nyckel skickas som query-param
            var url = $"movie/popular?api_key={_opts.ApiKey}&language=en-US&page={page}";
            var result = await _http.GetFromJsonAsync<TmdbSearchResult>(url, ct);
            return result ?? new TmdbSearchResult();
        }
    }
}
