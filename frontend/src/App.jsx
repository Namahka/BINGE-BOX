import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
  Link,
} from "react-router-dom";
import {
  getPopularMovies,
  searchMovies,
  searchUsers,
  getMovieOfTheWeek,
} from "./api";

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
import { Key } from "lucide-react";
import UserProfile from "./pages/UserProfile";
import { useAuth } from "./hooks/useAuth";
import AdminPanel from "./pages/AdminPanel";
import AdminFeatured from "./pages/AdminFeatured";
import ReviewPage from "./pages/ReviewPage";
import EditReview from "./pages/EditReview";

// ===============================
// 🟡 HEADER
// ===============================
function Header({ onSearch, onClearSearch, searchRef }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogoClick = () => {
    onClearSearch();
    navigate("/");
    window.scrollTo(0, 0);
  };

  return (
    <header className="bg-black text-white py-6 border-b border-yellow-400 relative">
      <div className="flex items-center justify-center relative">
        <h1
          className="text-5xl font-bold text-yellow-400 cursor-pointer hover:text-yellow-300 transition"
          onClick={handleLogoClick}
        >
          BINGE BOX
        </h1>

        <div className="absolute right-6 top-2 flex gap-4 items-center">
          {user?.role === "Admin" && (
            <Link to="/admin" title="Admin Panel">
              <Key className="w-6 h-6 text-yellow-400 hover:text-yellow-300 transition-transform hover:scale-110" />
            </Link>
          )}
          <UserMenu />
        </div>
      </div>

      <div className="max-w-xl mx-auto mt-4">
        <SearchBar
          ref={searchRef}
          onSearch={onSearch}
          onClearSearch={onClearSearch}
        />
      </div>
    </header>
  );
}

