/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from "react";

export const FavoritesContext = createContext(null);

const API_URL = "https://localhost:7299";

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🧠 Hämta favoriter från backend
  async function loadFavorites() {
    const token = localStorage.getItem("token");
    if (!token) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Misslyckades hämta favoriter");
      const data = await res.json();
      setFavorites(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Fel vid laddning av favoriter:", err);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFavorites();

    // 🔄 Uppdatera favoriter när token ändras (login/logout)
    const onAuthChange = () => loadFavorites();
    window.addEventListener("authChange", onAuthChange);
    return () => window.removeEventListener("authChange", onAuthChange);
  }, []);

  // 🧹 Rensa favoriter (vid logout)
  function clearFavorites() {
    setFavorites([]);
  }

  // ⭐ Toggle favorit — uppdaterar direkt i UI innan backend-anropet är klart
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
      rating: movie.vote_average || movie.rating || 0,
      overview: movie.overview || "",
    };

    // ⚡ Direkt-UI-uppdatering (optimistisk uppdatering)
    setFavorites((prev) => {
      const exists = prev.some((f) => Number(f.movieId) === movieId);
      if (exists) {
        return prev.filter((f) => Number(f.movieId) !== movieId);
      } else {
        return [...prev, payload];
      }
    });

    // 🔄 Kör backend-toggle i bakgrunden
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

      // 🧹 Säkerställ att local state matchar backend-resultatet
      setFavorites((prev) => {
        const cleaned = prev.filter((f) => Number(f.movieId) !== movieId);
        if (result.favorite) return [...cleaned, payload];
        return cleaned;
      });
    } catch (err) {
      console.error("⚠️ toggleFavorite-fel:", err);
      // 🩹 Återställ från backend om något gick fel
      loadFavorites();
    }
  }

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
