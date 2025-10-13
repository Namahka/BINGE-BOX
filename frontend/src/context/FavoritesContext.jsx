import { createContext, useContext, useState, useEffect } from "react";


const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  // 🟢 Ladda från localStorage
  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  // 💾 Spara när något ändras
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // 🔁 Lägg till / ta bort film
  const toggleFavorite = (movie) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === movie.id);
      if (exists) {
        return prev.filter((f) => f.id !== movie.id);
      } else {
        return [...prev, movie];
      }
    });
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

// 🧩 Detta är exakt vad MovieCard använder:
export function useFavorites() {
  return useContext(FavoritesContext);
}
