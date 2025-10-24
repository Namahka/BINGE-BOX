import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getUserById,
  getFollowers,
  getFollowing,
  getUserFavorites,
  getUserWatchlist,
  getUserReviews,
  toggleFollow,
  isFollowing,
} from "../api";
import { useAuth } from "../hooks/useAuth";
import { useFavorites } from "../hooks/useFavorites";
import { Star } from "lucide-react";
import MovieCard from "../components/MovieCard";
import CommentModal from "../components/CommentModal";


// 🧭 Hjälpfunktion för att navigera till rätt mediatyp
const navigateToMedia = (navigate, item) => {
  if (!item) return;

  const rawType =
    item.mediaType || item.media_type || item.type || item.Type || "";
  let type = "movie";

  if (rawType.toLowerCase().includes("tv")) type = "tv";
  else if (rawType.toLowerCase().includes("person")) type = "person";

  if (item.first_air_date && !rawType) type = "tv";
  if (item.release_date && !rawType) type = "movie";

  const id = item.movieId || item.id;
  if (!id) return;

  navigate(type === "person" ? `/person/${id}` : `/${type}/${id}`, {
    state: { mediaType: type, fromProfile: true },
  });
};

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { favorites: myFavorites = [], toggleFavorite } = useFavorites();

  const [user, setUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [amFollowing, setAmFollowing] = useState(false);
  const [view, setView] = useState("about");
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [watchSubTab, setWatchSubTab] = useState("watched");
const [activeReviewId, setActiveReviewId] = useState(null);

  const isOwnProfile = currentUser && parseInt(id) === currentUser.id;

  // 🟡 Ladda användardata
  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        const data = await getUserById(id);
        setUser(data);

        const [f1, f2, favs, wl, revs] = await Promise.all([
          getFollowers(id),
          getFollowing(id),
          getUserFavorites(id),
          getUserWatchlist(id),
          getUserReviews(id),
        ]);

        setFollowers(f1);
        setFollowing(f2);
        setFavorites(favs);
        setWatchlist(wl);

        // 🔸 Ladda reviews med TMDB-data
        await loadUserReviews(revs);

        if (currentUser && !isOwnProfile) {
          const followState = await isFollowing(id);
          setAmFollowing(followState);
        }
      } catch (err) {
        console.error("⚠️ Kunde inte ladda användarprofil:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [id, currentUser]);

  // 🔹 Hämta TMDB-info till varje review
  async function loadUserReviews(reviewsData) {
    try {
      setReviewsLoading(true);
      if (!Array.isArray(reviewsData)) {
        setReviews([]);
        return;
      }

      const TMDB_KEY = "ce1d432c64f5d84d0cc30b70d6f30600";
      const enriched = await Promise.all(
        reviewsData.map(async (r) => {
          try {
            const res = await fetch(
              `https://api.themoviedb.org/3/movie/${r.movieId}?api_key=${TMDB_KEY}&language=en-US`
            );
            if (!res.ok) throw new Error("TMDB error");
            const movie = await res.json();
            return {
              ...r,
              title: movie.title || r.title || `Movie ID: ${r.movieId}`,
              year: movie.release_date
                ? movie.release_date.slice(0, 4)
                : movie.first_air_date
                ? movie.first_air_date.slice(0, 4)
                : "—",
              posterUrl: movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : null,
            };
          } catch {
            return {
              ...r,
              title: r.title || `Movie ID: ${r.movieId}`,
              year: "—",
              posterUrl: null,
            };
          }
        })
      );

      setReviews(enriched);
    } catch (err) {
      console.error("⚠️ Kunde inte hämta reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  }

  // 💛 Följ / avfölj
  async function handleFollow() {
    if (followLoading) return;
    try {
      setFollowLoading(true);
      const result = await toggleFollow(id);
      setAmFollowing(result.following);
      const updated = await getFollowers(id);
      setFollowers(updated);
    } catch (err) {
      console.error("⚠️ Misslyckades följa/avfölja:", err);
    } finally {
      setFollowLoading(false);
    }
  }

  // ⭐ Toggle favorit (på annan profil)
  const handleToggleFavorite = async (movie, e) => {
    e.stopPropagation();
    try {
      await toggleFavorite({
        ...movie,
        movieId: Number(movie.movieId || movie.id),
      });
    } catch (err) {
      console.error("❌ Kunde inte toggla favorit:", err);
    }
  };

  if (loading)
    return <p className="text-gray-400 text-center mt-10">Loading profile...</p>;

  if (!user)
    return (
      <p className="text-red-500 text-center mt-10">Could not load profile.</p>
    );

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4">
      <img
        src={user.profileImageUrl || "/default-avatar.png"}
        alt={user.username}
        className="w-32 h-32 rounded-full object-cover border-4 border-yellow-400 mb-4"
      />
      <h2 className="text-3xl font-bold text-yellow-400">{user.username}</h2>

      <p className="text-gray-300 mt-2 text-center max-w-md">
        {user.note || "Nothing to see here...Yet!"}
      </p>

      {!isOwnProfile && (
        <button
          onClick={handleFollow}
          disabled={followLoading}
          className={`mt-4 px-5 py-2 rounded-lg font-semibold transition-colors ${
            amFollowing
              ? "bg-black border hover:bg-yellow-500 hover:text-black text-white"
              : "bg-black border hover:bg-yellow-500 hover:text-black text-white"
          } ${followLoading ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {followLoading
            ? amFollowing
              ? "Unfollowing..."
              : "Following..."
            : amFollowing
            ? "Unfollow"
            : "Follow"}
        </button>
      )}

      {/* Followers count */}
      <div className="flex gap-6 mt-6">
        <button
          onClick={() => setView("followers")}
          className="text-gray-300 hover:text-yellow-400"
        >
          <span className="text-yellow-400 font-bold">{followers.length}</span>{" "}
          Followers
        </button>
        <button
          onClick={() => setView("following")}
          className="text-gray-300 hover:text-yellow-400"
        >
          <span className="text-yellow-400 font-bold">{following.length}</span>{" "}
          Following
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mt-8 border-b border-gray-700 pb-2">
        {["about", "favorites", "watchlist", "reviews"].map((tab) => (
          <button
            key={tab}
            onClick={() => setView(tab)}
            className={`capitalize ${
              view === tab
                ? "text-yellow-400 border-b-2 border-yellow-400"
                : "text-gray-400"
            }`}
          >
            {tab === "about"
              ? "About"
              : tab === "favorites"
              ? "Favorites"
              : tab === "watchlist"
              ? "Watchlist"
              : "Reviews"}
          </button>
        ))}
      </div>

      <section className="mt-6 w-full max-w-5xl text-center">
        {/* ABOUT */}
        {view === "about" && (
          <div className="text-gray-400 space-y-4">
            <p>{user.aboutMe || "This user hasn’t written anything yet."}</p>
          </div>
        )}

        {/* FAVORITES */}
        {view === "favorites" && (
          <section>
            <h2 className="text-xl font-bold text-yellow-400 mb-4">
              {isOwnProfile ? "My favorites" : `${user.username}'s favorites`}
            </h2>

            {favorites.length === 0 ? (
              <p className="text-gray-500">No favorites yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-4">
                {favorites.map((m) => {
                  const movieId = Number(m.movieId || m.id);
                  const isMyFav = myFavorites.some(
                    (f) => Number(f.movieId || f.id) === movieId
                  );

                  return (
                    <div
                      key={movieId}
                      onClick={() => navigateToMedia(navigate, m)}
                      className="relative group rounded-lg overflow-hidden border border-gray-700 cursor-pointer hover:scale-105 transition-transform duration-200 bg-neutral-900"
                    >
                      <img
                        src={m.posterUrl || "/placeholder.jpg"}
                        alt={m.title}
                        className="w-full h-64 object-cover"
                      />
                      <button
                        onClick={(e) => handleToggleFavorite(m, e)}
                        className="absolute top-2 right-2 bg-black/70 p-1 rounded-full hover:bg-black transition"
                      >
                        <Star
                          size={22}
                          fill={isMyFav ? "#facc15" : "none"}
                          color="#facc15"
                        />
                      </button>
                      <div className="p-3 text-left">
                        <h3 className="text-sm font-semibold text-yellow-400 truncate">
                          {m.title}
                        </h3>
                        {m.genre && (
                          <p className="text-xs text-gray-400 mb-1 italic">
                            {m.genre}
                          </p>
                        )}
                        {m.rating && (
                          <p className="text-xs text-yellow-300 mb-1">
                            ⭐ {m.rating.toFixed(1)}
                          </p>
                        )}
                        {m.overview && (
                          <p className="text-xs text-gray-300 line-clamp-3">
                            {m.overview}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* WATCHLIST */}
        {view === "watchlist" && (
          <div className="mt-6">
            <div className="flex justify-center gap-6 border-b border-gray-800 py-2">
              {["watched", "to-watch"].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setWatchSubTab(sub)}
                  className={`capitalize text-sm ${
                    watchSubTab === sub
                      ? "text-yellow-400 border-b-2 border-yellow-400"
                      : "text-gray-400"
                  }`}
                >
                  {sub === "watched" ? "Watched" : "To Watch"}
                </button>
              ))}
            </div>

            <div className="mt-6">
              {watchlist.length === 0 ? (
                <p className="text-gray-500">No watchlist items yet.</p>
              ) : (
                (() => {
                  const normalized = watchlist.map((w) => ({
                    ...w,
                    status: String(
                      w.status || w.Status || ""
                    ).toLowerCase().trim(),
                  }));

                  const data =
                    watchSubTab === "watched"
                      ? normalized.filter((x) => x.status === "watched")
                      : normalized.filter((x) => x.status === "to-watch");

                  return data.length ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                      {data.map((m) => (
                        <MovieCard key={m.movieId || m.id} movie={m} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center mt-6">
                      No{" "}
                      {watchSubTab === "watched"
                        ? "watched"
                        : "to watch"}{" "}
                      items yet.
                    </p>
                  );
                })()
              )}
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {view === "reviews" && (
          <section className="mt-6 w-full max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-yellow-400 mb-5">
              {isOwnProfile ? "My Reviews" : `${user.username}'s Reviews`}
            </h2>

            {reviewsLoading ? (
              <p className="text-gray-400">Loading...</p>
            ) : reviews.length === 0 ? (
              <p className="text-gray-500">
                {isOwnProfile
                  ? "You haven’t written any reviews yet."
                  : "This user hasn’t written any reviews yet."}
              </p>
            ) : (
              <div className="space-y-8">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-col sm:flex-row gap-4 bg-neutral-900 border border-gray-700 rounded-xl p-4 shadow-lg transition hover:border-yellow-400"
                  >
                    {/* 🎞️ Poster */}
                    <div
                      onClick={() => navigate(`/movie/${r.movieId}`)}
                      className="cursor-pointer shrink-0"
                    >
                      <img
                        src={r.posterUrl ? r.posterUrl : "/placeholder.jpg"}
                        onError={(e) =>
                          (e.currentTarget.src = "/placeholder.jpg")
                        }
                        alt={r.title || "Movie poster"}
                        className="w-20 sm:w-24 rounded-md border border-yellow-500/40 shadow-md hover:opacity-90 transition"
                      />
                    </div>

                    {/* 📋 Review Content */}
                    <div className="flex flex-col justify-between flex-1 text-left">
                      {/* 🎬 Titel, år, rating, watched */}
                      <div className="flex justify-between items-start flex-wrap">
                        <div
                          onClick={() => navigate(`/movie/${r.movieId}`)}
                          className="cursor-pointer"
                        >
                          <h3 className="text-xl font-bold text-yellow-400 hover:underline">
                            {r.title}
                          </h3>
                          <p className="text-gray-400 text-sm mt-1">
                            {r.year}
                          </p>
                        </div>

                        <div className="text-right">
                          {r.rating && (
                            <div className="text-yellow-400 flex items-center justify-end gap-1">
                              {"★".repeat(Math.round(r.rating))}
                              <span className="text-gray-400 text-sm ml-1">
                                ({r.rating}/5)
                              </span>
                            </div>
                          )}
                          <p className="text-gray-300 text-sm flex items-center justify-end gap-1 mt-1">
                            <span className="text-green-400">★</span> Watched
                          </p>
                        </div>
                      </div>

                      {/* 📝 Text */}
                      <p className="text-gray-300 mt-3 leading-relaxed whitespace-pre-line">
                        {r.content}
                      </p>

                 {/* ❤️ Likes + 💬 Comments + ✏️ Edit/Delete */}
<div className="flex justify-between items-center mt-4 text-sm text-gray-400">
  <div className="flex items-center gap-5">
    {/* 👍 Like */}
    <button
      onClick={async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            alert("You must be logged in to like reviews!");
            return;
          }

          const res = await fetch(
            `http://localhost:7299/api/reviewlikes/${r.id}/toggle`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (res.ok) {
            const data = await res.json();
            setReviews((prev) =>
              prev.map((rev) =>
                rev.id === r.id
                  ? { ...rev, likesCount: data.likesCount }
                  : rev
              )
            );
          }
        } catch (err) {
          console.error("⚠️ Failed to toggle like:", err);
        }
      }}
      className="flex items-center gap-1 hover:text-yellow-400 transition"
      title="Like review"
    >
      <span>👍</span>
      <span>{r.likesCount ?? 0}</span>
    </button>

    {/* 💬 Comments */}
    <button
      onClick={() => setActiveReviewId(r.id)}
      className="flex items-center gap-1 hover:text-yellow-400 transition"
      title="Comment on review"
    >
      💬 <span>{r.commentCount ?? 0}</span>
    </button>
  </div>

  {/* ✏️ Edit/Delete – endast om det är ens egen profil */}
  {isOwnProfile && (
    <div className="flex gap-3">
      <button
        onClick={() =>
          navigate(`/movie/${r.movieId}/review/edit/${r.id}`, {
            state: { review: r },
          })
        }
        className="hover:text-yellow-400 transition"
      >
      Edit
      </button>

      <button
        onClick={async () => {
          if (window.confirm("Are you sure you want to delete this review?")) {
            const token = localStorage.getItem("token");
            await fetch(`http://localhost:7299/api/reviews/${r.id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            setReviews((prev) => prev.filter((rev) => rev.id !== r.id));
          }
        }}
        className="hover:text-red-500 transition"
      >
        Delete
      </button>
    </div>
  )}
</div>

{/* 🔽 Comment Modal */}
{activeReviewId === r.id && (
 <CommentModal
  reviewId={r.id}
  currentUser={currentUser}
  onClose={() => setActiveReviewId(null)}
  onCommentCountChange={(count) =>
    setReviews((prev) =>
      prev.map((rev) =>
        rev.id === r.id ? { ...rev, commentCount: count } : rev
      )
    )
  }
/>

)}



                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* FOLLOWERS */}
        {view === "followers" && (
          <ul className="mt-6 flex flex-col items-center gap-3">
            {followers.length > 0 ? (
              followers.map((f) => (
                <Link
                  to={`/user/${f.id}`}
                  key={f.id}
                  className="flex items-center gap-3 bg-black border hover:bg-yellow-500 hover:text-black px-4 py-2 rounded-lg w-72 justify-start transition-all duration-200"
                >
                  <img
                    src={f.profileImageUrl || "/default-avatar.png"}
                    alt={f.username}
                    className="w-10 h-10 rounded-full object-cover border border-gray-700"
                  />
                  <span className="font-semibold">{f.username}</span>
                </Link>
              ))
            ) : (
              <p className="text-gray-500">No followers yet.</p>
            )}
          </ul>
        )}

        {/* FOLLOWING */}
        {view === "following" && (
          <ul className="mt-6 flex flex-col items-center gap-3">
            {following.length > 0 ? (
              following.map((f) => (
                <Link
                  to={`/user/${f.id}`}
                  key={f.id}
                  className="flex items-center gap-3 bg-black border hover:bg-yellow-500 hover:text-black px-4 py-2 rounded-lg w-72 justify-start transition-all duration-200"
                >
                  <img
                    src={f.profileImageUrl || "/default-avatar.png"}
                    alt={f.username}
                    className="w-10 h-10 rounded-full object-cover border border-gray-700"
                  />
                  <span className="font-semibold">{f.username}</span>
                </Link>
              ))
            ) : (
              <p className="text-gray-500">Not following anyone yet.</p>
            )}
          </ul>
        )}
      </section>
    </main>
  );
}
