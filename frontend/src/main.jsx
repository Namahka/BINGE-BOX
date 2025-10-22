import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { FavoritesProvider } from "./context/FavoritesContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

// ✅ Viktigt: FavoritesProvider ytterst så den inte mountas om vid authChange
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <FavoritesProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </FavoritesProvider>
  </React.StrictMode>
);
