// src/api.js

const API_URL = "https://localhost:7299"; // ändra till din backend-port om annan

// Hämtar populära filmer
export async function getPopularMovies(page = 1) {
  try {
    const res = await fetch(`${API_URL}/api/tmdb/popular?page=${page}`);
    if (!res.ok) throw new Error("Kunde inte hämta populära filmer");
    return await res.json();
  } catch (err) {
    console.error("Fel vid hämtning av populära filmer:", err);
    return [];
  }
}

// Söker filmer/personer/serier beroende på kategori
export async function searchMovies(query, category = "all", page = 1) {
  try {
    const res = await fetch(
      `${API_URL}/api/tmdb/search/${category}?query=${encodeURIComponent(
        query
      )}&page=${page}`
    );
    if (!res.ok) throw new Error("Kunde inte hämta sökresultat");
    return await res.json();
  } catch (err) {
    console.error("Fel vid sökning:", err);
    return [];
  }
}
