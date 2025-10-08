// src/components/SearchBar.jsx
import React, { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query, category);
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const categories = [
    { key: "all", label: "All" },
    { key: "movie", label: "Titles" },
    { key: "tv", label: "TV Episodes" },
    { key: "person", label: "Celebs" },
    { key: "company", label: "Companies" },
    { key: "keyword", label: "Keywords" },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 w-full max-w-2xl mx-auto bg-slate-800 rounded-lg shadow-md p-2"
    >
      {/* Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={toggleDropdown}
          className="bg-slate-900 text-white px-3 py-2 rounded-md hover:bg-slate-700 flex items-center gap-1"
        >
          {categories.find((c) => c.key === category)?.label || "All"} ▼
        </button>

        {dropdownOpen && (
          <div className="absolute top-10 left-0 bg-slate-900 border border-slate-700 rounded-md w-40 shadow-lg z-50">
            {categories.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => {
                  setCategory(c.key);
                  setDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700"
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search input */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search movies, TV, celebs..."
        className="flex-1 bg-transparent text-white outline-none px-3"
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
