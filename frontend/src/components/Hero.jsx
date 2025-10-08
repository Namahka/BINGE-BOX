export default function Hero() {
  return (
    <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Discover what to <span className="text-indigo-400">binge</span> next
        </h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Browse popular movies fetched live from TMDb. Save to your library and build your toplists.
        </p>
      </div>
    </section>
  );
}
