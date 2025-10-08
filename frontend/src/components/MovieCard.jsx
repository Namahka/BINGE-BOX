import React from "react";

export default function MovieCard({ movie }) {
  const isPerson = !movie.releaseDate && movie.overview?.startsWith("Known for");

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden shadow hover:scale-105 transition-transform duration-200">
      {movie.posterUrl ? (
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-64 object-cover"
        />
      ) : (
        <div className="w-full h-64 flex items-center justify-center bg-slate-700 text-gray-400">
          No image
        </div>
      )}

      <div className="p-3">
        <h3 className="font-semibold text-lg truncate text-yellow-300">
          {movie.title}
        </h3>

        <p className="text-sm text-gray-400 line-clamp-2">
          {movie.overview || "No description available."}
        </p>

        {!isPerson && movie.rating != null && movie.rating > 0 && (
          <p className="text-yellow-400 mt-1 font-medium">
            ⭐ {movie.rating.toFixed(1)}
          </p>
        )}
      </div>
    </div>
  );
}
