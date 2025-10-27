import React from "react";
import { Film } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      {/* 🟡 Header */}
      <div className="max-w-3xl mx-auto text-center border-b border-yellow-500 pb-8 mb-10">
        <h1 className="text-5xl font-bold text-yellow-400 tracking-tight mb-2">
          ADMIN PANEL
        </h1>
        <p className="text-gray-300 text-lg">
          Welcome back, <span className="text-yellow-300">{user?.username}</span> 
        </p>
      </div>

      {/* 🎬 Only Movie of the Week */}
      <div
        onClick={() => navigate("/admin/featured")}
        className="max-w-md mx-auto bg-black border cursor-pointer rounded-2xl border border-slate-700 hover:border-yellow-500 p-8 transition-all shadow-lg flex flex-col items-center justify-center text-center"
      >
        <Film className="w-12 h-12 text-yellow-400 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Movie of the Week</h2>
        <p className="text-sm text-gray-400">
          Choose and manage the weekly featured movie.
        </p>
      </div>

      <footer className="mt-16 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Binge Box Admin • Restricted Access</p>
      </footer>
    </main>
  );
}
