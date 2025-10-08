import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MovieCard from "./components/MovieCard";
import { getPopularMovies } from "./api";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPopularMovies(1);
        setMovies(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <Hero />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-xl font-bold">Popular right now</h2>
          {/* sort/filter placeholders enligt wireframe – kopplas senare */}
          <div className="text-xs text-slate-400">Page 1</div>
        </div>

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
        ) : (
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {movies.map((m) => <MovieCard key={m.id} m={m} />)}
          </div>
        )}
      </main>
    </div>
  );
}
