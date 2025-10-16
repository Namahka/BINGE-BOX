import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import {
  getProfile,
  getFollowers,
  getFollowing,
  getUserById,
  toggleFavorite,
  getFavorites,
} from "../api";
import { useAuth } from "../hooks/useAuth";

export default function Profile() {
  const { user } = useAuth();
  const [bio, setBio] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [favoritesList, setFavoritesList] = useState([]);
  const [view, setView] = useState("about");
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // 🔄 Ladda profil, följare/följer och favoriter
  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile();
        setPreviewImage(data.profileImageUrl || "");
        setBio(data.bio || "");

        const [f1, f2, favs] = await Promise.all([
          getFollowers(data.id),
          getFollowing(data.id),
          getFavorites(),
        ]);

        const resolveUsers = async (list) => {
          return Promise.all(
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
        };

        setFollowers(await resolveUsers(f1));
        setFollowing(await resolveUsers(f2));

        // 🔹 Ta bort dubbletter lokalt baserat på MovieId
        const uniqueFavorites = Array.from(
          new Map(
            favs.map((m) => [Number(m.movieId || m.id), m])
          ).values()
        );

        setFavoritesList(uniqueFavorites);
      } catch (err) {
        console.error("⚠️ Kunde inte hämta profil:", err);
      }
    }

    loadProfile();
  }, []);

  // 📸 Byt profilbild
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewImage(URL.createObjectURL(file));
  };

  // 💾 Spara ändringar
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Ingen token sparad – logga in igen.");

      const formData = new FormData();
      formData.append("bio", bio);
      const file = fileInputRef.current?.files[0];
      if (file) formData.append("profileImage", file);

      const res = await fetch("https://localhost:7299/api/User/update", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Misslyckades uppdatera profil");
      const data = await res.json();
      setBio(data.bio);
      setPreviewImage(data.profileImageUrl);
      setIsEditing(false);
      alert("Profil uppdaterad!");
    } catch (err) {
      console.error("❌ Kunde inte spara profil:", err);
      alert("Något gick fel.");
    }
  };

  // ⭐ Lägg till eller ta bort favorit — utan dubbletter
  const handleToggleFavorite = async (movie) => {
    try {
      await toggleFavorite(movie);

      // Hämta senaste lista från backend
      const updated = await getFavorites();

      // Filtrera bort dubbletter baserat på MovieId
      const unique = Array.from(
        new Map(
          updated.map((f) => [Number(f.movieId || f.id), f])
        ).values()
      );

      setFavoritesList(unique);
    } catch (err) {
      console.error("⚠️ Kunde inte toggla favorit:", err);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4">
      {/* 👤 Profilhuvud */}
      <img
        src={previewImage || "/default-avatar.png"}
        alt="Profilbild"
        className="w-32 h-32 rounded-full object-cover border-4 border-yellow-400 mb-4"
      />
      <h2 className="text-3xl font-bold text-yellow-400">
        {user?.username || "Laddar..."}
      </h2>

      <p className="text-gray-300 mt-2 text-center max-w-md">
        {bio || "Ingen bio än."}
      </p>

      <button
        onClick={() => setIsEditing(true)}
        className="mt-4 px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg"
      >
        Redigera profil
      </button>

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

      {/* 📄 Innehåll */}
      <section className="mt-6 w-full max-w-3xl text-center">
        {view === "about" && (
          <p className="text-gray-400">
            Gick med:{" "}
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString("sv-SE")
              : "Okänt datum"}
          </p>
        )}

        {/* 🟡 FAVORITER */}
        {view === "favorites" && (
          <section>
            <h2 className="text-xl font-bold text-yellow-400 mb-4">
              Mina favoriter
            </h2>
            {favoritesList.length === 0 ? (
              <p className="text-gray-500">Inga favoriter ännu.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-4">
                {favoritesList.map((m) => (
                  <div
                    key={Number(m.movieId || m.id)}
                    onClick={() => navigate(`/movie/${Number(m.movieId || m.id)}`)}
                    className="relative group rounded-lg overflow-hidden border border-gray-700 cursor-pointer hover:scale-105 transition-transform duration-200"
                  >
                    <img
                      src={m.posterUrl || "/placeholder.jpg"}
                      alt={m.title}
                      className="w-full h-64 object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(m);
                      }}
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

        {/* 🧍 Följare */}
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
              <p className="text-gray-500">Inga följare ännu.</p>
            )}
          </ul>
        )}

        {/* 👥 Följer */}
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

      {/* ✏️ Modal */}
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
              Redigera profil
            </h2>

            <div className="mb-5">
              <p className="font-semibold mb-2 text-white">Profilbild</p>
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
              <p className="font-semibold mb-2 text-white">Om mig</p>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-black border p-3 rounded text-white resize-none h-28 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Skriv lite om dig själv..."
              ></textarea>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded bg-yellow-400 hover:bg-yellow-500 text-black"
              >
                Avbryt
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-400 text-black font-semibold"
              >
                Spara ändringar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
