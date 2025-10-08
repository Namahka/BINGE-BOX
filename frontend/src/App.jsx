import { useEffect, useState } from "react";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("https://localhost:7299/api/tmdb/popular?page=1");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setMovies(data);
      } catch (e) {
        setError(e.message || "Fetch failed");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-black text-slate-100">
      <header className="p-4 border-b border-slate-800">
        <h1 className="text-2xl font-semibold">Binge Box • Popular</h1>
      </header>

      <main className="p-6">
        {loading && <p className="opacity-80">Loading…</p>}
        {error && <p className="text-red-400">Error: {error}</p>}

        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {movies.map(m => (
            <div key={m.id} className="bg-slate-900 rounded-xl overflow-hidden shadow">
              {m.posterUrl ? (
                <img src={m.posterUrl} alt={m.title} className="w-full aspect-[2/3] object-cover" />
              ) : (
                <div className="w-full aspect-[2/3] bg-slate-800" />
              )}
              <div className="p-3">
                <h3 className="text-sm font-medium truncate">{m.title}</h3>
                <p className="text-xs opacity-70">{m.releaseDate}</p>
                <p className="text-xs opacity-70">⭐ {m.rating ?? "–"}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
