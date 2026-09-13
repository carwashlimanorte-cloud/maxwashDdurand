-- Ejecuta esto en Supabase: Panel del proyecto > SQL Editor > New query > pega y dale "Run"
-- Crea una tabla dedicada para clientes, donde cada cliente es una fila independiente
-- (en vez de guardar los 500 clientes juntos en un solo bloque, que era la causa
-- de que el registro se cortara al llegar a cierta cantidad).

create table if not exists clientes (
  id text primary key,
  nombre text not null,
  telefono text,
  placa text,
  vehiculo text,
  foto text,
  fecha timestamptz not null default now()
);

alter table clientes enable row level security;

create policy "Permitir todo con la anon key"
on clientes
for all
using (true)
with check (true);
