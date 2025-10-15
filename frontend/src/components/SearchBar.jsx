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

  const getPlaceholder = () => {
    switch (category) {
      case "movie":
        return "Search movies...";
      case "tv":
        return "Search TV shows...";
      case "person":
        return "Search celebrities...";
      case "members":
        return "Search members...";
      default:
        return "Search movies, TV, celebs, or members...";
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center bg-white rounded-md overflow-hidden h-10"
    >
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="bg-white text-black px-2 outline-none border-none py-2 text-sm"
      >
        <option value="all">All</option>
        <option value="movie">Movies</option>
        <option value="tv">TV</option>
        <option value="person">Celebs</option>
        <option value="members">Members</option> {/* 👈 NY! */}
      </select>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={getPlaceholder()}
        className="bg-white text-black px-3 w-full placeholder-black focus:outline-none text-sm"
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
        className="bg-white text-black font-semibold hover:bg-yellow-300 transition hover:text-black px-4 py-2 text-sm"
      >
        Search
      </button>
    </form>
  );
});

export default SearchBar;
