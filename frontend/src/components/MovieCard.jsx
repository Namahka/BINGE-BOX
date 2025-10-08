export default function MovieCard({ m }) {
  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-slate-700 transition">
      {m.posterUrl
        ? <img src={m.posterUrl} alt={m.title} className="w-full aspect-[2/3] object-cover" />
        : <div className="w-full aspect-[2/3] bg-slate-800" />}
      <div className="p-3">
        <h3 className="text-sm font-semibold truncate">{m.title}</h3>
        <div className="text-xs text-slate-400 flex gap-3 mt-1">
          <span>{m.releaseDate ?? "—"}</span>
          <span>⭐ {m.rating ?? "—"}</span>
        </div>
      </div>
    </div>
  );
}
