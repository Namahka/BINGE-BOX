// src/api.js

const API_URL = "https://localhost:7299"; // ändra till din backend-port om du kör annan

// ===============================
// 🎬 Hämtar populära filmer
// ===============================
export async function getPopularMovies(page = 1) {
  try {
    const res = await fetch(`${API_URL}/api/tmdb/popular?page=${page}`, {
      method: "GET",
      headers: { "Accept": "application/json" },
    });

    if (!res.ok) {
      console.error(`❌ Fel ${res.status}: Kunde inte hämta populära filmer`);
      throw new Error("Kunde inte hämta populära filmer");
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("⚠️ Fel vid hämtning av populära filmer:", err);
    return [];
  }
}

// ===============================
// 🔍 Söker filmer/personer/serier
// ===============================
export async function searchMovies(query, category = "all", page = 1) {
  if (!query || query.trim() === "") return [];

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const endpoint = `${API_URL}/api/tmdb/search/${category}?query=${encodedQuery}&page=${page}`;

    const res = await fetch(endpoint, {
      method: "GET",
      headers: { "Accept": "application/json" },
    });

    if (!res.ok) {
      console.error(`❌ Fel ${res.status}: Kunde inte hämta sökresultat`);
      throw new Error("Kunde inte hämta sökresultat");
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("⚠️ Fel vid sökning:", err);
    return [];
  }
}

// ===============================
// 🎥 Hämtar detaljer om film (för MovieDetails)
// ===============================
export async function getMovieDetails(id) {
  try {
    const res = await fetch(`${API_URL}/api/tmdb/movie/${id}`, {
      method: "GET",
      headers: { "Accept": "application/json" },
    });

    if (!res.ok) {
      console.error(`❌ Fel ${res.status}: Kunde inte hämta filmdata`);
      throw new Error("Kunde inte hämta filmdata");
    }

    return await res.json();
  } catch (err) {
    console.error("⚠️ Fel vid hämtning av filmdata:", err);
    return null;
  }
}
