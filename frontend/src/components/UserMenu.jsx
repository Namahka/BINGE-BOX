import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function UserMenu() {
  const { user, logout, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Klick utanför = stäng
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center p-2 rounded-full hover:bg-slate-700 transition"
      >
        <User className="w-6 h-6 text-yellow-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-800 text-white rounded-lg shadow-lg border border-slate-700 z-50">
          {loading ? (
            <p className="px-4 py-2 text-gray-400 text-sm">Kontrollerar...</p>
          ) : user ? (
            <>
              <p className="px-4 py-2 text-sm text-gray-300 border-b border-slate-700">
                Inloggad som{" "}
                <span className="text-yellow-400">{user.username}</span>
              </p>
              <button
                onClick={() => {
                  navigate("/profile");
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-700 transition"
              >
                Min sida
              </button>
              <button
                onClick={() => {
                  navigate("/settings");
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-700 transition"
              >
                Inställningar
              </button>
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                  navigate("/");
                }}
                className="w-full text-left px-4 py-2 hover:bg-red-600 text-red-300 hover:text-white border-t border-slate-700 transition"
              >
                Logga ut
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  navigate("/login");
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-700 transition"
              >
                Logga in
              </button>
              <button
                onClick={() => {
                  navigate("/register");
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-700 border-t border-slate-700 transition"
              >
                Skapa konto
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
