import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getUserById,
  getFollowers,
  getFollowing,
  getUserFavorites,
  getFavorites,
  toggleFollow,
  isFollowing,
} from "../api";
import { Star } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useFavorites } from "../hooks/useFavorites";
import MovieCard from "../components/MovieCard";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { favorites: myFavorites = [], toggleFavorite } = useFavorites();

  const [user, setUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [amFollowing, setAmFollowing] = useState(false);
  const [view, setView] = useState("about");
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  // watchlist
  const [watchTab, setWatchTab] = useState("tv");
  const [watchSubTab, setWatchSubTab] = useState("watched");
  const [tvWatched, setTvWatched] = useState([]);
  const [tvToWatch, setTvToWatch] = useState([]);
  const [movieWatched, setMovieWatched] = useState([]);
  const [movieToWatch, setMovieToWatch] = useState([]);

  const isOwnProfile = currentUser && parseInt(id) === currentUser.id;

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        const data = await getUserById(id);
        setUser(data);

        const [f1, f2] = await Promise.all([getFollowers(id), getFollowing(id)]);
        setFollowers(f1);
        setFollowing(f2);

        let favs = [];
        if (isOwnProfile) favs = await getFavorites();
        else favs = await getUserFavorites(id);
        setFavorites(favs);

        if (currentUser && !isOwnProfile) {
          const followState = await isFollowing(id);
          setAmFollowing(followState);
        }

        // TODO: ladda watchlist från backend
        setTvWatched([]);
        setTvToWatch([]);
        setMovieWatched([]);
        setMovieToWatch([]);
      } catch (err) {
        console.error("⚠️ Kunde inte ladda profil:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [id, currentUser]);

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
    return <p className="text-gray-400 text-center mt-10">Laddar profil...</p>;
  if (!user)
    return (
      <p className="text-red-500 text-center mt-10">
        Kunde inte ladda profil.
      </p>
    );

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4">
      {/* 👤 Profilinfo */}
      <img
        src={user.profileImageUrl || "/default-avatar.png"}
        alt={user.username}
        className="w-32 h-32 rounded-full object-cover border-4 border-yellow-400 mb-4"
      />
      <h2 className="text-3xl font-bold text-yellow-400">{user.username}</h2>
      <p className="text-gray-300 mt-2 max-w-md text-center">
        {user.note || "Nothing to see here...Yet!"}
      </p>

      {!isOwnProfile && (
        <button
          onClick={handleFollow}
          disabled={followLoading}
          className={`mt-4 px-5 py-2 rounded-lg font-semibold transition-colors ${
            amFollowing
              ? "bg-gray-600 hover:bg-gray-700 text-white"
              : "bg-yellow-400 hover:bg-yellow-500 text-black"
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

      {/* Flikar */}
      <div className="flex gap-6 mt-8 border-b border-gray-700 pb-2">
        {["about", "favorites", "watchlist"].map((tab) => (
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
              ? "About me"
              : tab === "favorites"
              ? "Favorites"
              : "Watchlist"}
          </button>
        ))}
      </div>

      <section className="mt-6 w-full max-w-5xl text-center">
        {/* ABOUT */}
        {view === "about" && (
          <div className="text-gray-400 space-y-4">
            <p className="whitespace-pre-line">
              {user.aboutMe || "This user hasn't written anything yet."}
            </p>
          </div>
        )}

        {/* FAVORITES */}
        {view === "favorites" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {favorites.length > 0 ? (
              favorites.map((m) => {
                const movieId = Number(m.movieId || m.id);
                const isMyFav = myFavorites.some(
                  (f) => Number(f.movieId || f.id) === movieId
                );

                return (
                  <div
                    key={movieId}
                    onClick={() => navigate(`/movie/${movieId}`)}
                    className="relative group rounded-lg overflow-hidden border border-gray-700 cursor-pointer hover:scale-105 transition-transform duration-200"
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

                    <div className="p-2 text-center">
                      <h3 className="text-sm font-semibold text-yellow-400 truncate">
                        {m.title}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {m.genre || "Okänd genre"}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500">No favorites yet</p>
            )}
          </div>
        )}

        {/* WATCHLIST */}
        {view === "watchlist" && (
          <div className="mt-6">
            <div className="flex justify-center gap-6 border-b border-gray-700 pb-2">
              {["tv", "movies"].map((t) => (
                <button
                  key={t}
                  onClick={() => setWatchTab(t)}
                  className={`uppercase text-sm ${
                    watchTab === t
                      ? "text-yellow-400 border-b-2 border-yellow-400"
                      : "text-gray-400"
                  }`}
                >
                  {t === "tv" ? "TV SERIES" : "MOVIES"}
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-6 border-b border-gray-800 py-2 mt-3">
              {["watched", "toWatch"].map((sub) => (
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
              {watchTab === "tv" ? (
                watchSubTab === "watched" ? (
                  tvWatched.length ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                      {tvWatched.map((m) => (
                        <MovieCard key={m.id} movie={m} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No watched TV shows yet.</p>
                  )
                ) : tvToWatch.length ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {tvToWatch.map((m) => (
                      <MovieCard key={m.id} movie={m} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No TV shows to watch yet.</p>
                )
              ) : watchSubTab === "watched" ? (
                movieWatched.length ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {movieWatched.map((m) => (
                      <MovieCard key={m.id} movie={m} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No watched movies yet.</p>
                )
              ) : movieToWatch.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {movieToWatch.map((m) => (
                    <MovieCard key={m.id} movie={m} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No movies to watch yet.</p>
              )}
            </div>
          </div>
        )}

        {/* FOLLOWERS */}
        {view === "followers" && (
          <ul className="mt-6 flex flex-col items-center gap-3">
            {followers.length > 0 ? (
              followers.map((f) => (
                <Link
                  to={`/user/${f.id}`}
                  key={f.id}
                  className="flex items-center gap-3 bg-gray-900 hover:bg-yellow-400 hover:text-black px-4 py-2 rounded-lg w-72 justify-start transition-all duration-200"
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
              <p className="text-gray-500">Not following anyone.</p>
            )}
          </ul>
        )}
      </section>
    </main>
  );
}
