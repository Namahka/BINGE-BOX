import React, { useState, useEffect, useRef } from "react";
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
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import UserMenu from "./components/UserMenu";
import Settings from "./pages/Settings";
import { Star } from "lucide-react";
import Favorites from "./pages/Favorites";





// ===============================
// 🟡 HEADER (Titel + User dropdown)
// ===============================
function Header({ onSearch, onClearSearch, searchRef }) {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    onClearSearch();
    navigate("/");
    window.scrollTo(0, 0);
  };

  return (
    <header className="bg-indigo-950 text-white py-6 border-b border-black relative">
      <div className="flex items-center justify-center relative">
        <h1
          className="text-5xl font-bold text-yellow-400 cursor-pointer hover:text-yellow-300 transition"
          onClick={handleLogoClick}
        >
          BINGE BOX
        </h1>

        {/* ⭐ & 👤 */}
        <div className="absolute right-6 top-2 flex gap-4 items-center">
          <Star
            className="w-6 h-6 text-yellow-400 cursor-pointer hover:scale-110 transition-transform"
            onClick={() => navigate("/favorites")}
          />
          <UserMenu />
        </div>
      </div>

      <div className="max-w-xl mx-auto mt-4">
        <SearchBar ref={searchRef} onSearch={onSearch} onClearSearch={onClearSearch} />
      </div>
    </header>
  );
}


// ===============================
// 🧩 HUVUDSIDA
// ===============================
function HomePage({ movies, mode, query, category, onBack, loading }) {
  const navigate = useNavigate();

  const formatCategoryName = (key) => {
    switch (key) {
      case "movie":
        return "Movies";
      case "tv":
        return "TV Shows";
      case "person":
        return "Celebrities";
      default:
        return "All";
    }
  };

  return (
    <main className="min-h-screen bg-violet-950 text-white px-4 py-8 relative">
      {mode === "search" && (
        <>
          <p className="mt-4 text-center text-gray-300">
            Showing results for{" "}
            <span className="text-white">
              {formatCategoryName(category)}
            </span>{" "}
            matching <em className="text-white">"{query}"</em>
          </p>

          <button
            onClick={() => onBack(false)}
            className="mt-3 mx-auto block text-white hover:underline"
          >
            ← Back to popular
          </button>
        </>
      )}

      {/* 🎬 Filmlista */}
      <div className="mt-8 grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 relative">
        {movies.length === 0 && !loading && (
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
                  state: {
                    mediaType: m.mediaType || "movie",
                    fromSearch: mode === "search", // 👈 markerar att vi kom från sök
                    query,
                    category,
                  },
                }
              )
            }
            className="cursor-pointer hover:scale-105 transition-transform duration-200"
          >
            <MovieCard movie={m} />
          </div>
        ))}

        {/* 🌀 Laddnings-overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black flex items-center justify-center rounded-lg">
            <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </main>
  );
}


// ===============================
// 🚀 APP-INNEHÅLL
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
  const searchRef = useRef(null);

  // 🧭 Rensa sökning vid browser-back
  useEffect(() => {
    const handlePopState = () => {
      if (searchRef.current) searchRef.current.clearInput();
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // 🟢 Ladda populära filmer vid start
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

    if (location.pathname === "/" && movies.length === 0) {
      loadPopular();
    }
  }, [location.pathname]);

  // 🔍 Hantera sökning
  const handleSearch = async (q, cat) => {
    if (!q || !q.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const data = await searchMovies(q, cat);
      const results = Array.isArray(data) ? data : [];

      const sorted = [
        ...results.filter((item) => item.mediaType === "person"),
        ...results.filter((item) => item.mediaType !== "person"),
      ];

      setMovies(sorted);
      setQuery(q);
      setCategory(cat);
      setMode("search");

      // 🧹 rensa fältet direkt efter sök
      if (searchRef.current) searchRef.current.clearInput();

      navigate("/");
    } catch (err) {
      console.error("⚠️ Fel vid sökning:", err);
      setError("Kunde inte hämta sökresultat.");
    } finally {
      setLoading(false);
    }
  };

  // 🧹 Rensa sökning (logga, back-to-popular)
  const clearSearch = async () => {
    setQuery("");
    setCategory("all");
    setMode("popular");

    if (searchRef.current) searchRef.current.clearInput();

    try {
      setLoading(true);
      const data = await getPopularMovies();
      setMovies(data);
      navigate("/");
    } catch (err) {
      console.error("⚠️ Fel vid hämtning:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header onSearch={handleSearch} onClearSearch={clearSearch} searchRef={searchRef} />

      {error && <p className="text-center text-red-500 mt-10">{error}</p>}

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              movies={movies}
              mode={mode}
              query={query}
              category={category}
              onBack={clearSearch}
              loading={loading}
            />
          }
        />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/tv/:id" element={<MovieDetails />} />
        <Route path="/person/:id" element={<PersonDetails />} />
        <Route path="/login" element={<Login />} />
<Route path="/profile" element={<Profile />} />
<Route path="/register" element={<Register />} />
<Route path="/settings" element={<Settings />} />
<Route path="/favorites" element={<Favorites/>}/>


      </Routes>
    </>
  );
}

// ===============================
// 🧱 ROT-APP
// ===============================
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
