"use client";

import { useState } from "react";
import { Lock, Droplets } from "lucide-react";

export default function Login({ onUnlock }) {
  const [clave, setClave] = useState("");
  const [error, setError] = useState(false);

  const entrar = (e) => {
    e.preventDefault();
    const claveAdmin = process.env.NEXT_PUBLIC_APP_PASSWORD_ADMIN || "";
    const claveLocal = process.env.NEXT_PUBLIC_APP_PASSWORD_LOCAL || "";

    if (claveAdmin && clave === claveAdmin) {
      sessionStorage.setItem("lw-unlocked", "1");
      sessionStorage.setItem("lw-role", "admin");
      onUnlock("admin");
    } else if (claveLocal && clave === claveLocal) {
      sessionStorage.setItem("lw-unlocked", "1");
      sessionStorage.setItem("lw-role", "local");
      onUnlock("local");
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <form onSubmit={entrar} className="bg-white rounded-xl p-6 w-full max-w-sm space-y-4 shadow-lg">
        <div className="flex items-center gap-2 text-teal-700">
          <Droplets size={22} />
          <h1 className="font-bold text-lg">Lubriwash D'Durand</h1>
        </div>
        <p className="text-sm text-slate-500">Ingresa la clave del negocio para ver el sistema.</p>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="password"
            autoFocus
            value={clave}
            onChange={(e) => {
              setClave(e.target.value);
              setError(false);
            }}
            className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Clave"
          />
        </div>
        {error && <p className="text-xs text-rose-600">Clave incorrecta.</p>}
        <button className="w-full bg-teal-600 text-white rounded-lg py-2.5 text-sm font-semibold">Entrar</button>
      </form>
    </div>
  );
}
