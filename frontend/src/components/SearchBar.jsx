import React, { useState, forwardRef, useImperativeHandle } from "react";

const SearchBar = forwardRef(({ onSearch, onClearSearch }, ref) => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  // Gör att App kan rensa sökrutan via ref
  useImperativeHandle(ref, () => ({
    clearInput: () => setQuery(""),
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query, category);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center bg-fuchsia-900 rounded-md overflow-hidden h-10"
    >
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="bg-fuchsia-900 text-orange-500 px-2 outline-none border-none py-2 text-sm"
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
        placeholder="Search movies, TV, celebs..."
        className="bg-fuchsia-900 text-black px-3 w-full placeholder-cyan-100 focus:outline-none text-sm"
      />

      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            onClearSearch();
          }}
          className="text-gray-400 px-2 hover:text-yellow-400"
        >
          ✕
        </button>
      )}

      <button
        type="submit"
        className="bg-fuchsia-900 text-orange-500 font-semibold hover:bg-yellow-300 transition px-4 py-2 text-sm"
      >
        Search
      </button>
    </form>
  );
});

export default SearchBar;
