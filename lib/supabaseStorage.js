import { supabase } from "./supabaseClient";

const TABLE = "kv_store";

async function get(key) {
  if (!supabase) throw new Error("Supabase no configurado");
  const { data, error } = await supabase
    .from(TABLE)
    .select("key, value")
    .eq("key", key)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { key: data.key, value: JSON.stringify(data.value), shared: false };
}

async function set(key, value) {
  if (!supabase) throw new Error("Supabase no configurado");
  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  const { error } = await supabase
    .from(TABLE)
    .upsert({ key, value: parsed, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw error;
  return { key, value, shared: false };
}

async function del(key) {
  if (!supabase) throw new Error("Supabase no configurado");
  const { error } = await supabase.from(TABLE).delete().eq("key", key);
  if (error) throw error;
  return { key, deleted: true, shared: false };
}

async function list(prefix) {
  if (!supabase) throw new Error("Supabase no configurado");
  let query = supabase.from(TABLE).select("key");
  if (prefix) query = query.like("key", `${prefix}%`);
  const { data, error } = await query;
  if (error) throw error;
  return { keys: (data || []).map((r) => r.key), prefix, shared: false };
}

// Instala window.storage con la misma forma que usa el componente CarWashApp,
// pero guardando todo en Supabase (nube) en vez de en la memoria de la sesión de Claude.
export function installSupabaseStorage() {
  if (typeof window === "undefined") return;
  window.storage = { get, set, delete: del, list };
}
