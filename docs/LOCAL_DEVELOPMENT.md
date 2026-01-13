# Desarrollo Local con Netlify Functions

Esta guía explica cómo ejecutar el proyecto localmente con las funciones de Netlify funcionando.

## Requisitos Previos

1. **Netlify CLI**: Se instalará automáticamente con `npm install`
2. **Variables de entorno**: Necesitas crear un archivo `.env` en la raíz del proyecto

## Configuración Inicial

### 1. Instalar dependencias

```bash
npm install
```

Esto instalará `netlify-cli` como dependencia de desarrollo.

### 2. Crear archivo `.env`

Crea un archivo `.env` en la raíz del proyecto. Puedes usar el template:

```bash
cp .env.example .env
```

Luego completa las variables necesarias. El archivo `.env.example` contiene todas las variables con explicaciones.

**Variables requeridas mínimas**:
- `CLERK_SECRET_KEY`: Obtener desde [Clerk Dashboard](https://dashboard.clerk.com) > API Keys > Secret Keys
- `EXPO_PUBLIC_SUPABASE_URL`: Para desarrollo local: `http://localhost:54321` (ver sección Supabase Local)
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Obtener ejecutando `npm run supabase:start` (ver sección Supabase Local)

**Importante**: 
- El archivo `.env` está en `.gitignore` y no se subirá al repositorio
- Para Supabase local, las credenciales se obtienen al ejecutar `supabase start`
- Para producción, usa las credenciales de tu proyecto en Supabase Dashboard

## Ejecutar el Proyecto

### Opción 1: Ejecutar solo las funciones de Netlify (para probar endpoints)

```bash
npm run dev:netlify
```

Esto iniciará:
- Las funciones de Netlify en `http://localhost:8888/.netlify/functions`
- El servidor de desarrollo de Expo (según `netlify.toml`)

### Opción 2: Ejecutar Expo y Netlify Functions juntos

**Terminal 1** - Netlify Functions:
```bash
npm run dev:netlify
```

**Terminal 2** - Expo (en otra terminal):
```bash
npm start
# o para web específicamente:
npm run web
```

## Estructura de URLs

Cuando ejecutas `netlify dev`:

- **Funciones de Netlify**: `http://localhost:8888/.netlify/functions/[nombre-funcion]`
  - Ejemplo: `http://localhost:8888/.netlify/functions/complete-onboarding`
  - Ejemplo: `http://localhost:8888/.netlify/functions/update-org-metadata`

- **App Expo (Web)**: `http://localhost:8081` (según `netlify.toml`)

## Probar las Funciones

Puedes probar las funciones directamente con `curl` o desde la app:

### Ejemplo con curl:

```bash
# Probar complete-onboarding
curl -X POST http://localhost:8888/.netlify/functions/complete-onboarding \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_JWT_TOKEN" \
  -d '{"userId":"user_xxx","userType":"professional"}'
```

## Solución de Problemas

### Error: "CLERK_SECRET_KEY is not defined" o "Missing Clerk Secret Key"

- Verifica que el archivo `.env` existe en la raíz del proyecto
- Verifica que `CLERK_SECRET_KEY` está definido en el archivo (sin espacios alrededor del `=`)
- **IMPORTANTE**: Reinicia `netlify dev` completamente después de crear/modificar `.env`
  - Detén el proceso con `Ctrl+C`
  - Vuelve a ejecutar `npm run dev:netlify`
- Verifica que el formato del `.env` es correcto:
  ```env
  CLERK_SECRET_KEY=sk_test_tu_clave_aqui
  ```
  (sin comillas, sin espacios antes/después del `=`)
- Si el problema persiste, verifica que Netlify Dev está cargando las variables:
  - Deberías ver en la salida: `◈ Injected .env file env var: CLERK_SECRET_KEY`

### Error: "Cannot find module '@clerk/clerk-sdk-node'"

- Ejecuta `npm install` para instalar las dependencias

### Las funciones no responden

- Verifica que `netlify dev` está corriendo en el puerto 8888
- Verifica que la URL en `EXPO_PUBLIC_API_URL` coincide con el puerto de Netlify
- En web, las funciones deberían estar disponibles en `/.netlify/functions` (ruta relativa)

### CORS errors

- Las funciones ya incluyen CORS headers en `netlify/functions/utils/cors.ts`
- Si persisten, verifica que estás usando la URL correcta según la plataforma (web vs mobile)

## Desarrollo Local con Supabase

PelusApp utiliza Supabase CLI para desarrollo local, permitiendo trabajar con una base de datos local completa.

### Requisitos Previos

1. **Docker Desktop**: Supabase CLI requiere Docker para ejecutar los servicios locales
   - Instalar desde: https://docs.docker.com/desktop
   - Verificar instalación: `docker --version`

2. **Supabase CLI**: Ya está instalado como dev dependency
   - Verificar: `npx supabase --version`

### Comandos Disponibles

```bash
# Iniciar Supabase local (incluye PostgreSQL, Auth, Storage, etc.)
npm run supabase:start

# Ver estado de los servicios
npm run supabase:status

# Aplicar migraciones
npm run supabase:migrate

# Resetear base de datos (elimina todos los datos)
npm run supabase:reset

# Detener servicios
npm run supabase:stop
```

### Primer Uso

1. **Crear archivo `.env`** (si no existe):
   ```bash
   cp .env.example .env
   ```

2. **Iniciar Supabase local**:
   ```bash
   npm run supabase:start
   ```

3. **Obtener credenciales**: Al iniciar, Supabase mostrará un output similar a:
   ```
   API URL: http://localhost:54321
   GraphQL URL: http://localhost:54321/graphql/v1
   DB URL: postgresql://postgres:postgres@localhost:54322/postgres
   Studio URL: http://localhost:54323
   Inbucket URL: http://localhost:54324
   JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
   anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
   ```

4. **Actualizar `.env`** con las credenciales:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (copia el anon key completo)
   ```

   **Importante**: 
   - Usa el `anon key` (NO el `service_role key`)
   - El `anon key` es seguro para usar en el frontend
   - El `service_role key` tiene permisos de administrador y NUNCA debe usarse en el frontend

5. **Aplicar migraciones**:
   ```bash
   npm run supabase:migrate
   ```

6. **Acceder al Dashboard**: Abre `http://localhost:54323` en tu navegador (Studio URL del output)

### Migraciones

Las migraciones SQL están en `supabase/migrations/`. Para crear una nueva:

```bash
npx supabase migration new nombre_de_la_migracion
```

Esto crea un archivo timestamped en `supabase/migrations/`. Edita el archivo y luego ejecuta:

```bash
npm run supabase:migrate
```

### Migrar a Producción

Cuando estés listo para aplicar cambios a Supabase Cloud:

```bash
# Vincular proyecto local con proyecto cloud
npx supabase link --project-ref tu-project-ref

# Aplicar todas las migraciones a cloud
npx supabase db push

# Actualizar variables de entorno para producción
# EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-cloud
```

## Notas Importantes

1. **Puerto 8888**: Netlify Dev usa el puerto 8888 por defecto (configurado en `netlify.toml`)
2. **Puerto 54321**: Supabase local usa el puerto 54321 para la API
3. **Variables de entorno**: Netlify Dev carga automáticamente las variables de `.env`
4. **Hot Reload**: Los cambios en las funciones se reflejan automáticamente
5. **Mobile**: En dispositivos móviles, necesitas usar la IP de tu máquina en lugar de `localhost`
6. **Docker**: Asegúrate de que Docker Desktop esté corriendo antes de iniciar Supabase local

