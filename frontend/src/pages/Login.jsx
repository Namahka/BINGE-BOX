import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; // ✅ rätt path
import { loginUser, getProfile } from "../api";


export default function Login() {
  const [identifier, setIdentifier] = useState(""); // e-post eller användarnamn
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // från AuthContext

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 🔐 1. Logga in → få JWT-token
      const data = await loginUser(identifier, password);
      const token = data.access_token;

      // 👤 2. Hämta användarprofil direkt efter inloggning
      const profile = await getProfile();

      // 🧠 3. Uppdatera AuthContext så appen vet att du är inloggad
      login(token, profile);

      // 🚀 4. Navigera till profilsidan
      navigate("/profile");
    } catch (err) {
      console.error("Login error:", err);
      setError("Incorrect username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-[320px]"
      >
        <h1 className="text-2xl font-bold mb-4 text-center text-black">
          Log in
        </h1>

        <input
          className="w-full mb-3 p-2 rounded bg-black border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="E-mail or username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          autoComplete="username"
          required
        />

        <input
          type="password"
          className="w-full mb-3 p-2 rounded bg-black border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full font-semibold py-2 rounded transition ${
            loading
              ? "bg-gray-400 text-black cursor-not-allowed"
              : "bg-yellow-500 hover:bg-yellow-400 text-black"
          }`}
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        <p className="text-sm text-gray-700 text-center mt-4">
      No account?{" "}
          <a
            href="/register"
            className="text-yellow-600 hover:underline font-semibold"
          >
           Create account
          </a>
        </p>
      </form>
    </div>
  );
}
