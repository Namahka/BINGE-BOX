import { useEffect, useState } from "react";
import { getProfile } from "../api";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setUser(data);
      } catch (err) {
  console.error("Profilfel:", err);
  setError("Du måste vara inloggad");
}

    };
    fetchProfile();
  }, []);

  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!user) return <p className="text-center mt-10 text-gray-400">Laddar...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-xl shadow-md w-[320px] text-center">
        <h1 className="text-2xl font-bold mb-2">{user.username}</h1>
        <p className="text-gray-400 mb-2">{user.email}</p>
        {user.profileImageUrl && (
          <img
            src={user.profileImageUrl}
            alt="Profilbild"
            className="w-24 h-24 mx-auto rounded-full mt-4"
          />
        )}
      </div>
    </div>
  );
}
