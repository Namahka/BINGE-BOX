import { useState } from "react";
import { toggleFavorite } from "../api";

import { Star } from "lucide-react";

export default function MovieCard({ movie }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation(); // 🧱 stoppar klicket från att trigga navigation

    const token = localStorage.getItem("token");
    if (!token) {
      setShowPopup(true);
      return;
    }

    console.log("⭐ Klick på favorit:", movie); // 👈 detta ska synas i konsolen

    try {
      await toggleFavorite(movie);
      setIsFavorite((prev) => !prev);

      // 🔥 liten animation
      const el = document.getElementById(`fav-${movie.id}`);
      if (el) {
        el.classList.add("scale-125");
        setTimeout(() => el.classList.remove("scale-125"), 200);
      }
    } catch (err) {
      console.error("❌ Fel vid favorit:", err);
    }
  };

  return (
    <div className="relative bg-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-transform hover:scale-[1.03] duration-200 flex flex-col h-[500px]">
      {/* ⭐ FAVORIT-IKON */}
      <button
        id={`fav-${movie.id}`}
        onClick={handleFavoriteClick}
        className={`absolute top-3 right-3 p-2 rounded-full transition-transform z-10 ${
          isFavorite ? "text-yellow-400" : "text-gray-400 hover:text-yellow-300"
        }`}
      >
        <Star
          fill={isFavorite ? "currentColor" : "none"}
          strokeWidth={2}
          size={22}
        />
      </button>

      {/* 🎬 Filmens bild */}
      <div className="w-full h-[280px] bg-slate-900 flex items-center justify-center">
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-gray-500 text-sm">Ingen bild</div>
        )}
      </div>

      {/* 📄 Info */}
      <div className="flex-1 flex flex-col justify-between p-4">
        <h3 className="text-yellow-400 font-semibold text-lg truncate mb-1">
          {movie.title || "Untitled"}
        </h3>

        {movie.rating && (
          <p className="text-yellow-400 text-sm mb-1">
            ⭐ {movie.rating.toFixed(1)}
          </p>
        )}

        <p className="text-slate-300 text-sm line-clamp-3 leading-snug">
          {movie.overview || "Ingen beskrivning tillgänglig."}
        </p>

        <p className="text-slate-400 text-xs mt-2 italic truncate">
          {movie.genre || "Okänd genre"}
        </p>
      </div>

      {/* 🔒 Popup för icke inloggade */}
      {showPopup && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white rounded-2xl">
          <p className="mb-3">Du måste vara inloggad för att spara favoriter</p>
          <div className="flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = "/login";
              }}
              className="bg-yellow-400 text-black px-3 py-1 rounded"
            >
              Logga in
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = "/register";
              }}
              className="bg-gray-700 px-3 py-1 rounded"
            >
              Skapa konto
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
