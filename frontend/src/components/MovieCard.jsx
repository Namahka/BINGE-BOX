import { genreMap } from "../utils/genreMap.js";

export default function MovieCard({ movie }) {
  // Hämta genrer från TMDB (via genre_ids eller genres)
  let genreText = "Okänd genre";
  if (Array.isArray(movie.genre_ids) && movie.genre_ids.length > 0) {
    genreText = movie.genre_ids
      .map((id) => genreMap[id] || "")
      .filter(Boolean)
      .join(", ");
  } else if (Array.isArray(movie.genres) && movie.genres.length > 0) {
    genreText = movie.genres.join(", ");
  } else if (movie.genre) {
    genreText = movie.genre;
  }

  return (
    <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-transform hover:scale-[1.03] duration-200 flex flex-col h-[500px]">
      {/* Bild */}
      <div className="w-full h-[280px] bg-slate-900 flex items-center justify-center">
        {movie.posterUrl || movie.poster ? (
          <img
            src={movie.posterUrl || movie.poster}
            alt={movie.title}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-gray-500 text-sm">Ingen bild</div>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 flex flex-col justify-between p-4">
        <div>
          <h3 className="text-yellow-400 font-semibold text-lg truncate mb-1">
            {movie.title || "Untitled"}
          </h3>

          {movie.rating && (
            <p className="text-yellow-400 text-sm mb-1">⭐ {movie.rating.toFixed(1)}</p>
          )}

          <p className="text-slate-300 text-sm line-clamp-3 leading-snug">
            {movie.overview ||
              movie.description ||
              "Ingen beskrivning tillgänglig."}
          </p>
        </div>

        <p className="text-slate-400 text-xs mt-2 italic truncate">{genreText}</p>
      </div>
    </div>
  );
}
