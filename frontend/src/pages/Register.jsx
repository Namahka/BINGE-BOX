// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await registerUser({
        username,
        email,
        password,
        profileImageUrl,
      });

      setSuccess("Konto skapat! Du kan nu logga in.");
      // Vänta 2 sekunder och skicka till login
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Något gick fel vid registrering.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-xl shadow-md w-[320px]"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Skapa konto</h1>

        <input
          className="w-full mb-3 p-2 rounded bg-gray-700 border border-gray-600"
          placeholder="Användarnamn"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          className="w-full mb-3 p-2 rounded bg-gray-700 border border-gray-600"
          placeholder="E-post"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full mb-3 p-2 rounded bg-gray-700 border border-gray-600"
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="text"
          className="w-full mb-3 p-2 rounded bg-gray-700 border border-gray-600"
          placeholder="Profilbild (valfritt URL)"
          value={profileImageUrl}
          onChange={(e) => setProfileImageUrl(e.target.value)}
        />

        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-400 text-sm mb-2">{success}</p>}

        <button
          type="submit"
          className="w-full bg-yellow-500 hover:bg-yellow-600 py-2 rounded font-semibold text-gray-900 transition"
        >
          Registrera
        </button>
      </form>
    </div>
  );
}
