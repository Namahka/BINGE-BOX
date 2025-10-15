import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserById } from "../api";

export default function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getUserById(id);
        setUser(data);
      } catch (err) {
        setError("Kunde inte ladda profil.");
      }
    }
    loadUser();
  }, [id]);

  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;
  if (!user) return <p className="text-gray-400 text-center mt-10">Laddar profil...</p>;

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center py-10">
      <img
        src={user.profileImageUrl || "/default-avatar.png"}
        alt={user.username}
        className="w-32 h-32 rounded-full object-cover border-4 border-yellow-400 mb-4"
      />
      <h2 className="text-3xl font-bold text-yellow-400">{user.username}</h2>
      <p className="text-gray-300 mt-4 max-w-md text-center">{user.bio || "Ingen bio än."}</p>
    </main>
  );
}
