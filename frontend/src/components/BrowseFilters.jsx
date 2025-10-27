import React, { forwardRef, useImperativeHandle, useState } from "react";

const BrowseFilters = forwardRef(({ onFilter }, ref) => {
  const [filters, setFilters] = useState({
    decade: "all",
    genre: "all",
    ratingSort: "none",
  });

  useImperativeHandle(ref, () => ({
    resetFilters: () => {
      setFilters({ decade: "all", genre: "all", ratingSort: "none" });
    },
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);

    // Skicka endast om något faktiskt valts
    if (onFilter) onFilter(newFilters);
  };

  return (
    <div className="flex gap-2 items-center text-white">
      {/* 🎞️ Decade */}
      <select
        name="decade"
        value={filters.decade}
        onChange={handleChange}
        className="bg-black border border-yellow-400 rounded px-2 py-1 text-sm"
      >
        <option value="all">All Decades</option>
        <option value="1970s">1970s</option>
        <option value="1980s">1980s</option>
        <option value="1990s">1990s</option>
        <option value="2000s">2000s</option>
        <option value="2010s">2010s</option>
        <option value="2020s">2020s</option>
      </select>

      {/* 🎭 Genre */}
      <select
        name="genre"
        value={filters.genre}
        onChange={handleChange}
        className="bg-black border border-yellow-400 rounded px-2 py-1 text-sm"
      >
        <option value="all">All Genres</option>
        <option value="Action">Action</option>
        <option value="Adventure">Adventure</option>
        <option value="Animation">Animation</option>
        <option value="Comedy">Comedy</option>
        <option value="Crime">Crime</option>
        <option value="Drama">Drama</option>
        <option value="Fantasy">Fantasy</option>
        <option value="Horror">Horror</option>
        <option value="Romance">Romance</option>
        <option value="Science Fiction">Science Fiction</option>
        <option value="Thriller">Thriller</option>
      </select>

      {/* ⭐ Rating sort */}
      <select
        name="ratingSort"
        value={filters.ratingSort}
        onChange={handleChange}
        className="bg-black border border-yellow-400 rounded px-2 py-1 text-sm"
      >
        <option value="none">Sort by</option>
        <option value="High to Low">Rating: High → Low</option>
        <option value="Low to High">Rating: Low → High</option>
      </select>
    </div>
  );
});

export default BrowseFilters;
