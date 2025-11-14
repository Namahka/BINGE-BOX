import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

      });

      setSuccess("Konto skapat! Du kan nu logga in.");
      
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Något gick fel vid registrering.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-[320px]"
      >
        <h1 className="text-2xl font-bold mb-4 text-center text-black">Create account</h1>

        <input
          className="w-full mb-3 p-2 rounded bg-black border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          className="w-full mb-3 p-2 rounded bg-black border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className= "w-full mb-3 p-2 rounded bg-black border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-400 text-sm mb-2">{success}</p>}

        <button
          type="submit"
          className="w-full bg-yellow-500 hover:bg-yellow-600 py-2 rounded font-semibold text-gray-900 transition"
        >
          Create account
        </button>
      </form>
    </div>
  );
}
