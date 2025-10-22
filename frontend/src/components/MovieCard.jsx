import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";
import LoginRequiredPopup from "./LoginRequiredPopup";
import { useNavigate } from "react-router-dom";

export default function MovieCard({ movie }) {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();
  const [showPopup, setShowPopup] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // 🧠 Håll stjärnan uppdaterad
  useEffect(() => {
    const fav = favorites.some(
      (f) => Number(f.movieId) === Number(movie.id || movie.movieId)
    );
    setIsFavorite(fav);
  }, [favorites, movie]);

  // ⭐ Klick på stjärnan
  const handleFavoriteClick = async (e) => {
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      setShowPopup(true);
      return;
    }

    const el = document.getElementById(`fav-${movie.id || movie.movieId}`);
    if (el) {
      el.classList.add("scale-125");
      setTimeout(() => el.classList.remove("scale-125"), 200);
    }

    await toggleFavorite(movie);
  };

  // 🎬 Bestäm rätt typ
  const type =
    movie.mediaType || movie.media_type || (movie.known_for_department ? "person" : "movie");

 // 🎬 Bildkälla (fixad)
const poster = (() => {
  if (movie.posterUrl && movie.posterUrl.startsWith("http")) return movie.posterUrl;
  if (movie.profile && movie.profile.startsWith("http")) return movie.profile;
  if (movie.poster_path)
    return `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  if (movie.profile_path)
    return `https://image.tmdb.org/t/p/w500${movie.profile_path}`;
  return "/placeholder.jpg";
})();


  // 🧭 Navigering beroende på typ
  const handleClick = () => {
    if (type === "person") navigate(`/person/${movie.id}`);
    else if (type === "tv") navigate(`/tv/${movie.id}`);
    else navigate(`/movie/${movie.id}`);
  };

  return (
    <div
      className="relative bg-black border border-gray-700 rounded-xl overflow-hidden hover:scale-[1.03] transition-transform duration-200 cursor-pointer"
      onClick={handleClick}
    >
      {/* ⭐ Stjärna */}
      <button
        id={`fav-${movie.id || movie.movieId}`}
        onClick={handleFavoriteClick}
        className={`absolute top-2 right-2 p-2 rounded-full transition-transform z-10 ${
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

      {/* 🎬 Bild */}
      <img src={poster} alt={movie.title} className="w-full h-[300px] object-cover" />

      {/* 📄 Info */}
      <div className="p-3 text-center text-white">
        <h3 className="text-md font-semibold text-yellow-400 truncate mb-1">
          {movie.title || movie.name || "Okänd titel"}
        </h3>
        <p className="text-xs text-gray-400 italic mb-1">
          {movie.genre ||
            movie.known_for_department ||
            (movie.genres?.[0]?.name
              ? movie.genres[0].name
              : "Okänd genre")}
        </p>
        {(movie.rating || movie.vote_average) && (
          <p className="text-sm text-yellow-300 mb-1">
            ⭐ {(movie.rating || movie.vote_average).toFixed(1)}
          </p>
        )}
        <p className="text-xs text-gray-400 line-clamp-3 leading-snug">
          {movie.overview || movie.biography || "Ingen beskrivning tillgänglig."}
        </p>
      </div>

      {showPopup && <LoginRequiredPopup onClose={() => setShowPopup(false)} />}
    </div>
  );
}
