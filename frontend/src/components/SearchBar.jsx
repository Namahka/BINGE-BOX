import { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [q, setQ] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    if (term.length === 0) return;
    onSearch(term);
  };

  return (
    <form onSubmit={submit} className="flex w-full max-w-xl gap-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search movies…"
        className="flex-1 rounded-lg bg-slate-900 border border-slate-800 px-4 py-2 outline-none focus:border-indigo-500"
      />
      <button
        type="submit"
        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium"
      >
        Search
      </button>
    </form>
  );
}
