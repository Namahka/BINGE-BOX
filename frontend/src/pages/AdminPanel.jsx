import React from "react";
import { Film, Star, Users, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      {/* 🟡 Header */}
      <div className="max-w-5xl mx-auto text-center border-b border-yellow-500 pb-8 mb-10">
        <h1 className="text-5xl font-bold text-yellow-400 tracking-tight mb-2">
          ADMIN PANEL
        </h1>
        <p className="text-gray-300 text-lg">
          Welcome back, <span className="text-yellow-300">{user?.username}</span> 👑
        </p>
      </div>

      {/* 🧩 Admin Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* 🎬 Manage Featured Movies */}
        <div
          onClick={() => navigate("/admin/featured")}
          className="bg-slate-900 hover:bg-slate-800 cursor-pointer rounded-2xl border border-slate-700 hover:border-yellow-500 p-6 transition-all shadow-lg flex flex-col items-center justify-center text-center"
        >
          <Film className="w-10 h-10 text-yellow-400 mb-3" />
          <h2 className="text-xl font-semibold mb-2">Featured Movies</h2>
          <p className="text-sm text-gray-400">
            Choose which movies should appear on the homepage.
          </p>
        </div>

        {/* ⭐ Manage Ratings / Highlights */}
        <div
          onClick={() => navigate("/admin/highlights")}
          className="bg-slate-900 hover:bg-slate-800 cursor-pointer rounded-2xl border border-slate-700 hover:border-yellow-500 p-6 transition-all shadow-lg flex flex-col items-center justify-center text-center"
        >
          <Star className="w-10 h-10 text-yellow-400 mb-3" />
          <h2 className="text-xl font-semibold mb-2">Highlights</h2>
          <p className="text-sm text-gray-400">
            Update highlighted movies, series or events.
          </p>
        </div>

        {/* 👥 Manage Users */}
        <div
          onClick={() => navigate("/admin/users")}
          className="bg-slate-900 hover:bg-slate-800 cursor-pointer rounded-2xl border border-slate-700 hover:border-yellow-500 p-6 transition-all shadow-lg flex flex-col items-center justify-center text-center"
        >
          <Users className="w-10 h-10 text-yellow-400 mb-3" />
          <h2 className="text-xl font-semibold mb-2">Users</h2>
          <p className="text-sm text-gray-400">
            View or manage member accounts and privileges.
          </p>
        </div>

        {/* ⚙️ Settings */}
        <div
          onClick={() => navigate("/admin/settings")}
          className="bg-slate-900 hover:bg-slate-800 cursor-pointer rounded-2xl border border-slate-700 hover:border-yellow-500 p-6 transition-all shadow-lg flex flex-col items-center justify-center text-center"
        >
          <Settings className="w-10 h-10 text-yellow-400 mb-3" />
          <h2 className="text-xl font-semibold mb-2">System Settings</h2>
          <p className="text-sm text-gray-400">
            Manage global app settings and configurations.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-sm text-gray-500">
        <p>
          © {new Date().getFullYear()} Binge Box Admin • Restricted Access
        </p>
      </footer>
    </main>
  );
}
