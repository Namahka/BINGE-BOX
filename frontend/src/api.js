const API_BASE = "https://localhost:7299/api/tmdb"; // Byt port om din backend kör på annan

// --- Hämta populära filmer ---
export async function getPopularMovies(page = 1) {
  try {
    const res = await fetch(`${API_BASE}/popular?page=${page}`);
    if (!res.ok) throw new Error("Kunde inte hämta populära filmer");
    return await res.json();
  } catch (err) {
    console.error("Fel vid API-anrop (popular):", err);
    return [];
  }
}

// --- Sök filmer ---

export async function searchMovies(query, category = "all", page = 1) {
  try {
    const res = await fetch(
      `https://localhost:7299/api/tmdb/search/${category}?query=${encodeURIComponent(query)}&page=${page}`
    );
    if (!res.ok) throw new Error("Kunde inte hämta sökresultat");
    return await res.json();
  } catch (err) {
    console.error("Fel vid API-anrop (search):", err);
    return [];
  }
}
