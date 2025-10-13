import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function PersonDetails() {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullBio, setShowFullBio] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`https://localhost:7299/api/tmdb/person/${id}`);
        if (!res.ok) throw new Error("Kunde inte hämta persondata");
        const data = await res.json();
        setPerson(data);
      } catch (err) {
        console.error("❌ Fel vid hämtning av persondata:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading)
    return <p className="text-center text-slate-400 mt-10">Laddar...</p>;
  if (error)
    return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!person) return null;

  const shortBio =
    person.biography?.length > 400
      ? person.biography.slice(0, 400) + "..."
      : person.biography;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <button
  onClick={() => {
    navigate(-1);
    // triggar sökrutan att rensas i App.jsx
    window.dispatchEvent(new PopStateEvent("popstate"));
  }}
  className="mb-6 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded"
>
  ← Tillbaka
</button>


      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10">
        {person.profile ? (
          <img
            src={person.profile}
            alt={person.name}
            className="w-[280px] h-[380px] object-cover rounded-2xl shadow-lg mx-auto md:mx-0"
          />
        ) : (
          <div className="w-[280px] h-[380px] bg-slate-800 flex items-center justify-center rounded-2xl shadow-lg text-slate-500 mx-auto md:mx-0">
            Ingen bild
          </div>
        )}

        <div className="flex-1">
          <h1 className="text-4xl font-extrabold text-yellow-400 mb-4">
            {person.name}
          </h1>

          <p className="text-gray-300 leading-relaxed">
            {showFullBio ? person.biography : shortBio || "Ingen biografi tillgänglig."}
          </p>

          {person.biography?.length > 400 && (
            <button
              onClick={() => setShowFullBio(!showFullBio)}
              className="mt-3 text-yellow-400 hover:underline"
            >
              {showFullBio ? "Visa mindre ↑" : "Läs mer ↓"}
            </button>
          )}
        </div>
      </div>

      {person.knownFor?.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold text-yellow-400 mt-12 mb-4 text-center md:text-left">
            Känd för
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {person.knownFor.map((m, i) => (
              <div
                key={i}
                onClick={() =>
                  navigate(`/${m.mediaType || "movie"}/${m.id}`, {
                    state: { mediaType: m.mediaType || "movie" },
                  })
                }
                className="bg-slate-800 rounded-xl overflow-hidden hover:scale-105 hover:shadow-lg transition-transform duration-200 cursor-pointer"
              >
                {m.posterUrl || m.poster ? (
                  <img
                    src={m.posterUrl || m.poster}
                    alt={m.title}
                    className="w-full h-[250px] object-cover"
                  />
                ) : (
                  <div className="h-[250px] bg-slate-700 flex items-center justify-center text-slate-500">
                    Ingen bild
                  </div>
                )}
                <div className="p-2 text-center">
                  <p className="font-semibold truncate text-white">{m.title}</p>
                  {m.character && (
                    <p className="text-sm text-gray-400 truncate">
                      {m.character}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
