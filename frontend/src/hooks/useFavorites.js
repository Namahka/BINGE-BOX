import { useContext } from "react";
import { FavoritesContext } from "../context/FavoritesContext";

// Hook som ger tillgång till alla favorit-funktioner från context
export function useFavorites() {
  return useContext(FavoritesContext);
}
