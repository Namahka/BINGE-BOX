import { useNavigate, Link } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useSearch } from "../context/SearchContext";
import { useAuth } from "../hooks/useAuth";
import { Key } from "lucide-react";

export default function Navbar() {
  const { handleSearch } = useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNavbarSearch = (q, cat) => {
    handleSearch(q, cat);
    navigate("/"); // skickar användaren till startsidan
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur border-b border-slate-800">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        {/* 🟡 Left: Logo */}
        <a
          href="/"
          className="text-xl font-bold tracking-tight text-yellow-400 hover:text-yellow-300 transition"
        >
          BINGE BOX
        </a>

        {/* 🔍 Right: Search + Admin + Sign in */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block w-56">
            <SearchBar compact onSearch={handleNavbarSearch} />
          </div>

          {/* 👑 Adminnyckel – endast admin */}
          {user?.role === "Admin" && (
            <Link to="/admin" title="Admin Panel">
              <Key className="w-5 h-5 text-yellow-400 hover:text-yellow-300" />
            </Link>
          )}

          <button className="text-sm px-3 py-1.5 rounded-md border border-slate-700 hover:bg-slate-800 text-slate-200">
            Sign in
          </button>
        </div>
      </div>
    </header>
  );
}
