import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Key } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

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
        className="flex items-center justify-center p-2 rounded-full hover:bg-yellow-400 transition"
      >
        <User className="w-6 h-6 text-yellow-400 hover:text-black transition " />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg border border-yellow-400 z-50">
          {loading ? (
            <p className="px-4 py-2 text-gray-400 text-sm">Kontrollerar...</p>
          ) : user ? (
            <>
              <p className="px-4 py-2 text-sm text-gray-500 border-b border-yellow-200">
                Inloggad som{" "}
                <span className="text-yellow-600 font-semibold">{user.username}</span>
              </p>

              {/* 👤 Profil */}
              <button
                onClick={() => {
                  console.log("Navigerar till:", "/profile");
                  navigate("/profile"); // ⬅️ FIX: går alltid till /profile för den inloggade användaren
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-yellow-400 hover:text-black transition"
              >
                Min sida
              </button>

              {/* ⚙️ Inställningar */}
              <button
                onClick={() => {
                  navigate("/settings");
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-yellow-400 hover:text-black transition"
              >
                Inställningar
              </button>

              {/* 🗝️ Admin-knapp (endast om rollen är Admin) */}
              {user.role === "Admin" && (
                <button
                  onClick={() => {
                    navigate("/admin");
                    setOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-yellow-500 hover:text-black transition flex items-center gap-2"
                >
                  <Key size={16} /> Admin-panel
                </button>
              )}

              {/* 🚪 Logga ut */}
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                  navigate("/");
                }}
                className="w-full text-left px-4 py-2 hover:bg-red-600 text-red-500 hover:text-white border-t border-yellow-300 transition"
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
                className="w-full text-left px-4 py-2 hover:bg-yellow-400 hover:text-black transition"
              >
                Logga in
              </button>

              <button
                onClick={() => {
                  navigate("/register");
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-yellow-400 hover:text-black transition"
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
