import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import {
  getProfile,
  getFollowers,
  getFollowing,
  getUserById,
} from "../api";
import { useAuth } from "../hooks/useAuth";
import { useFavorites } from "../hooks/useFavorites";
import { useWatchlist } from "../hooks/useWatchlist";
import MovieCard from "../components/MovieCard";

// 🧭 Hjälpfunktion för säker navigering
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
  if (!id) {
    console.error("❌ navigateToMedia: saknar id", item);
    return;
  }

  navigate(
    type === "person" ? `/person/${id}` : `/${type}/${id}`,
    { state: { mediaType: type, fromProfile: true } }
  );
};

export default function Profile() {
  const { user } = useAuth();
  const { favorites, toggleFavorite, reloadFavorites, loading } = useFavorites();
const {
  watchlist,
  loading: watchlistLoading,
  updateStatus,
  removeFromWatchlist,
  reloadWatchlist, // 🔄 Se till att din hook exporterar denna
} = useWatchlist();

const [localWatchlist, setLocalWatchlist] = useState([]);
  const [note, setNote] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [view, setView] = useState("about");
  const [isEditing, setIsEditing] = useState(false);
  const [favoritesList, setFavoritesList] = useState([]);
  const [watchSubTab, setWatchSubTab] = useState("watched");
  

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // 🟡 Initiera favoriter
  useEffect(() => {
    if (favorites && favorites.length > 0) setFavoritesList(favorites);
  }, [favorites]);

  useEffect(() => {
    if (!loading && favorites.length === 0) reloadFavorites();
  }, [loading]);

useEffect(() => {
  if (watchlist) setLocalWatchlist(watchlist);
}, [watchlist]);

  // 🟣 Ladda profil & följare
  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile();
        setPreviewImage(data.profileImageUrl || "");
        setNote(data.note || "");
        setAboutMe(data.aboutMe || "");

        const [f1, f2] = await Promise.all([
          getFollowers(data.id),
          getFollowing(data.id),
        ]);

        const resolveUsers = async (list) =>
          Promise.all(
            list.map(async (f) => {
              const userId =
                f.id || f.userId || f.followerId || f.followedId || f.followingId;
              try {
                const u = await getUserById(userId);
                return {
                  id: u.id,
                  username: u.username,
                  profileImageUrl: u.profileImageUrl,
                };
              } catch {
                return null;
              }
            })
          ).then((res) => res.filter(Boolean));

        setFollowers(await resolveUsers(f1));
        setFollowing(await resolveUsers(f2));
        await reloadFavorites();
        await reloadWatchlist?.(); // 🔄 se till att watchlist laddas initialt
      } catch (err) {
        console.error("⚠️ Kunde inte hämta profil:", err);
      }
    }
    loadProfile();
  }, []);

  // 🖼️ Hantera profilbild-val
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setPreviewImage(URL.createObjectURL(file));
  };

  // 💾 Spara profiländringar
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Ingen token sparad – logga in igen.");

      const formData = new FormData();
      formData.append("note", note);
      formData.append("aboutMe", aboutMe);
      const file = fileInputRef.current?.files[0];
      if (file) formData.append("profileImage", file);

      const res = await fetch("http://localhost:7299/api/User/update", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Misslyckades uppdatera profil");
      const data = await res.json();
      setNote(data.note || "");
      setAboutMe(data.aboutMe || "");
      setPreviewImage(data.profileImageUrl);
      setIsEditing(false);
      alert("Profil uppdaterad!");
    } catch (err) {
      console.error("❌ Kunde inte spara profil:", err);
      alert("Något gick fel.");
    }
  };

  // 💛 Favorit-toggle
  const handleToggleFavorite = async (movie, e) => {
    if (e) e.stopPropagation();
    const realMovieId = Number(movie.movieId ?? movie.id);
    setFavoritesList((prev) =>
      prev.filter((f) => Number(f.movieId ?? f.id) !== realMovieId)
    );
    try {
      await toggleFavorite({
        movieId: realMovieId,
        title: movie.title,
        posterUrl: movie.posterUrl,
        genre: movie.genre,
        rating: movie.rating,
        overview: movie.overview,
      });
    } catch (err) {
      console.error("⚠️ toggleFavorite-fel:", err);
      setFavoritesList((prev) => [...prev, movie]);
    }
  };

  // 🧩 Uppdatera lokalt utan omladdning när man flyttar / tar bort
