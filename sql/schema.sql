-- Ejecuta esto en Supabase: Panel del proyecto > SQL Editor > New query > pega y dale "Run"

create table if not exists kv_store (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Habilita RLS pero permite todo (la app queda protegida por la clave de acceso, no por RLS).
-- Si más adelante quieres más seguridad, aquí se puede restringir por usuario autenticado.
alter table kv_store enable row level security;

create policy "Permitir todo con la anon key"
on kv_store
for all
using (true)
with check (true);
