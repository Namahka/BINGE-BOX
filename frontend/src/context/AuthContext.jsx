import { createContext, useContext, useEffect, useState } from "react";
import { getProfile } from "../api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🧠 Hämtar profil men tar inte bort token om servern är nere
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
        console.warn("⚠️ Kunde inte hämta profil just nu (men token finns kvar)");
        // ❗ Ta INTE bort token om servern inte svarar
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ✅ Vid login
  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
    window.dispatchEvent(new Event("authChange"));
  };

  // ✅ Vid logout
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

export function useAuth() {
  return useContext(AuthContext);
}
