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
    }
}
