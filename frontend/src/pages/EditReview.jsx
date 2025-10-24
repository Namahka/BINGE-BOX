import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Star } from "lucide-react";

export default function EditReview() {
  const { id, reviewId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const passedReview = location.state?.review;

  const TMDB_KEY = "ce1d432c64f5d84d0cc30b70d6f30600";

  const [movie, setMovie] = useState(null);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Ladda filmdata från TMDB + befintlig review
  useEffect(() => {
    async function loadData() {
      try {
        const [movieRes] = await Promise.all([
          fetch(
            `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}&language=en-US`
          ),
        ]);

        const movieData = movieRes.ok ? await movieRes.json() : null;
        setMovie(movieData);

        if (passedReview) {
          setContent(passedReview.content || "");
          setRating(passedReview.rating || 0);
        } else {
          const token = localStorage.getItem("token");
          const reviewRes = await fetch(
            `http://localhost:7299/api/reviews/${reviewId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (!reviewRes.ok) throw new Error("Could not fetch review");
          const data = await reviewRes.json();
          setContent(data.content || "");
          setRating(data.rating || 0);
        }
      } catch (err) {
        console.error("❌ Error loading review/movie:", err);
        setError("Could not load review details.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, reviewId]);

  // 🔸 Spara ändringar
  async function handleSave(e) {
    e.preventDefault();
    if (saving) return;

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in.");
        return;
      }

      const res = await fetch(`http://localhost:7299/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          movieId: Number(id),
          rating: Number(rating),
          content,
        }),
      });

      if (!res.ok) throw new Error("Failed to update review.");

      alert("✅ Review updated successfully!");
      navigate("/profile", { state: { openTab: "reviews" } });
    } catch (err) {
      console.error("❌ Update error:", err);
      setError("Something went wrong while saving your review.");
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="text-gray-400 text-center mt-20 animate-pulse">
        Loading review info...
      </div>
    );

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-3 sm:px-6 py-6">
      <div className="bg-neutral-900 border border-yellow-500/40 rounded-2xl shadow-2xl p-6 sm:p-7 w-full max-w-4xl flex flex-col gap-5">
        {/* 🎬 Top section */}
        <div className="flex items-start justify-between gap-4">
          {/* 🎞️ Movie poster */}
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

            {/* ⭐ Rating controls */}
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

          {/* ✏️ Right side — info & input */}
          <div className="flex-1 flex flex-col justify-start">
            {/* Title + year */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 leading-tight">
                  {movie?.title || "Unknown movie"}
                </h2>
                <p className="text-gray-400 italic text-sm mt-1">
                  {movie?.release_date?.slice(0, 4) || ""}
                </p>
              </div>
            </div>

            {/* 💬 Review text */}
            <form
              onSubmit={handleSave}
              className="flex flex-col gap-3 mt-4 w-full"
            >
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Edit your review..."
                className="w-full bg-black border border-gray-700 text-white placeholder-gray-500 rounded-lg p-3 h-24 resize-none focus:ring-2 focus:ring-yellow-400 outline-none text-sm"
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

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 justify-end mt-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || rating === 0 || !content.trim()}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all shadow-lg ${
                    saving
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-yellow-400 hover:bg-yellow-500 text-black hover:shadow-yellow-400/40"
                  }`}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
