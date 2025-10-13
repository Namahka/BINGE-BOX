using System.Threading;
using System.Threading.Tasks;
using System.Text.Json;

namespace BingeBox.External.Tmdb
{
    public interface ITmdbClient
    {
        // 🔍 Sök & listor
        Task<TmdbSearchResult> GetPopularAsync(int page = 1, CancellationToken ct = default);
        Task<TmdbSearchResult> SearchMoviesAsync(string query, int page = 1, CancellationToken ct = default);
        Task<TmdbSearchResult> SearchTvAsync(string query, int page = 1, CancellationToken ct = default);
        Task<TmdbSearchResult> SearchPersonAsync(string query, int page = 1, CancellationToken ct = default);
        Task<TmdbSearchResult> SearchCompanyAsync(string query, int page = 1, CancellationToken ct = default);
        Task<TmdbSearchResult> SearchKeywordAsync(string query, int page = 1, CancellationToken ct = default);
        Task<TmdbSearchResult> SearchMultiAsync(string query, int page = 1, CancellationToken ct = default);

        // 🎬 Film / TV-detaljer
        Task<JsonDocument?> GetMovieDetailsAsync(int id, CancellationToken ct = default);
        Task<JsonDocument?> GetTvDetailsAsync(int id, CancellationToken ct = default);

        // 👤 Person-detaljer
        Task<JsonDocument?> GetPersonDetailsAsync(int id, CancellationToken ct = default);

        // 🧩 Gemensam metod
        Task<JsonDocument?> GetDetailsAsync(string type, int id, CancellationToken ct = default);
    }
}
