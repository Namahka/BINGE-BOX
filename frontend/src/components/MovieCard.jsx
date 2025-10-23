import { useState, useEffect } from "react";
import { Star, Plus, Check, Clock, X, ArrowRightLeft } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";
import { useWatchlist } from "../hooks/useWatchlist";
import LoginRequiredPopup from "./LoginRequiredPopup";
import { useNavigate } from "react-router-dom";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const TMDB_API_KEY = "ce1d432c64f5d84d0cc30b70d6f30600"; // samma som i appsettings.json

export default function MovieCard({ movie, onRemove, onMove }) {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();
 const {
  watchlist,
  addToWatchlist,
  updateStatus,
  removeFromWatchlist,
} = useWatchlist();


  const [showPopup, setShowPopup] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [status, setStatus] = useState(null);
  const [extraInfo, setExtraInfo] = useState({});

  const movieId = Number(
    movie.tmdbId ?? movie.tmdbID ?? movie.movieId ?? movie.MovieId ?? movie.id
  );

  // 💛 Sätt favoritstatus
  useEffect(() => {
    const fav = favorites.some((f) => Number(f.movieId) === Number(movieId));
    setIsFavorite(fav);
  }, [favorites, movieId]);

  // ⏱️ Hämta watchlist-status
  useEffect(() => {
    const item = watchlist.find((w) => Number(w.movieId) === Number(movieId));
    setStatus(item ? item.status : null);
  }, [watchlist, movieId]);

  // 🧩 Hämta TMDb-info (en gång per id)
  useEffect(() => {
    if (!movieId || movie.overview || movie.description || movie.genre) return;

    let isMounted = true;
    const fetchMovie = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted) return;
        setExtraInfo({
          genres: data.genres?.map((g) => g.name).join(", "),
          overview: data.overview,
          rating: data.vote_average,
        });
      } catch (err) {
        console.error("⚠️ TMDb fetch failed:", err);
      }
    };

    fetchMovie();
    return () => {
      isMounted = false;
    };
  }, [movieId]);

  // 💛 Hantera favorit
  const handleFav = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) return setShowPopup(true);
    await toggleFavorite(movie);
  };

  // 📋 Öppna meny
  const handleMenu = (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) return setShowPopup(true);
    setShowMenu((v) => !v);
  };

  // 🎬 Hantera val i meny
  const handleChoice = async (choice) => {
    setShowMenu(false);
    const token = localStorage.getItem("token");
    if (!token) return setShowPopup(true);

    if (choice === "remove") {
      await removeFromWatchlist(movieId);
      setStatus(null);
      onRemove?.(movieId); // 🔥 meddela Profile
      return;
    }

    if (choice === "move") {
      const newStatus = status === "watched" ? "to-watch" : "watched";
      setStatus(newStatus);
      await updateStatus(movieId, newStatus);
      onMove?.(movieId, newStatus); // 🔥 meddela Profile
      return;
    }

    // Lägg till eller ändra status
    if (!status) {
      await addToWatchlist(movie, choice);
      setStatus(choice);
    } else {
      await updateStatus(movieId, choice);
      setStatus(choice);
    }
    onMove?.(movieId, choice);
  };

  // 🔗 Klick för att öppna detaljsida
  const handleClick = () => {
    if (!movieId) return;
    const type =
      movie.mediaType === "person" || movie.media_type === "person"
        ? "person"
        : "movie";

    navigate(
      type === "person" ? `/person/${movieId}` : `/movie/${movieId}`,
      { state: { mediaType: type, fromCard: true } }
    );
  };

  // 🖼️ Bild, genre, beskrivning osv.
  const poster =
    movie.posterUrl?.startsWith("http")
      ? movie.posterUrl
      : movie.PosterUrl?.startsWith("http")
      ? movie.PosterUrl
      : movie.poster_path
      ? `${TMDB_IMAGE_BASE}${movie.poster_path}`
      : movie.profile_path
      ? `${TMDB_IMAGE_BASE}${movie.profile_path}`
      : "/placeholder.jpg";

  const genreText =
    movie.genre ||
    extraInfo.genres ||
    (movie.genres?.length
      ? movie.genres.map((g) => g.name).join(", ")
      : movie.genre_ids?.join(", ") ||
        movie.known_for_department ||
        movie.release_date?.slice(0, 4) ||
        "Unknown genre");

  const overviewText =
    movie.description ||
    movie.overview ||
    extraInfo.overview ||
    movie.biography ||
    movie.tagline ||
    "No description available.";

  const ratingValue =
    movie.rating ??
    movie.vote_average ??
    extraInfo.rating ??
    movie.voteAverage ??
    null;

  return (
    <div
      onClick={handleClick}
      className="relative bg-black border border-gray-700 rounded-xl overflow-hidden hover:scale-[1.03] transition-transform duration-200 cursor-pointer"
    >
      {/* 💛 Favorite */}
      <button
        onClick={handleFav}
        className={`absolute top-2 right-2 p-2 rounded-full z-10 ${
          isFavorite
            ? "text-yellow-400 bg-black/80"
            : "text-gray-400 bg-black/70 hover:text-yellow-300"
        }`}
      >
        <Star
          fill={isFavorite ? "currentColor" : "none"}
          strokeWidth={2}
          size={22}
        />
      </button>

      {/* ⏱️ Watchlist-menu */}
      <button
        onClick={handleMenu}
        className="absolute top-2 left-2 p-2 rounded-full bg-black/70 hover:bg-black/90 text-gray-300 hover:text-yellow-300 z-10"
      >
        {status === "watched" ? (
          <Check size={22} className="text-green-400" />
        ) : status === "to-watch" ? (
          <Clock size={22} className="text-yellow-400" />
        ) : (
          <Plus size={22} />
        )}
      </button>

      {showMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-12 left-2 bg-black/95 border border-gray-700 rounded-md text-sm shadow-lg z-20"
        >
          <button
            onClick={() => handleChoice("watched")}
            className="block w-full text-left px-4 py-2 text-green-400 hover:bg-green-600/20"
          >
            ✅ Watched
          </button>
          <button
            onClick={() => handleChoice("to-watch")}
            className="block w-full text-left px-4 py-2 text-yellow-400 hover:bg-yellow-600/20"
          >
            ⏰ To Watch
          </button>
          {status && (
            <>
              <button
                onClick={() => handleChoice("move")}
                className="block w-full text-left px-4 py-2 text-blue-400 hover:bg-blue-600/20"
              >
                <ArrowRightLeft size={16} className="inline mr-1" />
                Move to {status === "watched" ? "To Watch" : "Watched"}
              </button>
              <button
                onClick={() => handleChoice("remove")}
                className="block w-full text-left px-4 py-2 text-red-400 hover:bg-red-600/20"
              >
                <X size={16} className="inline mr-1" />
                Remove
              </button>
            </>
          )}
        </div>
      )}

      <img
        src={poster}
        onError={(e) => (e.target.src = "/placeholder.jpg")}
        alt={movie.title || movie.name}
        className="w-full h-[300px] object-cover"
      />

      <div className="p-3 text-center text-white">
        <h3 className="text-md font-semibold text-yellow-400 truncate mb-1">
          {movie.title || movie.name || "Untitled"}
        </h3>
        <p className="text-xs text-gray-400 italic mb-1">{genreText}</p>
        {ratingValue && (
          <p className="text-sm text-yellow-300 mb-1">
            ⭐ {Number(ratingValue).toFixed(1)}
          </p>
        )}
        <p className="text-xs text-gray-400 line-clamp-3 leading-snug">
          {overviewText}
        </p>
      </div>

      {showPopup && <LoginRequiredPopup onClose={() => setShowPopup(false)} />}
    </div>
  );
}
