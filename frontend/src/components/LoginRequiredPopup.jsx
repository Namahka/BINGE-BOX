import React from "react";
import { Link } from "react-router-dom";

export default function LoginRequiredPopup({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#111] border border-yellow-400 rounded-2xl p-8 text-center shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-bold text-yellow-400 mb-3">
          Logga in krävs
        </h2>
        <p className="text-gray-300 mb-6">
          Du måste vara inloggad för att kunna lägga till favoriter.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/login"
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg"
            onClick={onClose}
          >
            Logga in
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-semibold rounded-lg"
            onClick={onClose}
          >
           Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
