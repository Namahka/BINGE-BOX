/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from "react";
import { getProfile } from "../api";

// 🟡 Skapa global AuthContext
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
        if (data) {
          setUser(data);
        } else {
          console.warn("⚠️ getProfile returnerade tomt svar");
          setUser(null);
        }
      } catch (err) {
        console.warn("⚠️ Kunde inte hämta profil (token finns kvar):", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ✅ Login-funktion
  const login = (token, userData) => {
    try {
      localStorage.setItem("token", token);
      setUser(userData);
      window.dispatchEvent(new Event("authChange"));
    } catch (err) {
      console.error("❌ Fel vid login:", err);
    }
  };

  // ✅ Logout-funktion
  const logout = () => {
    try {
      localStorage.removeItem("token");
      setUser(null);
      window.dispatchEvent(new Event("authChange"));
    } catch (err) {
      console.error("❌ Fel vid logout:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
