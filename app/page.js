"use client";

import { useEffect, useState } from "react";
import { installSupabaseStorage } from "../lib/supabaseStorage";
import CarWashApp from "../components/CarWashApp";
import Login from "../components/Login";

export default function Page() {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [role, setRole] = useState("admin");

  useEffect(() => {
    installSupabaseStorage();
    setReady(true);
    if (typeof window !== "undefined") {
      setUnlocked(sessionStorage.getItem("lw-unlocked") === "1");
      setRole(sessionStorage.getItem("lw-role") || "admin");
    }
  }, []);

  if (!ready) return null;

  if (!unlocked) {
    return (
      <Login
        onUnlock={(r) => {
          setRole(r || "admin");
          setUnlocked(true);
        }}
      />
    );
  }

  return <CarWashApp role={role} />;
}
