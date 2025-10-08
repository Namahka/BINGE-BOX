export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur border-b border-slate-800">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        {/* Left: Logo */}
        <a href="/" className="text-xl font-bold tracking-tight">
          <span className="text-indigo-400">Binge</span> Box
        </a>

        {/* Center: Nav links (kan kopplas senare) */}
        <nav className="hidden md:flex gap-6 text-sm text-slate-300">
          <a className="hover:text-white" href="#">Start</a>
          <a className="hover:text-white" href="#">Library</a>
          <a className="hover:text-white" href="#">Toplist</a>
          <a className="hover:text-white" href="#">Search</a>
        </nav>

        {/* Right: Auth-knapp (placeholder) */}
        <button className="text-sm px-3 py-1.5 rounded-md border border-slate-700 hover:bg-slate-800">
          Sign in
        </button>
      </div>
    </header>
  );
}
