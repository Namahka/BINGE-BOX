import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { getPopularMovies, searchMovies } from "./api";
import SearchBar from "./components/SearchBar";
import MovieCard from "./components/MovieCard";
import "./index.css";
import PersonDetails from "./pages/PersonDetails";
import MovieDetails from "./pages/MovieDetails";

// ===============================
// 🟡 Header (titel + sökfält) – visas på alla sidor
// ===============================
function Header({ onSearch }) {
  const navigate = useNavigate();
  const handleLogoClick = () => navigate("/");

  return (
    <div className="bg-slate-900 text-white py-6 text-center border-b border-slate-700">
      <h1
        className="text-5xl font-bold text-yellow-400 mb-4 cursor-pointer hover:text-yellow-300 transition"
        onClick={handleLogoClick}
      >
        BINGE BOX
      </h1>
      <div className="max-w-xl mx-auto">
        <SearchBar onSearch={onSearch} />
      </div>
    </div>
  );
}

// ===============================
// 🧩 Huvudsida (Popular + Sökning)
// ===============================
function HomePage({ onSearch, movies, mode, query, category, onBack }) {
  const navigate = useNavigate();

  const formatCategoryName = (key) => {
    switch (key) {
      case "movie":
        return "Titles";
      case "tv":
        return "TV Episodes";
      case "person":
        return "Celebs";
      case "company":
        return "Companies";
      case "keyword":
        return "Keywords";
      default:
        return "All";
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white px-4 py-8">
      {mode === "search" && (
        <>
          <p className="mt-4 text-center text-gray-300">
            Showing results for{" "}
            <span className="text-yellow-400">{formatCategoryName(category)}</span>{" "}
            matching <em className="text-yellow-300">"{query}"</em>
          </p>
          <button
            onClick={onBack}
            className="mt-2 mx-auto block text-yellow-400 hover:underline"
          >
            ← Back to popular
          </button>
        </>
      )}

      <div className="mt-6 grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movies.length === 0 && (
          <p className="col-span-full text-center text-gray-400">No results.</p>
        )}

        {movies.map((m) => (
          <div
            key={m.id}
            onClick={() =>
              navigate(
                m.overview?.startsWith("Known for:")
                  ? `/person/${m.id}`
                  : `/movie/${m.id}`
              )
            }
            className="cursor-pointer hover:scale-105 transition-transform duration-200"
          >
            <MovieCard movie={m} />
          </div>
        ))}
      </div>
    </main>
  );
}

// ===============================
// 🚀 Hela Appen
// ===============================
export default function App() {
  const [movies, setMovies] = useState([]);
  const [mode, setMode] = useState("popular");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function loadPopular() {
      const data = await getPopularMovies();
      setMovies(data);
    }
    loadPopular();
  }, []);

  const handleSearch = async (q, cat) => {
    if (!q.trim()) return;
    setQuery(q);
    setCategory(cat);
    setMode("search");

    const data = await searchMovies(q, cat);
    setMovies(data);

    // navigera till startsidan om man inte redan är där
    if (location.pathname !== "/") navigate("/");
  };

  const handleBackToPopular = async () => {
    setMode("popular");
    const data = await getPopularMovies();
    setMovies(data);
    setQuery("");
  };

  return (
    <>
      <Header onSearch={handleSearch} />
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              onSearch={handleSearch}
              movies={movies}
              mode={mode}
              query={query}
              category={category}
              onBack={handleBackToPopular}
            />
          }
        />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/person/:id" element={<PersonDetails />} />
      </Routes>
    </>
  );
}

// Wrappa hela appen i Router
import { createRoot } from "react-dom/client";
import React from "react";

createRoot(document.getElementById("root")).render(
  <Router>
    <App />
  </Router>
);