const handleRemove = async (id) => {
  // 💨 uppdatera direkt i UI
  setLocalWatchlist((prev) => prev.filter((m) => m.movieId !== id));

  // 🔧 backend
  await removeFromWatchlist(id);
};

const handleMove = async (id, newStatus) => {
  console.log("🎬 handleMove:", { id, newStatus });

  const safeId = Number(id);
  const safeStatus = String(newStatus).toLowerCase();

  // 🟡 uppdatera direkt i UI
  setLocalWatchlist((prev) =>
    prev.map((m) =>
      Number(m.movieId) === safeId ? { ...m, status: safeStatus } : m
    )
  );

  // 🟡 uppdatera backend
  try {
    await updateStatus(safeId, safeStatus);
  } catch (err) {
    console.error("⚠️ Fel vid updateStatus:", err);
  }
};






  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4">
      <img
        src={previewImage || "/default-avatar.png"}
        alt="Profilbild"
        className="w-32 h-32 rounded-full object-cover border-4 border-yellow-400 mb-4"
      />
      <h2 className="text-3xl font-bold text-yellow-400">
        {user?.username || "Laddar..."}
      </h2>

      <p className="text-gray-300 mt-2 text-center max-w-md">
        {note || "Nothing to see here...Yet!."}
      </p>

      <button
        onClick={() => setIsEditing(true)}
        className="mt-4 px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg"
      >
        Edit profile
      </button>

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
            <p>{aboutMe || "No about info added yet."}</p>
          </div>
        )}

        {/* FAVORITES */}
        {view === "favorites" && (
          <section>
            <h2 className="text-xl font-bold text-yellow-400 mb-4">
              My favorites
            </h2>
            {favoritesList.length === 0 ? (
              <p className="text-gray-500">Inga favoriter ännu.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-4">
                {favoritesList.map((m) => (
                  <div
                    key={Number(m.movieId || m.id)}
                    onClick={() => navigateToMedia(navigate, m)}
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
                      <Star size={22} fill="#facc15" color="#facc15" />
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
                ))}
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
              {watchlistLoading ? (
                <p className="text-gray-400">Loading...</p>
              ) : (
                (() => {

 const normalized = localWatchlist.map((w) => ({
  ...w,
  status: String(w.status || w.Status || "").toLowerCase().trim(),
}));



                  const data =
                    watchSubTab === "watched"
                      ? normalized.filter((x) => x.status === "watched")
                      : normalized.filter((x) => x.status === "to-watch");

                  return data.length ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                      {data.map((m) => (
                        <MovieCard
  key={m.movieId || m.id}
  movie={m}
  onMove={handleMove}       // ✅ ändra till denna
  onRemove={handleRemove}   // ✅ lämna kvar denna
/>

                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center mt-6">
                      No {watchSubTab === "watched" ? "watched" : "to watch"} items yet.
                    </p>
                  );
                })()
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
              <p className="text-gray-500">No followers.</p>
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
              <p className="text-gray-500">Not following anyone</p>
            )}
          </ul>
        )}
      </section>

      {/* ✏️ Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black border p-6 rounded-2xl w-[90%] max-w-lg relative">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-3 right-3 text-white hover:text-yellow-400 text-xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-yellow-400 mb-4">
              Edit Profile
            </h2>

            <div className="mb-5">
              <p className="font-semibold mb-2 text-white">Profile picture</p>
              <div className="flex items-center gap-4">
                <img
                  src={previewImage || "/default-avatar.png"}
                  alt="Preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-yellow-400"
                />
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="text-sm text-slate-300"
                />
              </div>
            </div>

            <div className="mb-5">
              <p className="font-semibold mb-2 text-white">Note</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-black border p-3 rounded text-white resize-none h-20 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              ></textarea>
            </div>

            <div className="mb-5">
              <p className="font-semibold mb-2 text-white">About me</p>
              <textarea
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                className="w-full bg-black border p-3 rounded text-white resize-none h-28 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded bg-yellow-400 hover:bg-yellow-500 text-black"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-400 text-black font-semibold"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
