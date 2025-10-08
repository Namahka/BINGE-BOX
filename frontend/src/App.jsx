// src/App.jsx
import { useState, useEffect } from "react";
import { getPopularMovies, searchMovies } from "./api";
import SearchBar from "./components/SearchBar";
import "./index.css";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [mode, setMode] = useState("popular");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all"); // <-- ESLint varnade här

  useEffect(() => {
    async function loadPopular() {
      const data = await getPopularMovies();
      setMovies(data);
    }
    loadPopular();
  }, []);

  const handleSearch = async (q, cat) => {
    setQuery(q);
    setCategory(cat);
    setMode("search");
    const data = await searchMovies(q, cat);
    setMovies(data);
  };

  const handleBackToPopular = async () => {
    setMode("popular");
    const data = await getPopularMovies();
    setMovies(data);
  };

  // ✅ liten hjälpfunktion för att visa kategorin snyggt
  const categoryLabels = {
    all: "All",
    movie: "Titles",
    tv: "TV Episodes",
    person: "Celebs",
    company: "Companies",
    keyword: "Keywords",
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white px-4 py-8">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
        🎬 Binge Box
      </h1>

      <SearchBar onSearch={handleSearch} />

      {/* ✅ Ny rad som läser category (tar bort ESLint-varningen) */}
      {mode === "search" && (
        <p className="text-center text-gray-400 mt-3">
          Showing results for <span className="text-yellow-400">
            {categoryLabels[category]}
          </span>
          {query && (
            <>
              {" "}
              matching <span className="italic text-yellow-300">"{query}"</span>
            </>
          )}
        </p>
      )}

      {mode === "search" && (
        <button
          onClick={handleBackToPopular}
          className="mt-4 mx-auto block text-yellow-400 hover:underline"
        >
          ← Back to popular
        </button>
      )}

      <div className="mt-6 grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movies.length === 0 && (
          <p className="col-span-full text-center">No results.</p>
        )}
        {movies.map((m) => (
          <div
            key={m.id}
            className="bg-slate-800 rounded-lg overflow-hidden shadow hover:scale-105 transition-transform duration-200"
          >
            {m.posterUrl ? (
              <img
                src={m.posterUrl}
                alt={m.title}
                className="w-full h-64 object-cover"
              />
            ) : (
              <div className="w-full h-64 flex items-center justify-center bg-slate-700 text-gray-400">
                No image
              </div>
            )}
            <div className="p-3">
              <h3 className="font-semibold text-lg truncate">{m.title}</h3>
              <p className="text-sm text-gray-400 line-clamp-2">
                {m.overview || "No description available."}
              </p>
              <p className="text-yellow-400 mt-1">
                ⭐ {m.rating?.toFixed(1) || "N/A"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
