// src/App.jsx
import { useState, useEffect } from "react";
import { getPopularMovies, searchMovies } from "./api";
import SearchBar from "./components/SearchBar";
import MovieCard from "./components/MovieCard";
import "./index.css";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [mode, setMode] = useState("popular");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

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
    setQuery("");
  };

  const formatCategoryName = (key) => {
    switch (key) {
      case "movie":
        return "Titles";
      case "tv":
        return "TV Episodes";
      case "person":
      case "celebs":
        return "Celebs";
      case "company":
      case "companies":
        return "Companies";
      case "keyword":
      case "keywords":
        return "Keywords";
      default:
        return "All";
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white px-4 py-8">
      <h1 className="text-5xl font-bold text-yellow-400 mb-6 text-center">
      BINGE BOX
      </h1>

      <SearchBar onSearch={handleSearch} />

      {mode === "search" && (
        <>
          <p className="mt-6 text-center text-gray-300">
            Showing results for{" "}
            <span className="text-yellow-400">{formatCategoryName(category)}</span>{" "}
            matching <em className="text-yellow-300">"{query}"</em>
          </p>
          <button
            onClick={handleBackToPopular}
            className="mt-2 mx-auto block text-yellow-400 hover:underline"
          >
            ← Back to popular
          </button>
        </>
      )}

      <div className="mt-6 grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movies.length === 0 && (
          <p className="col-span-full text-center text-gray-400">
            No results.
          </p>
        )}
        {movies.map((m) => (
          <MovieCard key={m.id} movie={m} />
        ))}
      </div>
    </main>
  );
}
