import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

import { loginUser, getProfile } from "../api";

export default function Login() {
  const [identifier, setIdentifier] = useState(""); // 👈 e-post eller användarnamn
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // 🟢 kommer från AuthContext

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 🔐 1. Logga in och få JWT-token
      const data = await loginUser(identifier, password);

      // 👤 2. Hämta användarprofilen direkt efter inloggning
      const profile = await getProfile();

      // 🧠 3. Uppdatera AuthContext (så UserMenu märker direkt)
      login(data.access_token, profile);

      // 🚀 4. Navigera till profilsidan
      navigate("/profile");
    } catch (err) {
      console.error("Login error:", err);
      setError("Felaktigt användarnamn eller lösenord");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-[320px]"
      >
        <h1 className="text-2xl font-bold mb-4 text-center text-black">
          Logga in
        </h1>

        <input
          className="w-full mb-3 p-2 rounded bg-black border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="E-post eller användarnamn"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-3 p-2 rounded bg-black border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <button
          type="submit"
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 rounded transition"
        >
          Logga in
        </button>
      </form>
    </div>
  );
}
