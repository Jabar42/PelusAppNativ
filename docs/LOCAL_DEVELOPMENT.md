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

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Clerk - Secret Key del backend (obtener desde Clerk Dashboard > API Keys)
CLERK_SECRET_KEY=sk_test_...

# Clerk - Webhook Secret (opcional, solo si usas webhooks)
CLERK_WEBHOOK_SECRET=whsec_...

# API URL para desarrollo local
EXPO_PUBLIC_API_URL=http://localhost:8888/.netlify/functions

# Supabase (si usas Supabase)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Importante**: 
- Obtén `CLERK_SECRET_KEY` desde tu [Clerk Dashboard](https://dashboard.clerk.com) > API Keys > Secret Keys
- El archivo `.env` está en `.gitignore` y no se subirá al repositorio

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

## Notas Importantes

1. **Puerto 8888**: Netlify Dev usa el puerto 8888 por defecto (configurado en `netlify.toml`)
2. **Variables de entorno**: Netlify Dev carga automáticamente las variables de `.env`
3. **Hot Reload**: Los cambios en las funciones se reflejan automáticamente
4. **Mobile**: En dispositivos móviles, necesitas usar la IP de tu máquina en lugar de `localhost`

