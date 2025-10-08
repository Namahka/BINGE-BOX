// src/components/SearchBar.jsx
import { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query, category);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 w-full max-w-xl mx-auto bg-slate-800 rounded-xl p-2 shadow-lg"
    >
      {/* Dropdown */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="bg-slate-900 text-white px-3 py-2 rounded-md focus:outline-none"
      >
        <option value="all">All</option>
        <option value="movie">Titles</option>
        <option value="tv">TV episodes</option>
        <option value="person">Celebs</option>
        <option value="company">Companies</option>
        <option value="keyword">Keywords</option>
      </select>

      {/* Input */}
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 bg-transparent text-white outline-none px-2"
      />

      {/* Submit */}
      <button
        type="submit"
        className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-semibold px-4 py-2 rounded-md"
      >
        Search
      </button>
    </form>
  );
}
