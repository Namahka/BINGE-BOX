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

  const isOwnProfile = currentUser && parseInt(id) === currentUser.id;

  // 🔄 Ladda användardata
  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        const data = await getUserById(id);
        setUser(data);

        const [f1, f2] = await Promise.all([
          getFollowers(id),
          getFollowing(id),
        ]);
        setFollowers(f1);
        setFollowing(f2);

        // 🧠 Ladda favoritlistan
        let favs = [];
        if (isOwnProfile) favs = await getFavorites();
        else favs = await getUserFavorites(id);
        setFavorites(favs);

        // 🔹 Följstatus (om inloggad och inte sin egen)
        if (currentUser && !isOwnProfile) {
          const followState = await isFollowing(id);
          setAmFollowing(followState);
        }
      } catch (err) {
        console.error("⚠️ Kunde inte ladda profil:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [id, currentUser]);

  // 🟡 Följ / Avfölj
  async function handleFollow() {
    try {
      const result = await toggleFollow(id);
      setAmFollowing(result.following);
      const updated = await getFollowers(id);
      setFollowers(updated);
    } catch (err) {
      console.error("⚠️ Misslyckades följa/avfölja:", err);
    }
  }

  // ⭐ Lägg till / ta bort egen favorit
  const handleToggleFavorite = async (movie, e) => {
    e.stopPropagation(); // hindra navigation till MovieDetails
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
        {user.bio || "Ingen bio än."}
      </p>

      {/* Följknapp (inte på egen profil) */}
      {!isOwnProfile && (
        <button
          onClick={handleFollow}
          className={`mt-4 px-5 py-2 rounded-lg font-semibold transition-colors ${
            amFollowing
              ? "bg-gray-600 hover:bg-gray-700 text-white"
              : "bg-yellow-400 hover:bg-yellow-500 text-black"
          }`}
        >
          {amFollowing ? "Avfölj" : "Följ"}
        </button>
      )}

      {/* Följarinfo */}
      <div className="flex gap-6 mt-6">
        <button
          onClick={() => setView("followers")}
          className="text-gray-300 hover:text-yellow-400"
        >
          <span className="text-yellow-400 font-bold">{followers.length}</span>{" "}
          Följare
        </button>
        <button
          onClick={() => setView("following")}
          className="text-gray-300 hover:text-yellow-400"
        >
          <span className="text-yellow-400 font-bold">{following.length}</span>{" "}
          Följer
        </button>
      </div>

      {/* Flikar */}
      <div className="flex gap-6 mt-8 border-b border-gray-700 pb-2">
        {["about", "favorites"].map((tab) => (
          <button
            key={tab}
            onClick={() => setView(tab)}
            className={`capitalize ${
              view === tab
                ? "text-yellow-400 border-b-2 border-yellow-400"
                : "text-gray-400"
            }`}
          >
            {tab === "about" ? "Om mig" : "Favoriter"}
          </button>
        ))}
      </div>

      {/* Innehåll */}
      <section className="mt-6 w-full max-w-3xl text-center">
        {view === "about" && (
          <p className="text-gray-400">
            Gick med:{" "}
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString("sv-SE")
              : "Okänt datum"}
          </p>
        )}

        {/* FAVORITER */}
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

                    {/* 🔹 Stjärna — togglar MIN favorit */}
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
              <p className="text-gray-500">Inga favoriter ännu.</p>
            )}
          </div>
        )}

        {/* Följare */}
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
              <p className="text-gray-500">Inga följare ännu.</p>
            )}
          </ul>
        )}

        {/* Följer */}
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
              <p className="text-gray-500">Följer ingen ännu.</p>
            )}
          </ul>
        )}
      </section>
    </main>
  );
}
