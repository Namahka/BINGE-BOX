import { useState } from "react";

export default function SearchBar({ onSearch, compact = false }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query, category);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center bg-slate-800 rounded-md overflow-hidden ${
        compact ? "h-8 text-sm" : "h-10"
      }`}
    >
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className={`bg-slate-900 text-slate-200 px-2 outline-none border-none ${
          compact ? "text-xs py-1" : "py-2"
        }`}
      >
        <option value="all">All</option>
        <option value="movie">Movies</option>
        <option value="tv">TV</option>
        <option value="person">Celebs</option>
      </select>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={
          compact ? "Search..." : "Search movies, TV, celebs..."
        }
        className={`bg-slate-800 text-slate-200 px-3 w-full placeholder-slate-400 focus:outline-none ${
          compact ? "text-xs" : "text-sm"
        }`}
      />

      <button
        type="submit"
        className={`bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition ${
          compact ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm"
        }`}
      >
        Search
      </button>
    </form>
  );
}
