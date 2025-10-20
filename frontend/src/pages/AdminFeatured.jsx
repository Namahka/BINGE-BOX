import React, { useState, useEffect } from "react";
import { searchMovies, getMovieOfTheWeek } from "../api";

export default function AdminFeatured() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [currentMovie, setCurrentMovie] = useState(null);
  const [message, setMessage] = useState("");

  // 🟡 Hämta aktuell Movie of the Week vid sidstart
  useEffect(() => {
    async function fetchMovieOfTheWeek() {
      try {
        const data = await getMovieOfTheWeek();
        if (!data) return;

        // Normalisera URL-fält (för säkerhets skull)
        const fixed = {
          ...data,
          posterUrl:
            data.posterUrl && data.posterUrl.startsWith("http")
              ? data.posterUrl
              : data.posterUrl
              ? `https://image.tmdb.org/t/p/w500${data.posterUrl}`
              : null,
          backdropUrl:
            data.backdropUrl && data.backdropUrl.startsWith("http")
              ? data.backdropUrl
              : data.backdropUrl
              ? `https://image.tmdb.org/t/p/original${data.backdropUrl}`
              : null,
        };

        setCurrentMovie(fixed);
      } catch (err) {
        console.error("⚠️ Kunde inte hämta Movie of the Week:", err);
      }
    }

    fetchMovieOfTheWeek();
  }, []);

  // 🔍 Sök film via TMDb
  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      const data = await searchMovies(query, "movie");
      setResults(data);
    } catch (err) {
      console.error("❌ Search error:", err);
    }
  }

  // 🎬 Välj film i listan
  function handleSelect(movie) {
    setSelected(movie);
    setMessage("");
  }

  // 💾 Spara som Movie of the Week
  async function saveMovie() {
    if (!selected) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://localhost:7299/api/movieoftheweek/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          movieId: selected.id,
          title: selected.title,
          posterUrl:
            selected.posterUrl ||
            (selected.poster_path
              ? `https://image.tmdb.org/t/p/w500${selected.poster_path}`
              : null),
          backdropUrl:
            selected.backdropUrl ||
            (selected.backdrop_path
              ? `https://image.tmdb.org/t/p/original${selected.backdrop_path}`
              : null),
          genre:
            selected.genre ||
            selected.genres?.map((g) => g.name).join(", ") ||
            "",
          rating: selected.vote_average || selected.rating || 0,
          overview: selected.overview || "",
        }),
      });

      if (res.ok) {
        setMessage("✅ Movie of the Week has been updated!");
        setSelected(null);
        setResults([]);
        setQuery("");
        // 🔁 Ladda om för att visa nya filmen
        const updated = await getMovieOfTheWeek();
        setCurrentMovie(updated);
      } else {
        const errText = await res.text();
        setMessage("❌ Failed: " + errText);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ An unexpected error occurred.");
    }
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-yellow-400 mb-6">
          🎬 Set Movie of the Week
        </h1>

        {/* 🎞️ Aktuell Movie of the Week */}
        {currentMovie && (
          <div className="mb-10 border border-yellow-500 rounded-xl overflow-hidden shadow-lg">
            <img
              src={
                currentMovie.posterUrl
                  ? currentMovie.posterUrl
                  : currentMovie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${currentMovie.poster_path}`
                  : "/placeholder.jpg"
              }
              alt={currentMovie.title}
              className="w-full h-72 object-cover"
            />
            <div className="p-4 bg-slate-900">
              <h2 className="text-2xl font-semibold text-yellow-400">
                Current Movie of the Week:
              </h2>
              <h3 className="text-xl font-bold mb-2">
                {currentMovie.title || "Unknown Title"}
              </h3>
              <p className="text-gray-300 text-sm mb-2">
                {currentMovie.genre || "No genre info"}
              </p>
              <p className="text-gray-400 text-sm line-clamp-3">
                {currentMovie.overview || "No description available."}
              </p>
            </div>
          </div>
        )}

        {/* 🔍 Sökfält */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a movie..."
            className="flex-grow p-3 rounded-lg bg-slate-900 border border-yellow-500 text-white placeholder-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg transition"
          >
            Search
          </button>
        </form>

        {/* 🎥 Resultat */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {results.map((m) => (
            <div
              key={m.id}
              onClick={() => handleSelect(m)}
              className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-transform hover:scale-105 ${
                selected?.id === m.id ? "border-yellow-400" : "border-slate-800"
              }`}
            >
              <img
                src={
                  m.posterUrl
                    ? m.posterUrl
                    : m.poster_path
                    ? `https://image.tmdb.org/t/p/w300${m.poster_path}`
                    : "/placeholder.jpg"
                }
                alt={m.title}
                className="w-full h-72 object-cover"
              />
              <div className="p-3 bg-slate-900">
                <h3 className="text-lg font-semibold">{m.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-2">
                  {m.overview}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 💾 Spara vald film */}
        {selected && (
          <div className="mt-8 text-center">
            <p className="text-lg mb-2">
              Selected:{" "}
              <span className="font-semibold text-yellow-400">
                {selected.title}
              </span>
            </p>
            <button
              onClick={saveMovie}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition"
            >
              Save as Movie of the Week
            </button>
          </div>
        )}

        {message && (
          <p className="mt-6 text-center text-yellow-400 font-semibold">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
