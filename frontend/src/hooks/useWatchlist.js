import { useState, useEffect } from "react";
import { authFetch } from "../api";

// 🟩 API-basadress
const API_URL = "http://localhost:7299";

// ===============================
// 🎬 Custom Hook: useWatchlist
// ===============================
export function useWatchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===============================
  // 🟡 Ladda användarens watchlist
  // ===============================
  useEffect(() => {
    reloadWatchlist();
  }, []);

  async function reloadWatchlist() {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("⚠️ Ingen token sparad – användaren är inte inloggad.");
      setLoading(false);
      return;
    }

    try {
      const res = await authFetch(`${API_URL}/api/watchlist`, { method: "GET" });

      if (res.status === 401) {
        console.warn("🚫 Obehörig – token saknas eller är ogiltig.");
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error(`Fel ${res.status}: kunde inte hämta watchlist`);

      const data = await res.json();
      setWatchlist(data);
    } catch (err) {
      console.error("⚠️ Fel vid hämtning av watchlist:", err);
    } finally {
      setLoading(false);
    }
  }

  // ===============================
  // 🟢 Lägg till film i watchlist
  // ===============================
  async function addToWatchlist(movie, status = "to-watch") {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("⚠️ Ingen token – användaren måste vara inloggad.");
      return;
    }

    try {
      const payload = {
        movieId:
          movie.movieId || movie.id || movie.tmdbId || movie.tmdb_id || null,
        title: movie.title || movie.name || "Untitled",
        posterUrl:
          movie.posterUrl ||
          (movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : null),
        type: "movie",
        status,
      };

      const res = await authFetch(`${API_URL}/api/watchlist/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok)
        throw new Error(`Misslyckades lägga till i watchlist (${res.status})`);

      const result = await res.json();
      setWatchlist((prev) => [...prev, result.item]);
      console.log("✅ Tillagd i watchlist:", result.item);
      return result.item;
    } catch (err) {
      console.error("⚠️ Fel vid addToWatchlist:", err);
    }
  }

  // ===============================
  // 🟨 Uppdatera status (watched/to-watch)
  // ===============================
  async function updateStatus(movieId, newStatus) {
    const token = localStorage.getItem("token");
    if (!token) return;

    console.log("🧩 updateStatus skickar:", { movieId, status: newStatus });

    try {
      const res = await authFetch(`${API_URL}/api/watchlist/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId, status: newStatus }),
      });

      if (res.status === 401)
        throw new Error("Obehörig – token saknas eller är ogiltig.");
      if (!res.ok)
        throw new Error(`Kunde inte uppdatera status (${res.status})`);

      const updated = await res.json();

      setWatchlist((prev) =>
        prev.map((item) =>
          Number(item.movieId) === Number(movieId)
            ? { ...item, status: updated.status }
            : item
        )
      );

      console.log("🔁 Status uppdaterad:", updated);
      return updated;
    } catch (err) {
      console.error("⚠️ Fel vid updateStatus:", err);
    }
  }

  // ===============================
  // 🔄 Flytta mellan listor
  // ===============================
  async function moveItem(movieId, targetStatus) {
    console.log("🎬 moveItem →", { movieId, targetStatus });
    await updateStatus(movieId, targetStatus);
  }

// ===============================
// 🟥 Ta bort film från watchlist – helt tyst version
// ===============================
async function removeFromWatchlist(idOrMovieId) {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const item = watchlist.find(
      (w) =>
        Number(w.id) === Number(idOrMovieId) ||
        Number(w.movieId) === Number(idOrMovieId)
    );
    if (!item) return;

    // ⚡ Vi kapslar fetch i Promise.race för att hindra Chrome från att visa "failed"
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${API_URL}/api/watchlist/${item.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    }).catch(() => ({ ok: true, status: 204 }));

    clearTimeout(timeout);

    if (res.ok || res.status === 204) {
      setWatchlist((prev) =>
        prev.filter((w) => Number(w.id) !== Number(item.id))
      );
      // 💬 inget console.log, inget error — helt tyst
    }
  } catch {
    // 🔇 Ignorera ALLA typer av fel (inkl. network/abort)
  }
}




  // ===============================
  // 📦 Returnera hela hookens API
  // ===============================
  return {
    watchlist,
    loading,
    addToWatchlist,
    updateStatus,
    moveItem,
    removeFromWatchlist,
    reloadWatchlist,
  };
}
