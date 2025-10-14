import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import MovieCard from "../components/MovieCard";

export default function Profile() {
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const [activeTab, setActiveTab] = useState("about");

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <p>Du måste vara inloggad för att se din profil.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* 👤 PROFILHUVUD */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
        <img
          src={user.profileImage || "/default-avatar.png"}
          alt="Profilbild"
          className="w-32 h-32 rounded-full object-cover border-4 border-yellow-400"
        />
        <div>
          <h1 className="text-3xl font-bold text-yellow-400">
            {user.username}
          </h1>
          <p className="text-slate-300 mt-2 max-w-xl">
            {user.bio || "Ingen beskrivning än. Lägg till något om dig själv!"}
          </p>
        </div>
      </div>

      {/* 🔖 FLIKAR */}
      <div className="flex gap-4 border-b border-slate-700 mb-6">
        <button
          onClick={() => setActiveTab("about")}
          className={`pb-2 px-3 font-semibold ${
            activeTab === "about"
              ? "text-yellow-400 border-b-2 border-yellow-400"
              : "text-slate-400 hover:text-yellow-300"
          }`}
        >
          Om mig
        </button>
        <button
          onClick={() => setActiveTab("favorites")}
          className={`pb-2 px-3 font-semibold ${
            activeTab === "favorites"
              ? "text-yellow-400 border-b-2 border-yellow-400"
              : "text-slate-400 hover:text-yellow-300"
          }`}
        >
          Mina favoriter
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`pb-2 px-3 font-semibold ${
            activeTab === "reviews"
              ? "text-yellow-400 border-b-2 border-yellow-400"
              : "text-slate-400 hover:text-yellow-300"
          }`}
        >
          Mina reviews
        </button>
      </div>

      {/* 📄 INNEHÅLL */}
      {activeTab === "about" && (
        <section>
          <h2 className="text-xl font-bold text-yellow-400 mb-3">
            Om mig
          </h2>
          <p className="text-slate-300">
            {user.bio ||
              "Här kan du skriva en kort text om dig själv, dina favoritgenrer eller vad du gillar att titta på!"}
          </p>
        </section>
      )}

      {activeTab === "favorites" && (
        <section>
          <h2 className="text-xl font-bold text-yellow-400 mb-4">
            Mina favoriter
          </h2>

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
          <h2 className="text-xl font-bold text-yellow-400 mb-4">
            Mina reviews
          </h2>

          <div className="text-slate-400 italic">
            (Kommer snart – här kommer du kunna söka efter filmer, lägga till
            egna recensioner med stjärnor, och se allas kommentarer & likes!)
          </div>
        </section>
      )}
    </div>
  );
}
