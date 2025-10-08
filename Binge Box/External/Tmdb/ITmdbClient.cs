using System.Threading;
using System.Threading.Tasks;

namespace BingeBox.External.Tmdb
{
    /// <summary>
    /// Kontrakt för vår TMDb-klient.
    /// </summary>
    public interface ITmdbClient
    {
        /// <summary>Hämtar populära filmer.</summary>
        Task<TmdbSearchResult> GetPopularAsync(int page = 1, CancellationToken ct = default);

        /// <summary>Söker efter filmer (titles).</summary>
        Task<TmdbSearchResult> SearchMoviesAsync(string query, int page = 1, CancellationToken ct = default);

        /// <summary>Söker efter TV-serier.</summary>
        Task<TmdbSearchResult> SearchTvAsync(string query, int page = 1, CancellationToken ct = default);

        /// <summary>Söker efter personer (actors/celebs).</summary>
        Task<TmdbSearchResult> SearchPersonAsync(string query, int page = 1, CancellationToken ct = default);

        /// <summary>Söker efter produktionsbolag.</summary>
        Task<TmdbSearchResult> SearchCompanyAsync(string query, int page = 1, CancellationToken ct = default);

        /// <summary>Söker efter nyckelord (keywords).</summary>
        Task<TmdbSearchResult> SearchKeywordAsync(string query, int page = 1, CancellationToken ct = default);

        /// <summary>Multi-sökning (filmer, serier, personer – används för "All").</summary>
        Task<TmdbSearchResult> SearchMultiAsync(string query, int page = 1, CancellationToken ct = default);
    }
}
