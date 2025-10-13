// src/api.js

const API_URL = "https://localhost:7299"; // ändra port vid behov

// ===============================
// 🎬 Hämtar populära filmer
// ===============================
export async function getPopularMovies(page = 1) {
  try {
    const res = await fetch(`${API_URL}/api/tmdb/popular?page=${page}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) throw new Error(`Fel ${res.status}: Kunde inte hämta filmer`);
    return await res.json();
  } catch (err) {
    console.error("⚠️ Fel vid hämtning av populära filmer:", err);
    return [];
  }
}

// ===============================
// 🔍 Söker filmer/personer/serier
// ===============================
export async function searchMovies(query, category = "all", page = 1) {
  if (!query || !query.trim()) return [];

  try {
    const encoded = encodeURIComponent(query.trim());
    const res = await fetch(
      `${API_URL}/api/tmdb/search/${category}?query=${encoded}&page=${page}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      }
    );

    if (!res.ok) throw new Error(`Fel ${res.status}: Kunde inte söka`);
    return await res.json();
  } catch (err) {
    console.error("⚠️ Fel vid sökning:", err);
    return [];
  }
}

// ===============================
// 🎥 Hämtar detaljer om film
// ===============================
export async function getMovieDetails(id) {
  try {
    const res = await fetch(`${API_URL}/api/tmdb/movie/${id}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) throw new Error(`Fel ${res.status}: Kunde inte hämta filmdata`);
    return await res.json();
  } catch (err) {
    console.error("⚠️ Fel vid hämtning av filmdata:", err);
    return null;
  }
}

// ===============================
// 👤 AUTH – LOGIN & PROFIL
// ===============================
export async function loginUser(identifier, password) {
  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }), // 👈 ändrat!
    });

    if (!res.ok) {
      console.error(`❌ Login-fel ${res.status}`);
      throw new Error("Felaktigt användarnamn eller lösenord");
    }

    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    return data;
  } catch (err) {
    console.error("⚠️ Fel vid inloggning:", err);
    throw err;
  }
}


// 🧠 Hämta profil (kräver JWT-token)
export async function getProfile() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Ingen token sparad – logga in igen.");

  try {
    const res = await fetch(`${API_URL}/api/User/profile`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Kunde inte hämta profilinformation");
    return await res.json();
  } catch (err) {
    console.error("⚠️ Fel vid hämtning av profil:", err);
    throw err;
  }
}
// 🟢 Registrera ny användare
export async function registerUser(userData) {
  try {
    const res = await fetch("https://localhost:7299/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Misslyckades att skapa konto");
    }

    return await res.json();
  } catch (err) {
    console.error("⚠️ Fel vid registrering:", err);
    throw err;
  }
}
