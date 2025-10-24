import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Check } from "lucide-react";

export default function ReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const TMDB_KEY = "ce1d432c64f5d84d0cc30b70d6f30600";

  const [movie, setMovie] = useState(null);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [watched, setWatched] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovie() {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}&language=en-US`
        );
        if (!res.ok) throw new Error("TMDB request failed");
        const data = await res.json();
        setMovie(data);
      } catch (err) {
        console.error("❌ TMDB error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMovie();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("token");
    if (!token) return setError("Please log in first.");

    try {
      setPosting(true);

      const res = await fetch("http://localhost:7299/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          movieId: Number(id),
          rating,
          content,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit review");

      if (watched && movie) {
        const watchData = {
          movieId: Number(id),
          title: movie.title,
          posterUrl: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : null,
          type: "movie",
          status: "watched",
        };

        const watchRes = await fetch("http://localhost:7299/api/watchlist/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(watchData),
        });

        if (!watchRes.ok) {
          const errText = await watchRes.text();
          console.warn("⚠️ Watchlist add failed:", errText);
        }
      }

      navigate("/profile", { state: { openTab: "reviews" } });
    } catch (err) {
      console.error("❌ Error:", err);
      setError("Failed to submit review.");
    } finally {
      setPosting(false);
    }
  }

  if (loading)
    return (
      <div className="text-gray-400 text-center mt-20 animate-pulse">
        Loading movie info...
      </div>
    );

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-3 sm:px-6 py-6">
      <div
        className="bg-neutral-900 border border-yellow-500/40 rounded-2xl shadow-2xl 
                   p-5 sm:p-6 md:p-7 w-full max-w-4xl flex flex-col gap-4"
      >
        {/* 🎬 Top section — Bild, titel, år, watched */}
        <div className="flex items-start justify-between gap-4">
          {/* 📸 Movie poster */}
          <div className="flex flex-col items-center">
            <img
              src={
                movie?.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : "/placeholder.jpg"
              }
              alt={movie?.title}
              className="w-32 md:w-36 rounded-xl border border-yellow-400/70 shadow-md"
            />

            {/* ⭐ Rating just under image */}
            <div className="flex justify-center gap-2 mt-3">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setRating(num)}
                  className="flex flex-col items-center focus:outline-none"
                >
                  <Star
                    size={26}
                    color={num <= rating ? "#facc15" : "#555"}
                    fill={num <= rating ? "#facc15" : "none"}
                    className="hover:scale-110 transition-transform"
                  />
                  <span
                    className={`text-[11px] ${
                      num <= rating ? "text-yellow-400" : "text-gray-600"
                    }`}
                  >
                    {num}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 📝 Info & input on the right */}
          <div className="flex-1 flex flex-col justify-start">
            {/* Header row: title + watched */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 leading-tight">
                  {movie?.title}
                </h2>
                <p className="text-gray-400 italic text-sm mt-1">
                  {movie?.release_date?.slice(0, 4) || ""}
                </p>
              </div>

              {/* ✅ Watched toggle to far right */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={watched}
                  onChange={(e) => setWatched(e.target.checked)}
                  className="hidden"
                />
                <span
                  className={`w-6 h-6 flex items-center justify-center border-2 rounded transition-all ${
                    watched
                      ? "border-green-400 bg-green-400 text-black"
                      : "border-gray-500"
                  }`}
                >
                  {watched && <Check size={16} />}
                </span>
                <span className="text-gray-300 text-sm">Watched</span>
              </label>
            </div>

            {/* 💬 Textarea */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 mt-4 w-full"
            >
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts about this movie..."
                className="w-full bg-black border border-gray-700 text-white placeholder-gray-500 rounded-lg 
                           p-3 h-24 resize-none focus:ring-2 focus:ring-yellow-400 outline-none text-sm"
              />

              {rating > 0 && (
                <p className="text-gray-400 text-xs">
                  Selected rating:{" "}
                  <span className="text-yellow-400 font-semibold">
                    {rating}/5
                  </span>
                </p>
              )}

              {error && <p className="text-red-400 text-sm mt-1">{error}</p>}

              <button
                type="submit"
                disabled={posting || rating === 0 || !content.trim()}
                className={`mt-2 px-6 py-2 rounded-lg font-semibold transition-all w-full sm:w-auto ${
                  posting
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-yellow-400 hover:bg-yellow-500 text-black shadow-lg hover:shadow-yellow-500/40"
                }`}
              >
                {posting ? "Submitting..." : "Post Review"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
