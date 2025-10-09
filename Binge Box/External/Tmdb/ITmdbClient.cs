using System.Threading;
using System.Threading.Tasks;
using System.Text.Json;

namespace BingeBox.External.Tmdb
{
    public interface ITmdbClient
    {
        Task<TmdbSearchResult> GetPopularAsync(int page = 1, CancellationToken ct = default);
        Task<TmdbSearchResult> SearchMoviesAsync(string query, int page = 1, CancellationToken ct = default);
        Task<TmdbSearchResult> SearchTvAsync(string query, int page = 1, CancellationToken ct = default);
        Task<TmdbSearchResult> SearchPersonAsync(string query, int page = 1, CancellationToken ct = default);
        Task<TmdbSearchResult> SearchCompanyAsync(string query, int page = 1, CancellationToken ct = default);
        Task<TmdbSearchResult> SearchKeywordAsync(string query, int page = 1, CancellationToken ct = default);
        Task<TmdbSearchResult> SearchMultiAsync(string query, int page = 1, CancellationToken ct = default);

        // 🎬 Film-detaljer (med trailer + credits)
        Task<JsonDocument?> GetMovieDetailsAsync(int id, CancellationToken ct = default);

        // 📺 TV-detaljer (för serier)
        Task<JsonDocument?> GetTvDetailsAsync(int id, CancellationToken ct = default);
    }
}
