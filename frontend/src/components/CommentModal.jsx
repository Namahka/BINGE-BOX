import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CommentModal({
  reviewId,
  currentUser,
  onClose,
  onCommentCountChange,
}) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadComments() {
      try {
        const res = await fetch(
          `http://localhost:7299/api/comments/review/${reviewId}`
        );
        if (!res.ok) throw new Error("Failed to load comments");
        const data = await res.json();
        setComments(data);
        onCommentCountChange?.(data.length);
      } catch (err) {
        console.error("⚠️ Could not load comments:", err);
      } finally {
        setLoading(false);
      }
    }
    loadComments();
  }, [reviewId]);

  async function handleAdd() {
    if (!newComment.trim()) return;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to comment!");
      return;
    }

    try {
      const res = await fetch("http://localhost:7299/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reviewId, content: newComment }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => [comment, ...prev]);
        setNewComment("");
        onCommentCountChange?.(comments.length + 1);
      }
    } catch (err) {
      console.error("❌ Failed to post comment:", err);
    }
  }

  async function handleSaveEdit(id) {
    const token = localStorage.getItem("token");
    if (!token || !editText.trim()) return;

    try {
      const res = await fetch(`http://localhost:7299/api/comments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: editText }),
      });
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, content: editText, edited: true } : c
          )
        );
        setEditingId(null);
        setEditText("");
      }
    } catch (err) {
      console.error("⚠️ Could not edit comment:", err);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this comment?")) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch(`http://localhost:7299/api/comments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments((prev) => prev.filter((c) => c.id !== id));
      onCommentCountChange?.(comments.length - 1);
    } catch (err) {
      console.error("⚠️ Could not delete comment:", err);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
      <div className="bg-neutral-900 border border-yellow-500/40 rounded-2xl w-[90%] max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-yellow-400 text-xl"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-yellow-400 mb-4 text-center">
          Comments ({comments.length})
        </h2>

        {loading ? (
          <p className="text-gray-400 text-center">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 text-center">No comments yet.</p>
        ) : (
          <ul className="space-y-3">
            {comments.map((c) => (
              <li
                key={c.id}
                className={`border border-gray-700 rounded-lg bg-neutral-800 p-3 hover:border-yellow-400/60 transition ${
                  c.userId === currentUser?.id ? "ring-1 ring-yellow-500/50" : ""
                }`}
              >
                {/* ✅ Fixad layout */}
                <div className="flex items-start gap-3">
                  {/* 🖼 Profilbild – nu synlig och rätt storlek */}
                  <div className="flex-shrink-0">
                    <img
  src={
    c.profileImageUrl?.startsWith("http")
      ? c.profileImageUrl
      : `http://localhost:7299${c.profileImageUrl}`
  }
  alt={c.username || "User"}
  className="w-10 h-10 rounded-full border border-yellow-600 object-cover cursor-pointer hover:ring-2 hover:ring-yellow-400 transition"
  onClick={() => navigate(`/user/${c.userId}`)}
  onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
/>

                  </div>

                  {/* 👤 Textdel */}
                  <div className="flex flex-col flex-1 text-left">
                    {/* Namn + Datum + Edit/Delete */}
                    <div className="flex justify-between items-start">
                      <div>
                        <span
                          onClick={() => navigate(`/user/${c.userId}`)}
                          className="text-yellow-400 font-semibold hover:underline cursor-pointer"
                        >
                          {c.username}
                        </span>
                        <p className="text-xs text-gray-500 mt-[1px]">
                          {new Date(c.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                          {c.edited && (
                            <span className="text-gray-500 ml-1">(edited)</span>
                          )}
                        </p>
                      </div>

                      {/* ✏️ / 🗑 */}
                      {currentUser?.id === c.userId && (
                        <div className="flex gap-2 ml-3">
                          {editingId === c.id ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(c.id)}
                                className="text-green-400 text-sm hover:text-green-300"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="text-gray-400 text-sm hover:text-gray-300"
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingId(c.id);
                                  setEditText(c.content);
                                }}
                                className="text-yellow-400 text-sm hover:text-yellow-300"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(c.id)}
                                className="text-red-400 text-sm hover:text-red-300"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 💬 Kommentartext – ligger nu direkt under namnet */}
                    {editingId === c.id ? (
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full bg-black border border-yellow-400 rounded mt-2 p-2 text-sm text-white resize-none focus:ring-1 focus:ring-yellow-400"
                      />
                    ) : (
                      <p className="text-gray-300 text-sm mt-1 leading-relaxed whitespace-pre-wrap">
                        {c.content}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* ➕ Ny kommentar */}
        <div className="mt-5 border-t border-gray-700 pt-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full bg-black border border-gray-600 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-yellow-400 resize-none"
          ></textarea>
          <button
            onClick={handleAdd}
            className="mt-2 w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg transition"
          >
            Post Comment
          </button>
        </div>
      </div>
    </div>
  );
}
