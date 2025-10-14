import { createContext, useContext, useEffect, useState } from "react";
import { getProfile } from "../api";

// Skapa context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Körs när appen startar
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Försök hämta profil
    getProfile()
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // ✅ Funktion som anropas vid lyckad login
  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  // ✅ Funktion som anropas vid logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Hook för att använda context i andra komponenter
export function useAuth() {
  return useContext(AuthContext);
}
