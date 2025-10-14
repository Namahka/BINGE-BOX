import { createContext, useContext, useEffect, useState } from "react";
import { getProfile } from "../api";

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

  // ✅ Vid login
  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);

    // 🔁 trigga global event (för FavoritesContext)
    window.dispatchEvent(new Event("authChange"));
  };

  // ✅ Vid logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);

    // 🔁 trigga global event (för FavoritesContext)
    window.dispatchEvent(new Event("authChange"));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
