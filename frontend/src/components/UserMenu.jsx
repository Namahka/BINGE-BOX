import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../api";
import { User } from "lucide-react"; // om du har lucide-react installerat

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Kolla om användaren är inloggad
    const fetchUser = async () => {
      try {
        const data = await getProfile();
        setUsername(data.username);
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
      }
    };
    fetchUser();
  }, []);

  // Stäng dropdown om man klickar utanför
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUsername("");
    navigate("/");
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* 👤 Knapp */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full hover:bg-slate-800 transition"
      >
        <User size={28} className="text-yellow-400" />
      </button>

      {/* ▼ Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 text-white rounded-lg shadow-lg border border-gray-700 z-50">
          {isLoggedIn ? (
            <>
              <div className="px-4 py-2 border-b border-gray-700 text-sm text-yellow-400">
                {username}
              </div>
              <button
                onClick={() => {
                  navigate("/profile");
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                Min sida
              </button>
              <button
                onClick={() => {
                  navigate("/settings");
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                Inställningar
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700"
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
                className="w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                Logga in
              </button>
              <button
                onClick={() => {
                  navigate("/register");
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-700"
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
