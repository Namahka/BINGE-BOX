import { useState, useRef, useEffect } from "react";
import { getProfile } from "../api";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext"; // 👈 fixat import
import MovieCard from "../components/MovieCard";

export default function Profile() {
  const { user } = useAuth();
  const { favorites } = useFavorites(); // 👈 nu fungerar den
  const [activeTab, setActiveTab] = useState("about"); // 👈 ingen rödmarkering
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [bio, setBio] = useState("");
  const fileInputRef = useRef(null);

  // 🔄 Hämta profilinfo
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setPreviewImage(data.profileImageUrl || "");
        setBio(data.bio || "");
      } catch (err) {
        console.error("⚠️ Kunde inte hämta profil:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewImage(URL.createObjectURL(file));
  };

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

  if (!user)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        Du måste vara inloggad.
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 relative">
      {/* 👤 Profilhuvud */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
        <img
          src={previewImage || "/default-avatar.png"}
          alt="Profilbild"
          className="w-32 h-32 rounded-full object-cover border-4 border-yellow-400"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-yellow-400">{user.username}</h1>
          <p className="text-slate-300 mt-2 max-w-xl">
            {bio || "Ingen beskrivning än. Lägg till något om dig själv!"}
          </p>
        </div>

        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-6 right-6 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded shadow"
        >
          Redigera profil
        </button>
      </div>

      {/* 🔖 Flikar */}
      <div className="flex gap-4 border-b border-slate-700 mb-6">
        {[
          { key: "about", label: "Om mig" },
          { key: "favorites", label: "Mina favoriter" },
          { key: "reviews", label: "Mina reviews" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 px-3 font-semibold ${
              activeTab === tab.key
                ? "text-yellow-400 border-b-2 border-yellow-400"
                : "text-slate-400 hover:text-yellow-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 📄 Innehåll */}
      {activeTab === "about" && (
        <section>
          <h2 className="text-xl font-bold text-yellow-400 mb-3">Om mig</h2>
          <p className="text-slate-300">{bio || "Ingen bio ännu."}</p>
        </section>
      )}

      {activeTab === "favorites" && (
        <section>
          <h2 className="text-xl font-bold text-yellow-400 mb-4">Mina favoriter</h2>
          {favorites.length === 0 ? (
            <p className="text-gray-400">Inga favoriter ännu.</p>
          ) : (
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {favorites.map((m) => (
                <MovieCard
                  key={m.movieId}
                  movie={{
                    id: m.movieId,
                    title: m.title,
                    posterUrl: m.posterUrl,
                    rating: m.rating,
                    genre: m.genre,
                    overview: m.overview,
                  }}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "reviews" && (
        <section>
          <h2 className="text-xl font-bold text-yellow-400 mb-4">Mina reviews</h2>
          <p className="text-slate-400 italic">
            (Kommer snart – här kommer du kunna skriva recensioner och sätta betyg.)
          </p>
        </section>
      )}

      {/* ✏️ Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-2xl w-[90%] max-w-lg relative">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white text-xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-yellow-400 mb-4">
              Redigera profil
            </h2>

            <div className="mb-5">
              <p className="font-semibold mb-2">Profilbild</p>
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
              <p className="font-semibold mb-2">Om mig</p>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-slate-700 p-3 rounded text-white resize-none h-28 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Skriv lite om dig själv..."
              ></textarea>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white"
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
    </div>
  );
}
