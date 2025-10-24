import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import {
  getProfile,
  getFollowers,
  getFollowing,
  getUserById,
  getUserReviews, // ✅ lägg till den här raden
} from "../api";
import { useAuth } from "../hooks/useAuth";
import { useFavorites } from "../hooks/useFavorites";
import { useWatchlist } from "../hooks/useWatchlist";
import MovieCard from "../components/MovieCard";
import CommentModal from "../components/CommentModal";

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

  navigate(type === "person" ? `/person/${id}` : `/${type}/${id}`, {
    state: { mediaType: type, fromProfile: true },
  });
};

export default function Profile() {
  const { user } = useAuth();
  const { favorites, toggleFavorite, reloadFavorites, loading } =
    useFavorites();
  const {
    watchlist,
    loading: watchlistLoading,
    updateStatus,
    removeFromWatchlist,
    reloadWatchlist,
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
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [activeReviewId, setActiveReviewId] = useState(null);

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

  // 🟣 Ladda profil, följare, watchlist, favoriter och reviews
  useEffect(() => {
    async function loadProfile() {
      try {
        // 🔸 1. Hämta inloggad användares profil
        const data = await getProfile();
        setPreviewImage(data.profileImageUrl || "");
        setNote(data.note || "");
        setAboutMe(data.aboutMe || "");

        // 🔸 2. Hämta följare och följda
        const [f1, f2] = await Promise.all([
          getFollowers(data.id),
          getFollowing(data.id),
        ]);

        // Hjälpfunktion för att hämta användarinfo till listorna
        const resolveUsers = async (list) =>
          Promise.all(
            list.map(async (f) => {
              const userId =
                f.id ||
                f.userId ||
                f.followerId ||
                f.followedId ||
                f.followingId;
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

        // 🔸 3. Ladda favoriter & watchlist
        await reloadFavorites();
        await reloadWatchlist?.();

        // 🔸 4. Ladda reviews
        await loadUserReviews(data.id);
      } catch (err) {
        console.error("⚠️ Kunde inte hämta profil:", err);
      }
    }

    loadProfile();
  }, []);

  // 🔹 Funktion för att hämta användarens recensioner + filmdata
  async function loadUserReviews(userId) {
    try {
      setReviewsLoading(true);
      const data = await getUserReviews(userId);

      if (!Array.isArray(data)) {
        setReviews([]);
        return;
      }

      // 🔸 Hämta filmdata från TMDB för varje review (titel, år, poster)
      const TMDB_KEY = "ce1d432c64f5d84d0cc30b70d6f30600";
      const enriched = await Promise.all(
        data.map(async (r) => {
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
              ? "About me"
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
                    className="relative group rounded-lg overflow-hidden border border-gray-700 cursor-pointer hover:scale-105 transition-transform duration-200 bg-neutral-900"
                  >
                    {/* Poster */}
                    <img
                      src={m.posterUrl || "/placeholder.jpg"}
                      alt={m.title}
                      className="w-full h-64 object-cover"
                    />

                    {/* Toggle-knapp */}
                    <button
                      onClick={(e) => handleToggleFavorite(m, e)}
                      className="absolute top-2 right-2 bg-black/70 p-1 rounded-full hover:bg-black transition"
                    >
                      <Star size={22} fill="#facc15" color="#facc15" />
                    </button>

                    {/* Info */}
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
                    status: String(w.status || w.Status || "")
                      .toLowerCase()
                      .trim(),
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
                          onMove={handleMove} // ✅ ändra till denna
                          onRemove={handleRemove} // ✅ lämna kvar denna
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center mt-6">
                      No {watchSubTab === "watched" ? "watched" : "to watch"}{" "}
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
              My Reviews
            </h2>

            {reviewsLoading ? (
              <p className="text-gray-400">Loading...</p>
            ) : reviews.length === 0 ? (
              <p className="text-gray-500">
                You haven’t written any reviews yet.
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
        onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
        alt={r.title || "Movie poster"}
        className="w-24 sm:w-28 rounded-md border border-yellow-500/40 shadow-md hover:opacity-90 transition"
      />
    </div>

    {/* 📋 Review Content */}
    <div className="flex flex-col justify-between flex-1 text-left">
      {/* 🎬 Top section */}
      <div className="flex justify-between items-start flex-wrap">
        <div
          onClick={() => navigate(`/movie/${r.movieId}`)}
          className="cursor-pointer"
        >
          <h3 className="text-xl font-bold text-yellow-400 hover:underline">
            {r.title || `Movie ID: ${r.movieId}`}
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            {r.releaseYear || r.year || ""}
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
            <span className="text-green-400">★</span> Watched{" "}
            <span className="text-gray-400">
              {r.watchedDate
                ? new Date(r.watchedDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : ""}
            </span>
          </p>
        </div>
      </div>

      {/* 📝 Review text */}
      <p className="text-gray-300 mt-3 leading-relaxed whitespace-pre-line text-left">
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

          {/* 💬 Comment */}
          <button
            onClick={() => setActiveReviewId(r.id)}
            className="flex items-center gap-1 hover:text-yellow-400 transition"
            title="Comment on review"
          >
            💬 <span>{r.commentCount ?? 0}</span>
          </button>
        </div>

        {/* ✏️ Edit / Delete */}
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
      </div>
    </div>

    {/* 🔽 Comment Modal */}
    {activeReviewId === r.id && (
  <CommentModal
    reviewId={r.id}
    currentUser={user}   // ✅ här använder vi "user" från useAuth()
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
          {/* Lägg till max-height + overflow-scroll */}
          <div className="bg-black border p-6 rounded-2xl w-[90%] max-w-lg relative max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-500 scrollbar-track-neutral-800">
            {/* Stängknapp */}
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-3 right-3 text-white hover:text-yellow-400 text-xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-yellow-400 mb-4">
              Edit Profile
            </h2>

            {/* Profilbild */}
            <div className="mb-5">
              <p className="font-semibold mb-2 text-white">Profile picture</p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={previewImage || "/default-avatar.png"}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover border-2 border-yellow-400"
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

            {/* Note */}
            <div className="mb-5">
              <p className="font-semibold mb-2 text-white">Note</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-black border p-3 rounded text-white resize-none h-20 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              ></textarea>
            </div>

            {/* About me */}
            <div className="mb-5">
              <p className="font-semibold mb-2 text-white">About me</p>
              <textarea
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                className="w-full bg-black border p-3 rounded text-white resize-none h-28 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              ></textarea>
            </div>

            {/* Knappar */}
            <div className="flex justify-end gap-3 sticky bottom-0 bg-black pt-2 pb-1">
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
