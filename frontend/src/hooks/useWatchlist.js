import { useState, useEffect } from "react";

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const loadWatchlist = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("https://localhost:7299/api/watchlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWatchlist(data);
      }
    } catch (err) {
      console.error("⚠️ loadWatchlist-fel:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Lägg till film
  const addToWatchlist = async (movie, status = "to-watch") => {
    try {
      const payload = {
        movieId:
          movie.tmdbId ??
          movie.tmdbID ??
          movie.id ??
          movie.movieId ??
          movie.MovieId,
        title: movie.title ?? movie.name,
        posterUrl:
          movie.posterUrl ??
          movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : null,
        type: "movie",
        status,
      };

      const res = await fetch("https://localhost:7299/api/watchlist/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await loadWatchlist();
      } else {
        console.warn("❌ AddToWatchlist misslyckades");
      }
    } catch (err) {
      console.error("⚠️ addToWatchlist-fel:", err);
    }
  };

  // 🟨 Uppdatera status
  const updateStatus = async (movieId, status) => {
    try {
      const res = await fetch("https://localhost:7299/api/watchlist/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ movieId, status }),
      });

      if (res.ok) await loadWatchlist();
    } catch (err) {
      console.error("⚠️ updateStatus-fel:", err);
    }
  };

  // 🟥 Ta bort
  const removeFromWatchlist = async (movieId) => {
    try {
      const res = await fetch(
        `https://localhost:7299/api/watchlist/${movieId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setWatchlist((prev) =>
          prev.filter((m) => Number(m.movieId) !== Number(movieId))
        );
      }
    } catch (err) {
      console.error("⚠️ removeFromWatchlist-fel:", err);
    }
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  return {
    watchlist,
    loading,
    addToWatchlist,
    updateStatus,
    removeFromWatchlist,
    loadWatchlist,
  };
}