// ===============================
// 🧩 HUVUDSIDA (HomePage)
// ===============================
function HomePage({ movies, mode, query, category, onBack, loading }) {
  const navigate = useNavigate();
  const [movieOfTheWeek, setMovieOfTheWeek] = useState(null);

  // 🎬 Hämta Movie of the Week
  useEffect(() => {
    async function fetchMovieOfTheWeek() {
      try {
        const data = await getMovieOfTheWeek();
        if (!data) return;

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

        setMovieOfTheWeek(fixed);
      } catch (err) {
        console.error("⚠️ Kunde inte hämta Movie of the Week:", err);
      }
    }

    fetchMovieOfTheWeek();
  }, []);

  const formatCategoryName = (key) => {
    switch (key) {
      case "movie":
        return "Movies";
      case "person":
        return "Celebrities";
      default:
        return "All";
    }
  };

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8 relative">
      {/* 🔍 Sökresultat info */}
      {mode === "search" && (
        <>
          <p className="mt-4 text-center text-gray-300">
            Showing results for{" "}
            <span className="text-white">{formatCategoryName(category)}</span>{" "}
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

      {/* 🎞️ Movie of the Week */}
      {mode === "popular" && movieOfTheWeek && (
        <section
          className="relative h-[500px] w-full overflow-hidden mb-10 rounded-xl cursor-pointer group"
          onClick={() => navigate(`/movie/${movieOfTheWeek.movieId}`)}
        >
          <img
            src={
              movieOfTheWeek.backdropUrl ||
              movieOfTheWeek.posterUrl ||
              (movieOfTheWeek.backdrop_path
                ? `https://image.tmdb.org/t/p/original${movieOfTheWeek.backdrop_path}`
                : movieOfTheWeek.poster_path
                ? `https://image.tmdb.org/t/p/w500${movieOfTheWeek.poster_path}`
                : "/placeholder.jpg")
            }
            alt={movieOfTheWeek.title || "Movie of the Week"}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

          <div className="absolute bottom-10 left-10 max-w-xl text-white">
            <h2 className="text-4xl font-bold mb-2 text-yellow-400">
              Movie of the Week
            </h2>
            <h3 className="text-3xl font-semibold mb-2">
              {movieOfTheWeek.title}
            </h3>
            <p className="text-sm text-gray-300 mb-3">
              {movieOfTheWeek.genre || "No genre info"}
            </p>
            <p className="text-gray-200 line-clamp-3">
              {movieOfTheWeek.overview || "No description available."}
            </p>
            <button
              className="mt-4 px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/movie/${movieOfTheWeek.movieId}`);
              }}
            >
              More →
            </button>
          </div>
        </section>
      )}

      {/* 🎬 Filmlista */}
      <div className="mt-8 grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 relative">
        {movies.length === 0 && !loading && (
          <p className="col-span-full text-center text-gray-400">
            No results found.
          </p>
        )}

        {category === "members"
          ? movies.map((u) => (
              <div
                key={u.id}
                onClick={() => navigate(`/user/${u.id}`)}
                className="cursor-pointer bg-black hover:bg-yellow-400 text-white hover:text-black border rounded-xl p-4 flex flex-col items-center justify-center transition-transform hover:scale-105 shadow-md"
              >
                <img
                  src={u.profileImageUrl || "/default-avatar.png"}
                  alt={u.username}
                  className="w-24 h-24 rounded-full object-cover border-2 border-black mb-3"
                />
                <p className="font-semibold text-center">{u.username}</p>
              </div>
            ))
          : movies.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  const rawType = (m.mediaType || m.media_type || "").toLowerCase();
                  const type = rawType === "person" ? "person" : "movie";
                  navigate(
                    type === "person" ? `/person/${m.id}` : `/movie/${m.id}`,
                    {
                      state: {
                        mediaType: type,
                        fromSearch: mode === "search",
                        query,
                        category,
                      },
                    }
                  );
                }}
                className="cursor-pointer hover:scale-105 transition-transform duration-200"
              >
                <MovieCard movie={m} />
              </div>
            ))}

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
// 🔒 ADMIN SKYDD
// ===============================
function ProtectedAdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading)
    return <p className="text-center text-gray-400 mt-10">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "Admin") return <Navigate to="/" replace />;

  return children;
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

  useEffect(() => {
    const handlePopState = () => {
      if (searchRef.current) searchRef.current.clearInput();
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    async function loadPopular() {
      try {
        setLoading(true);
        setError(null);
        const data = await getPopularMovies();

        // 🚫 Filtrera bort TV även från API
        const onlyMovies = Array.isArray(data)
          ? data.filter(
              (m) =>
                m.mediaType !== "tv" &&
                m.media_type !== "tv" &&
                m.type !== "tv" &&
                m.Type !== "tv"
            )
          : [];

        setMovies(onlyMovies);
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

  const handleSearch = async (q, cat) => {
    console.log("🔍 handleSearch TRIGGAD", q, cat);
    if (!q || !q.trim()) return;

    setLoading(true);
    setError(null);

    try {
      let data = [];

      if (cat === "members") {
        data = await searchUsers(q);
      } else {
        data = await searchMovies(q, "movie"); // 🔥 tvinga bara film
      }

      // 🚫 Filtrera bort tv
      data = Array.isArray(data)
        ? data.filter(
            (m) =>
              m.mediaType !== "tv" &&
              m.media_type !== "tv" &&
              m.type !== "tv" &&
              m.Type !== "tv" &&
              !m.first_air_date
          )
        : [];

      setMovies(data);
      setQuery(q);
      setCategory(cat);
      setMode("search");

      if (searchRef.current) searchRef.current.clearInput();
      navigate("/");
    } catch (err) {
      console.error("⚠️ Fel vid sökning:", err);
      setError("Kunde inte hämta sökresultat.");
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = async () => {
    setQuery("");
    setCategory("all");
    setMode("popular");

    if (searchRef.current) searchRef.current.clearInput();

    try {
      setLoading(true);
      const data = await getPopularMovies();

      const onlyMovies = Array.isArray(data)
        ? data.filter(
            (m) =>
              m.mediaType !== "tv" &&
              m.media_type !== "tv" &&
              m.type !== "tv" &&
              m.Type !== "tv"
          )
        : [];

      setMovies(onlyMovies);
      navigate("/");
    } catch (err) {
      console.error("⚠️ Fel vid hämtning:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header
        onSearch={handleSearch}
        onClearSearch={clearSearch}
        searchRef={searchRef}
      />

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
        <Route path="/person/:id" element={<PersonDetails />} />
        <Route path="/movie/:id" element={<MovieDetails />} />

        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/register" element={<Register />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/user/:id" element={<UserProfile />} />
        <Route path="/movie/:id/review" element={<ReviewPage />} />
<Route path="/movie/:id/review/edit/:reviewId" element={<EditReview />} />


        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminPanel />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/featured"
          element={
            <ProtectedAdminRoute>
              <AdminFeatured />
            </ProtectedAdminRoute>
          }
        />
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
