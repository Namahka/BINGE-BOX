import { createContext, useContext, useState, useEffect } from "react";
import { getFavorites, toggleFavorite } from "../api";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🟢 Ladda favoriter från servern när token ändras (inloggning / utloggning)
  useEffect(() => {
    const loadFavorites = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      try {
        const data = await getFavorites();
        setFavorites(data || []);
      } catch (err) {
        console.error("⚠️ Kunde inte hämta favoriter:", err);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();

    // 🔁 Ladda om när användaren loggar in / ut
    window.addEventListener("storage", loadFavorites);
    return () => window.removeEventListener("storage", loadFavorites);
  }, []);

  // 🔁 Lägg till / ta bort film i backend + uppdatera state direkt
  const handleToggleFavorite = async (movie) => {
    try {
      const result = await toggleFavorite(movie);

      setFavorites((prev) => {
        const exists = prev.some((f) => f.movieId === movie.id);
        if (exists) {
          return prev.filter((f) => f.movieId !== movie.id);
        } else {
          return [
            ...prev,
            {
              movieId: movie.id,
              title: movie.title,
              posterUrl: movie.posterUrl,
              rating: movie.rating,
              genre: movie.genre || "Okänd genre",
            },
          ];
        }
      });

      return result;
    } catch (err) {
      console.error("⚠️ Kunde inte toggla favorit:", err);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, toggleFavorite: handleToggleFavorite, loading }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
