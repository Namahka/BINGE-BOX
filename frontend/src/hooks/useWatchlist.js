import { useState, useEffect, useCallback } from "react";

const API_URL = "https://localhost:7299/api/watchlist";

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🧠 Ladda watchlist från servern
  const loadWatchlist = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setWatchlist([]);
      return;
    }

    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Kunde inte hämta watchlist");
      const data = await res.json();

      // 🚫 Filtrera bort allt som är TV
      const filtered = Array.isArray(data)
        ? data.filter(
            (item) =>
              item.type?.toLowerCase() !== "tv" &&
              item.Type?.toLowerCase() !== "tv" &&
              item.media_type?.toLowerCase() !== "tv"
          )
        : [];

      // ✅ Endast uppdatera om datan faktiskt skiljer sig
      setWatchlist((prev) => {
        const prevString = JSON.stringify(prev);
        const newString = JSON.stringify(filtered);
        return prevString === newString ? prev : filtered;
      });
    } catch (err) {
      console.error("❌ Fel vid hämtning av watchlist:", err);
    }
  }, []);

  // 🔄 Flytta mellan watched/to-watch
  const moveItem = useCallback(async (movieId, newStatus) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ movieId, status: newStatus }),
      });

      if (!res.ok) throw new Error("Misslyckades uppdatera status");

      setWatchlist((prev) =>
        prev.map((w) =>
          Number(w.movieId) === Number(movieId)
            ? { ...w, status: newStatus }
            : w
        )
      );
    } catch (err) {
      console.error("❌ moveItem error:", err);
    }
  }, []);

  // 🗑️ Ta bort från watchlist
  const removeFromWatchlist = useCallback(async (movieId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/remove/${movieId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Kunde inte ta bort film");

      setWatchlist((prev) =>
        prev.filter((w) => Number(w.movieId) !== Number(movieId))
      );
    } catch (err) {
      console.error("❌ removeFromWatchlist error:", err);
    }
  }, []);

  // ➕ Lägg till i watchlist (endast filmer)
  const addToWatchlist = useCallback(async (movie, status = "to-watch") => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const item = {
      movieId: movie.id || movie.movieId,
      title: movie.title || movie.name,
      posterUrl:
        movie.posterUrl ||
        (movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : null),
      type: "movie", // 🔥 Tvinga alltid film
      status,
    };

    try {
      const res = await fetch(`${API_URL}/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      });

      if (!res.ok) throw new Error("Kunde inte lägga till i watchlist");

      const newItem = await res.json();

      setWatchlist((prev) => {
        const exists = prev.some(
          (w) => Number(w.movieId) === Number(newItem.movieId)
        );
        return exists ? prev : [newItem, ...prev];
      });
    } catch (err) {
      console.error("❌ addToWatchlist error:", err);
    }
  }, []);

  // 🟡 Uppdatera status
  const updateStatus = useCallback(async (movieId, status) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ movieId, status }),
      });

      if (!res.ok) throw new Error("Misslyckades uppdatera status");

      const updated = await res.json();

      setWatchlist((prev) =>
        prev.map((item) =>
          Number(item.movieId) === Number(movieId)
            ? { ...item, status: updated.status }
            : item
        )
      );
    } catch (err) {
      console.error("❌ updateStatus error:", err);
    }
  }, []);

  // 🧩 Kör endast en gång vid mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      await loadWatchlist();
      if (isMounted) setLoading(false);
    })();

    return () => {
      isMounted = false;
    };
  }, []); // 🚀 Ingen dependency-loop

  return {
    watchlist,
    loading,
    addToWatchlist,
    updateStatus,
    moveItem,
    removeFromWatchlist,
    reload: loadWatchlist,
  };
}
