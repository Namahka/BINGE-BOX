using System.Threading;
using System.Threading.Tasks;

namespace BingeBox.External.Tmdb
{
    public interface ITmdbClient
    {
        Task<TmdbSearchResult> GetPopularAsync(int page = 1, CancellationToken ct = default);
    }
}
