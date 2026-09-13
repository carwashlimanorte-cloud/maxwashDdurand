import { createClient } from "@supabase/supabase-js";

// Fuerza que este endpoint se ejecute SIEMPRE en cada llamada del cron, en vez
// de quedar "pre-calculado" en el build y contestar con una respuesta vieja.
export const dynamic = "force-dynamic";

// Este endpoint no lo usa ninguna persona: Vercel lo llama solo, automáticamente,
// según el horario definido en vercel.json. Su único propósito es hacer una
// consulta mínima a Supabase para que el proyecto nunca quede "inactivo" y
// el plan gratuito no lo pause por falta de uso (ej. si el negocio cierra
// varias semanas seguidas).
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || null;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  try {
    if (!url || !anonKey) {
      return Response.json({ ok: false, error: "Faltan variables de Supabase", url }, { status: 500 });
    }
    const supabase = createClient(url, anonKey);
    const { error } = await supabase.from("kv_store").select("key").limit(1);
    if (error) {
      return Response.json(
        { ok: false, url, message: error.message, details: error.details, hint: error.hint, code: error.code },
        { status: 500 }
      );
    }
    return Response.json({ ok: true, url, checkedAt: new Date().toISOString() });
  } catch (err) {
    return Response.json({ ok: false, url, message: err?.message || String(err) }, { status: 500 });
  }
}
