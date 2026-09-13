-- Ejecuta esto en Supabase: Panel del proyecto > SQL Editor > New query > pega y dale "Run"
-- Igual que hicimos con "clientes": cada venta y cada cuenta se guarda en su
-- propia fila, en vez de un solo bloque gigante que se vuelve más pesado cada
-- día y termina fallando al llegar a cierto tamaño.

create table if not exists ventas (
  id text primary key,
  "productoId" text,
  "nombreProducto" text,
  cantidad numeric,
  "precioUnitario" numeric,
  total numeric,
  "formaPago" text,
  pagos jsonb,
  fecha timestamptz not null default now()
);

alter table ventas enable row level security;
create policy "Permitir todo con la anon key" on ventas for all using (true) with check (true);

create table if not exists tickets (
  id text primary key,
  "clienteId" text,
  "tipoId" text,
  "extraIds" jsonb,
  "lavadorId" text,
  propina numeric,
  "formaPago" text,
  pagos jsonb,
  estado text,
  fecha timestamptz not null default now(),
  "fechaCobro" timestamptz,
  subtotal numeric,
  total numeric,
  gratis boolean,
  productos jsonb,
  repuestos jsonb
);

alter table tickets enable row level security;
create policy "Permitir todo con la anon key" on tickets for all using (true) with check (true);
