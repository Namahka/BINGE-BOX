// src/api.js

const API_URL = "https://localhost:7299"; // 🔧 Ändra port om backend körs på annan port

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

export async function searchMovies(query, category = "all", page = 1) {
  if (!query || !query.trim()) return [];

  try {
    const encoded = encodeURIComponent(query.trim());
    const url = `${API_URL}/api/tmdb/search/${category}?query=${encoded}&page=${page}`;
    console.log("📡 API-anrop:", url);

    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) throw new Error(`Fel ${res.status}: Kunde inte söka`);

    const data = await res.json();
    console.log("📦 RAW DATA FRÅN BACKEND:", data);

    // Eftersom backend returnerar en ren array
    const results = Array.isArray(data) ? data : data.results || [];

    // Filtrera bort allt utan bild eller text
    const cleaned = results.filter(
      (item) =>
        (item.posterUrl || item.poster_path || item.profile_path) &&
        (item.overview || item.title)
    );

    // Sortera populärast först
    const sorted = cleaned.sort(
      (a, b) => (b.popularity || b.rating || 0) - (a.popularity || a.rating || 0)
    );

    console.log(`✅ Returnerar ${sorted.length} resultat`);
    return sorted;
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
      body: JSON.stringify({ identifier, password }),
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

// ===============================
// ⭐ FAVORITER – Lägg till / ta bort per användare
// ===============================
export async function toggleFavorite(movie) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Ingen token sparad");

  const res = await fetch(`${API_URL}/api/favorites/toggle`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      movieId: movie.id,
      title: movie.title,
      posterUrl: movie.posterUrl,
      rating: movie.rating,
      genre: movie.genre || "Okänd genre",
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("❌ API-fel:", errText);
    throw new Error("Misslyckades uppdatera favoriter");
  }

  return await res.json();
}

// ===============================
// 💾 Hämtar sparade favoriter
// ===============================
export async function getFavorites() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Ingen token sparad");

  const res = await fetch(`${API_URL}/api/favorites`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) throw new Error("Kunde inte hämta favoriter");
  return await res.json();
}

// ===============================
// 🧠 Hämta profil (kräver JWT-token)
// ===============================
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

// ===============================
// ✏️ Uppdatera profil (bio, profilbild, etc.)
// ===============================
export async function updateProfile(data) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Ingen token sparad");

  try {
    const res = await fetch(`${API_URL}/api/User/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Kunde inte uppdatera profil");
    return await res.json();
  } catch (err) {
    console.error("⚠️ Fel vid uppdatering av profil:", err);
    throw err;
  }
}

// ===============================
// 🟢 Registrera ny användare
// ===============================
export async function registerUser(userData) {
  try {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
