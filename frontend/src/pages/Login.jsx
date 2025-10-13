import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api";

export default function Login() {
  const [identifier, setIdentifier] = useState(""); // 👈 kan vara email ELLER username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await loginUser(identifier, password);
      localStorage.setItem("token", data.access_token);
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-xl shadow-md w-[320px]"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Logga in</h1>

        <input
          className="w-full mb-3 p-2 rounded bg-gray-700 border border-gray-600"
          placeholder="E-post eller användarnamn"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <input
          type="password"
          className="w-full mb-3 p-2 rounded bg-gray-700 border border-gray-600"
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold"
        >
          Logga in
        </button>
      </form>
    </div>
  );
}
