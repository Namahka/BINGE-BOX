/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from "react";
import { getProfile } from "../api";

// 🟡 Skapa context
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🧠 Hämta användarprofil vid start
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setUser(data);
      } catch (err) {
        console.warn("⚠️ Kunde inte hämta profil (token finns kvar)", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ✅ Login
  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
    window.dispatchEvent(new Event("authChange"));
  };

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.dispatchEvent(new Event("authChange"));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
