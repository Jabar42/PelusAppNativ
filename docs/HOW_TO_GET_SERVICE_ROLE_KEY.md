# Cómo Obtener el SUPABASE_SERVICE_ROLE_KEY

## Pasos para Obtener el Service Role Key

### 1. Acceder al Dashboard de Supabase

1. Ve a https://supabase.com/dashboard
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto (o créalo si no tienes uno)

### 2. Navegar a la Sección de API

1. En el menú lateral izquierdo, haz clic en **Settings** (⚙️)
2. Luego haz clic en **API** (o busca "API" en el menú)

### 3. Encontrar el Service Role Key

En la página de API verás varias secciones:

- **Project URL**: La URL de tu proyecto
- **anon public key**: La clave pública (anon key) - ⚠️ NO es esta
- **service_role secret key**: La clave secreta (service_role key) - ✅ **ESTA ES LA QUE NECESITAS**

### 4. Copiar el Service Role Key

1. Busca la sección **"service_role secret key"**
2. Haz clic en el botón **"Reveal"** o **"Show"** para revelar la clave
3. **Copia la clave completa** (es una cadena larga que comienza con `eyJ...`)

⚠️ **IMPORTANTE**: 
- Esta clave tiene **permisos de administrador** y **bypass RLS**
- **NUNCA** la expongas en el frontend
- **NUNCA** la subas a Git
- **Solo** úsala en el backend (Netlify Functions)

### 5. Configurar en Netlify

1. Ve a tu proyecto en Netlify Dashboard
2. Ve a **Site settings** → **Environment variables**
3. Haz clic en **Add a variable**
4. Agrega:
   - **Key**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: (pega el service_role key que copiaste)
5. Haz clic en **Save**
6. **Redespliega** tu sitio para que los cambios tomen efecto

## Ubicación Visual

```
Supabase Dashboard
├── Settings (⚙️)
    └── API
        ├── Project URL
        ├── anon public key (❌ NO esta)
        └── service_role secret key (✅ ESTA)
```

## Verificación

Después de configurar, puedes verificar que funciona:

1. Intenta crear una organización nuevamente
2. Si el error de RLS desaparece, ¡funcionó!
3. Si aún hay error, verifica:
   - Que copiaste la clave completa (sin espacios)
   - Que la variable se llama exactamente `SUPABASE_SERVICE_ROLE_KEY`
   - Que redesplegaste el sitio después de agregar la variable

## Nota sobre Seguridad

El `service_role key` es muy poderoso porque:
- Bypass todas las políticas RLS
- Puede leer/escribir cualquier dato
- Tiene acceso completo a la base de datos

Por eso es seguro usarlo en el backend (Netlify Functions) porque:
- El backend valida permisos antes de usarlo
- Solo se usa para operaciones administrativas específicas
- Nunca se expone al frontend

## Alternativa: Usar Solo JWT (Sin Service Role Key)

Si prefieres no usar el service_role key, puedes:
1. Configurar el template `supabase` en Clerk con todos los claims necesarios
2. Asegurarte de que el token se refresque después de crear la organización
3. El backend usará el cliente autenticado con el JWT

Sin embargo, el service_role key es más confiable para la creación inicial de sedes.
