// ===============================
// 🌐 API – BINGE BOX
// ===============================

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

// ===============================
// 🔍 Söker filmer, serier eller personer
// ===============================
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

    const results = Array.isArray(data) ? data : data.results || [];
    const cleaned = results.filter(
      (item) =>
        (item.posterUrl || item.poster_path || item.profile_path) &&
        (item.overview || item.title)
    );

  // 🧹 Normalisera mediaType från TMDb:s "media_type"
const normalized = cleaned.map((item) => ({
  ...item,
  mediaType: item.mediaType || item.media_type || "movie",
}));

// 🔝 Sortera efter popularitet
const sorted = normalized.sort(
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

    if (!res.ok) throw new Error("Felaktigt användarnamn eller lösenord");
    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    return data;
  } catch (err) {
    console.error("⚠️ Fel vid inloggning:", err);
    throw err;
  }
}

// ===============================
// 🧾 Registrera ny användare
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

// ===============================
// 💾 Hämta inloggad profil
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
// ✏️ Uppdatera profil
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
// 👥 Sök användare
// ===============================
export async function searchUsers(query) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Ingen token sparad – logga in igen.");

  try {
    const encoded = encodeURIComponent(query.trim());
    const res = await fetch(`${API_URL}/api/User/search?query=${encoded}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error(`Fel ${res.status}: Kunde inte söka användare`);
    const data = await res.json();

    const results = Array.isArray(data) ? data : [];
    return results.sort((a, b) => a.username.localeCompare(b.username));
  } catch (err) {
    console.error("⚠️ Fel vid användarsökning:", err);
    return [];
  }
}

// ===============================
// 👤 Hämta användare via ID
// ===============================
export async function getUserById(id) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Ingen token sparad – logga in igen.");

  const res = await fetch(`${API_URL}/api/User/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error(`Kunde inte hämta användare ${id}`);
  return await res.json();
}

// ===============================
// 🤝 FOLLOWERSYSTEM
// ===============================
export async function toggleFollow(userId) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Ingen token sparad – logga in igen.");

  const res = await fetch(`${API_URL}/api/followers/toggle/${userId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) throw new Error("Kunde inte följa/avfölja användare");
  return await res.json();
}

export async function isFollowing(userId) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Ingen token sparad – logga in igen.");

  const res = await fetch(`${API_URL}/api/followers/isFollowing/${userId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return false;
  return await res.json();
}

// ===============================
// 💾 FAVORITSYSTEM – BINGE BOX
// ===============================
const FAVORITES_KEY = "guestFavorites";

// 🟢 Hämta favoriter (inloggad eller gäst)
export async function getFavorites() {
  const token = localStorage.getItem("token");

  // Gästläge — hämta från localStorage
  if (!token) {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
  }

  // Inloggad användare → backend
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

// 🟣 Hämta favoriter för specifik användare (profilsidor)
export async function getUserFavorites(userId) {
  if (!userId) throw new Error("userId saknas i getUserFavorites");

  const res = await fetch(`${API_URL}/api/favorites/user/${userId}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const msg = await res.text();
    console.error("❌ Kunde inte hämta användarens favoriter:", msg);
    throw new Error("Misslyckades hämta användarens favoriter");
  }

  return await res.json();
}

// ⭐ Lägg till / ta bort favorit (toggle)
export async function toggleFavorite(movie) {
  const token = localStorage.getItem("token");

  // ✅ Normalisera MovieId
  const movieId = Number(
    movie.movieId || movie.id || movie.tmdbId || movie.tmdb_id
  );

  if (!movieId) {
    console.error("❌ Ingen giltig movieId hittades:", movie);
    throw new Error("Ogiltigt film-ID");
  }

  // 🔹 Gästläge — lagra lokalt
  if (!token) {
    const FAVORITES_KEY = "guestFavorites";
    const localFavs = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    const exists = localFavs.some((f) => f.movieId === movieId);

    const updated = exists
      ? localFavs.filter((f) => f.movieId !== movieId)
      : [
          ...localFavs,
          {
            movieId,
            title: movie.title,
            posterUrl:
              movie.posterUrl ||
              (movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : ""),
            genre: movie.genre || "Okänd genre",
            rating: movie.rating || movie.vote_average || 0,
            overview: movie.overview || "",
          },
        ];

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return { favorite: !exists };
  }

  // 🔸 Inloggad användare → backend toggle
  const res = await fetch(`${API_URL}/api/favorites/toggle`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      movieId,
      title: movie.title,
      posterUrl:
        movie.posterUrl ||
        (movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : ""),
      genre: movie.genre || "Okänd genre",
      rating: movie.rating || movie.vote_average || 0,
      overview: movie.overview || "",
    }),
  });

  if (!res.ok) {
    const msg = await res.text();
    console.error("❌ API-fel:", msg);
    throw new Error("Misslyckades uppdatera favoriter");
  }

  const result = await res.json();
  return result;
}


// ===============================
// 👥 FÖLJARE & FÖLJER (med profilbildfix)
// ===============================
export async function getFollowers(userId) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Ingen token sparad – logga in igen.");

  const res = await fetch(`${API_URL}/api/followers/followers/${userId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Kunde inte hämta följare");
  const data = await res.json();

  return data.map((f) => ({
    ...f,
    profileImageUrl: f.profileImageUrl
      ? `${API_URL}${f.profileImageUrl.startsWith("/") ? f.profileImageUrl : "/" + f.profileImageUrl}`
      : "/default-avatar.png",
  }));
}

export async function getFollowing(userId) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Ingen token sparad – logga in igen.");

  const res = await fetch(`${API_URL}/api/followers/following/${userId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Kunde inte hämta följande");
  const data = await res.json();

  return data.map((f) => ({
    ...f,
    profileImageUrl: f.profileImageUrl
      ? `${API_URL}${f.profileImageUrl.startsWith("/") ? f.profileImageUrl : "/" + f.profileImageUrl}`
      : "/default-avatar.png",
  }));
  
}
export async function getMovieOfTheWeek() {
  const res = await fetch("https://localhost:7299/api/MovieOfTheWeek");
  if (!res.ok) return null;
  return await res.json();
}

export async function setMovieOfTheWeek(movie) {
  const token = localStorage.getItem("token");
  const res = await fetch("https://localhost:7299/api/MovieOfTheWeek/set", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(movie),
  });
  if (!res.ok) throw new Error("Misslyckades sätta veckans film");
  return await res.json();
}



