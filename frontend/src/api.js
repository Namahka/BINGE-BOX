const API_BASE_URL = "https://localhost:7299/api/tmdb";
export async function getPopularMovies(page = 1) {
  const res = await fetch(`${API_BASE_URL}/popular?page=${page}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}
