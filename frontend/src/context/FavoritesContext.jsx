/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from "react";

export const FavoritesContext = createContext(null);

const API_URL = "http://localhost:7299";

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===============================
  // 🧠 Hämta favoriter från backend
  // ===============================
  async function loadFavorites() {
    const token = localStorage.getItem("token");
    if (!token) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Misslyckades hämta favoriter");
      const data = await res.json();

      // 🧩 Normalisera till samma format som watchlist-items
      const normalized = (Array.isArray(data) ? data : []).map((f) => ({
        id: f.id,
        movieId: Number(f.movieId),
        title: f.title?.trim() || "Okänd titel",
        posterUrl:
          f.posterUrl ||
          (f.poster_path
            ? `https://image.tmdb.org/t/p/w500${f.poster_path}`
            : "/placeholder.jpg"),
        genre:
          f.genre ||
          (f.genres?.length
            ? f.genres.map((g) => g.name).join(", ")
            : "Okänd genre"),
        rating: f.rating || f.vote_average || 0, // ⭐ Betyg
        overview: f.overview || "Ingen beskrivning tillgänglig.", // 📝 Beskrivning
      }));

      // ✅ Uppdatera endast om datan verkligen ändrats
      setFavorites((prev) => {
        const prevStr = JSON.stringify(prev);
        const newStr = JSON.stringify(normalized);
        return prevStr === newStr ? prev : normalized;
      });
    } catch (err) {
      console.error("❌ Fel vid laddning av favoriter:", err);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }

  // ===============================
  // 🟢 Init-laddning om token finns
  // ===============================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) loadFavorites();
    else setLoading(false);
  }, []);

  // ===============================
  // 🧭 Lyssna på authChange
  // ===============================
  useEffect(() => {
    const onAuthChange = () => {
      const token = localStorage.getItem("token");
      if (token) loadFavorites();
      else setFavorites([]);
    };
    window.addEventListener("authChange", onAuthChange);
    return () => window.removeEventListener("authChange", onAuthChange);
  }, []);

  // ===============================
  // 🧹 Rensa vid logout
  // ===============================
  function clearFavorites() {
    setFavorites([]);
  }

  // ===============================
  // ⭐ Toggle favorit (optimistisk + backend)
  // ===============================
  async function toggleFavorite(movie, showLoginPopup) {
    const token = localStorage.getItem("token");
    if (!token) {
      if (showLoginPopup) showLoginPopup();
      return;
    }

    const movieId =
      Number(movie.movieId) && Number(movie.movieId) > 0
        ? Number(movie.movieId)
        : Number(movie.id);

    if (!movieId) {
      console.warn("⚠️ Ogiltigt TMDb MovieId:", movie);
      return;
    }

    const payload = {
      movieId,
      title: movie.title?.trim() || movie.name || "Okänd titel",
      posterUrl:
        movie.posterUrl ||
        (movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : ""),
      genre:
        movie.genre ||
        (movie.genres?.length
          ? movie.genres.map((g) => g.name).join(", ")
          : "Okänd genre"),
      rating: movie.vote_average || movie.rating || 0, // ⭐ Betyg
      overview: movie.overview || "Ingen beskrivning tillgänglig.", // 📝 Beskrivning
    };

    // ⚡ Optimistisk uppdatering (lokalt)
    setFavorites((prev) => {
      const exists = prev.some((f) => Number(f.movieId) === movieId);
      return exists
        ? prev.filter((f) => Number(f.movieId) !== movieId)
        : [...prev, payload];
    });

    try {
      const res = await fetch(`${API_URL}/api/favorites/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Misslyckades uppdatera favorit");
      const result = await res.json();

      // 🔁 Synka korrekt med backend
      setFavorites((prev) => {
        const cleaned = prev.filter((f) => Number(f.movieId) !== movieId);
        if (result.favorite) return [...cleaned, payload];
        return cleaned;
      });
    } catch (err) {
      console.error("⚠️ toggleFavorite-fel:", err);
      loadFavorites();
    }
  }

  // ===============================
  // 📦 Returnera context
  // ===============================
  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        reloadFavorites: loadFavorites,
        clearFavorites,
        loading,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}
