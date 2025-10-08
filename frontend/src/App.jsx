import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MovieCard from "./components/MovieCard";
import SearchBar from "./components/SearchBar";
import { getPopularMovies, searchMovies } from "./api";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("popular"); // "popular" | "search"
  const [lastQuery, setLastQuery] = useState("");

  useEffect(() => {
    // Ladda popular vid start
    (async () => {
      setLoading(true);
      setMovies(await getPopularMovies(1));
      setMode("popular");
      setLoading(false);
    })();
  }, []);

  async function handleSearch(query) {
    setLoading(true);
    setLastQuery(query);
    const data = await searchMovies(query, 1);
    setMovies(data);
    setMode("search");
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <Hero />

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        {/* Sökfält */}
        <div className="flex items-center justify-between">
          <SearchBar onSearch={handleSearch} />
          {/* Liten knapp för att gå tillbaka till Popular */}
          {mode === "search" && (
            <button
              onClick={async () => {
                setLoading(true);
                setMovies(await getPopularMovies(1));
                setMode("popular");
                setLoading(false);
              }}
              className="text-sm px-3 py-2 rounded-md border border-slate-800 hover:bg-slate-900"
            >
              ← Back to Popular
            </button>
          )}
        </div>

        {/* Titelrad över grid */}
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold">
            {mode === "popular" ? "Popular right now" : `Results for “${lastQuery}”`}
          </h2>
          <div className="text-xs text-slate-400">Page 1</div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-slate-900 border border-slate-800 animate-pulse">
                <div className="aspect-[2/3] bg-slate-800" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : movies.length === 0 ? (
          <p className="opacity-80">No movies found.</p>
        ) : (
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {movies.map((m) => (
              <MovieCard key={m.id} m={m} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
