import React, { useState, useEffect } from "react";
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
// 🟡 HEADER (Titel + Sökfält)
// ===============================
function Header({ onSearch }) {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/");
    window.scrollTo(0, 0);
  };

  return (
    <header className="bg-slate-900 text-white py-6 text-center border-b border-slate-700">
      <h1
        className="text-5xl font-bold text-yellow-400 mb-4 cursor-pointer hover:text-yellow-300 transition"
        onClick={handleLogoClick}
      >
        BINGE BOX
      </h1>

      <div className="max-w-xl mx-auto">
        <SearchBar onSearch={onSearch} />
      </div>
    </header>
  );
}

// ===============================
// 🧩 HUVUDSIDA (Popular + Sökresultat)
// ===============================
function HomePage({ movies, mode, query, category, onBack }) {
  const navigate = useNavigate();

  const formatCategoryName = (key) => {
    switch (key) {
      case "movie":
        return "Movies";
      case "tv":
        return "TV Shows";
      case "person":
        return "Celebrities";
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
      {/* 🔍 Sökresultatinfo */}
      {mode === "search" && (
        <>
          <p className="mt-4 text-center text-gray-300">
            Showing results for{" "}
            <span className="text-yellow-400">
              {formatCategoryName(category)}
            </span>{" "}
            matching <em className="text-yellow-300">"{query}"</em>
          </p>

          <button
            onClick={onBack}
            className="mt-3 mx-auto block text-yellow-400 hover:underline"
          >
            ← Back to popular
          </button>
        </>
      )}

      {/* 🎬 Filmlista */}
      <div className="mt-8 grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movies.length === 0 && (
          <p className="col-span-full text-center text-gray-400">
            No results found.
          </p>
        )}

        {movies.map((m) => (
          <div
            key={m.id}
            onClick={() =>
              navigate(
                m.mediaType === "person"
                  ? `/person/${m.id}`
                  : `/${m.mediaType || "movie"}/${m.id}`,
                {
                  state: { mediaType: m.mediaType || "movie" },
                }
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
// 🚀 Hela AppContent-komponenten
// ===============================
function AppContent() {
  const [movies, setMovies] = useState([]);
  const [mode, setMode] = useState("popular");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // ===============================
  // 🟢 Ladda populära filmer vid start
  // ===============================
  useEffect(() => {
    async function loadPopular() {
      try {
        setLoading(true);
        setError(null);
        const data = await getPopularMovies();
        setMovies(data);
        setMode("popular");
      } catch (err) {
        console.error("⚠️ Fel vid hämtning:", err);
        setError("Kunde inte hämta populära filmer.");
      } finally {
        setLoading(false);
      }
    }

    // Ladda endast vid start / navigering till "/"
    if (location.pathname === "/" && movies.length === 0) {
      loadPopular();
    }
  }, [location.pathname]);

  // ===============================
  // 🔍 Hantera sökning
  // ===============================
  const handleSearch = async (q, cat) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);

    try {
      setQuery(q);
      setCategory(cat);
      setMode("search");

      const data = await searchMovies(q, cat);
      setMovies(data);
      navigate("/");
    } catch (err) {
      console.error("⚠️ Fel vid sökning:", err);
      setError("Kunde inte hämta sökresultat.");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // ⏪ Tillbaka till populära
  // ===============================
  const handleBackToPopular = async () => {
    try {
      setLoading(true);
      setError(null);
      setQuery("");
      setCategory("all");
      setMode("popular");
      const data = await getPopularMovies();
      setMovies(data);
    } catch (err) {
      console.error("⚠️ Fel vid hämtning:", err);
      setError("Kunde inte ladda populära filmer.");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // 📺 Rendering
  // ===============================
  return (
    <>
      <Header onSearch={handleSearch} />

      {loading && (
        <p className="text-center text-slate-400 mt-10">Laddar...</p>
      )}
      {error && (
        <p className="text-center text-red-500 mt-10">{error}</p>
      )}

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              movies={movies}
              mode={mode}
              query={query}
              category={category}
              onBack={handleBackToPopular}
            />
          }
        />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/tv/:id" element={<MovieDetails />} />
        <Route path="/person/:id" element={<PersonDetails />} />
      </Routes>
    </>
  );
}

// ===============================
// 🧱 ROTKOMPONENT (Router)
// ===============================
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
