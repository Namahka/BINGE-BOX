using System.Threading;
using System.Threading.Tasks;

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
    }
}
