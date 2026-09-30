# MaxWash D'Durand — App en la nube

App de control para lavado de autos, tienda y cambio de aceite del negocio.
Guardas todo en una base de datos real (Supabase) y la ves desde cualquier
dispositivo con tu propio link en internet.

Esta guía es para publicarla desde cero, en orden, sin necesidad de saber programar.

---

## Paso 1 — Crear la base de datos (Supabase)

> RECOMENDADO: crea la base en una **organización nueva** de Supabase (no reuses
> la anterior que se quedó sin cuota gratis). Cada organización tiene su propio
> cupo gratuito, así arrancas con 5 GB de transferencia nuevos.

1. Entra a https://supabase.com y crea una cuenta gratuita (o inicia sesión).
2. Crea una **organización nueva**: clic en tu avatar (arriba a la derecha) →
   **New organization** → ponle un nombre (ej. "MaxWash Local").
   - OJO: el límite de proyectos gratis se cuenta por cuenta. Si ya tienes un
     proyecto que NO usas, bórralo antes para no llegar al tope.
3. Crea el proyecto: botón **New project**, elige la organización nueva, dale un
   nombre (ej. "maxwash") y una contraseña de base de datos segura (guárdala).
4. Espera a que se cree (1-2 minutos).

### Crear las tablas (SQL)

5. Abre **SQL Editor** (menú lateral) → **New query**.
6. Abre el archivo `sql/schema.sql` de esta carpeta, copia TODO el contenido,
   pégalo en el editor y dale **Run**. Repite lo mismo con:
   - `sql/clientes.sql`
   - `sql/ventas-tickets.sql`
   (Siempre en ese orden: schema, clientes, ventas-tickets.)

### Sacar los datos de conexión

7. Ve a **Project Settings → API**. Ahí verás dos datos que necesitas más
   adelante:
   - **Project URL** → ejemplo: `https://xxxxxxx.supabase.co`
   - **anon public key** → una cadena larga que empieza con `eyJ...`

---

## Paso 2 — Subir el código a GitHub

1. Entra a https://github.com y, si no tienes, crea una cuenta.
2. Crea un repositorio nuevo (botón **New repository**; puedes dejarlo Privado).
3. Sube la carpeta completa de esta app con **Add file → Upload files**:
   - Importante: usa **Upload files** arrastrando los archivos. NO copies y
     pegues el contenido del archivo `components/CarWashApp.jsx` (es enorme y
     el copiado se corta, causando errores al publicar).
   - Los archivos deben subirse tal como están en su carpeta normal de Next.js
     (`app/`, `components/`, `lib/`, `sql/`), sin una carpeta contenedora extra.
4. Dale **Commit changes**.

---

## Paso 3 — Publicar en internet (Vercel, gratis)

1. Entra a https://vercel.com y crea cuenta (entra con tu cuenta de GitHub para
   que sea más fácil).
2. Botón **Add New… → Project** y elige el repositorio que subiste.
3. Antes de darle **Deploy**, abre **Environment Variables** y agrega estas 4
   variables (los nombres deben quedar exactos):
   - `NEXT_PUBLIC_SUPABASE_URL` → el Project URL del paso 1
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → el anon key del paso 1
   - `NEXT_PUBLIC_APP_PASSWORD_ADMIN` → la clave del administrador (dueño)
   - `NEXT_PUBLIC_APP_PASSWORD_LOCAL` → la clave del personal del local
   - Marca las 3 casillas **Environment** (Production, Preview y Development)
     en cada una.
4. Dale **Deploy**. En 1-2 minutos obtienes un link tipo `maxwash.vercel.app`:
   ya es tu app en internet.

> Si al publicar aparece un error, abre ese despliegue → **Build Logs** para ver
> el mensaje real (el resumen corto no suele servir).

---

## Paso 4 — (Opcional) Poner tu propio dominio

Compra un dominio (ej. `maxwash.pe`) y en Vercel: **Project → Settings →
Domains** → agrégalo y sigue las instrucciones de DNS. No es necesario para
usar la app.

---

## Cómo lo usas día a día

- Abres el link desde el celular, laptop o donde sea, pones la clave
  (administrador o personal), y ves tu resumen de ingresos, cuentas abiertas,
  gastos y stock, siempre actualizado.
- Todo lo que registres en cualquier dispositivo se guarda en la misma base:
  todos ven lo mismo.
- La app se auto-actualiza cada minuto entre dispositivos.

### Buscar el vehículo por placa (SUNARP)

Al registrar un cliente, junto al campo "Placa" hay un botón **SUNARP**. Al
tocarlo, se abre en otra pestaña la consulta vehicular oficial y gratuita de
SUNARP con la placa ya copiada en el mensaje. Ahí escribes la placa y el código
de verificación (captcha), ves la **Marca** y el **Modelo**, y los escribes en
el cliente. No cuesta nada y los datos salen de la fuente oficial.

> ¿Por qué no se llena solo? La consulta de SUNARP tiene una imagen de
> verificación (captcha) a propósito para evitar programas automáticos, igual
> que todas las consultas oficiales del Perú. Por eso el paso se hace a mano.
> Si más adelante quieres que se llene solo, existe la opción de agregar un
> servicio de pago que lo automatiza (se explicaría en su momento).

---

## Roles

- **Administrador** (clave admin): control total — inventario, catálogo
  (tipos de lavado, extras, lavadores), precios e historial.
- **Personal del local** (clave local): puede vender, cobrar, abrir cuentas y
  registrar gastos, pero no agregar ni modificar stock ni catálogo.

---

## Seguridad — léelo antes de usarla

Las claves de acceso son una protección simple para que no cualquiera con el
link vea tus datos, pero no son de nivel bancario. Si más adelante quieres algo
más sólido (usuario y contraseña individuales por trabajador), se puede
agregar autenticación real de Supabase Auth.

---

## Notas / solución de problemas

- **Cuota gratis de Supabase**: el plan Free tiene límite mensual de
  transferencia (egress). Si un mes se agota, Supabase bloquea la base hasta el
  reinicio del ciclo o se paga el excedente. La app ya intenta gastar lo menos
  posible (revisiones cada 60 segundos, pausa en segundo plano, no recarga fotos
  si nada cambió), y un cron diario de Vercel (`vercel.json`) mantiene el
  proyecto despierto. Aun así, los meses muy movidos pueden llegar al límite.
- **Cambiar una variable en Vercel que no responde**: bórrala y vuelve a
  crearla con el botón **Add**, en vez de intentar editarla.
- **Copias de seguridad**: dentro de la app, en la pestaña **Historial**, hay un
  botón **Descargar respaldo completo** que baja un archivo JSON con todo el
  negocio. Descárgalo de vez en cuando y guárdalo aparte.

## Estructura de la app (para referencia)

- `app/` — páginas de Next.js (login y layout).
- `components/CarWashApp.jsx` — toda la interfaz: resumen, cuentas, tienda,
  cambio de aceite, gastos, cierre de caja, historial, clientes y catálogo.
- `lib/` — cliente de Supabase y accesos al almacenamiento.
- `sql/` — los 3 archivos SQL que se ejecutan en Supabase.