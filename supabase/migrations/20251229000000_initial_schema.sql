-- CONFIGURACIÓN INICIAL DE SUPABASE PARA PELUSAPP (CLERK INTEGRATION)

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Esquema de Identidad Unificada (B2C)
-- Esta tabla extiende los datos de Clerk. El ID debe coincidir con el 'sub' del JWT.
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY, -- Coincide con el user_id de Clerk
  user_type text CHECK (user_type IN ('pet_owner', 'professional')),
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Esquema de Negocios (B2B)
-- Esta tabla guarda metadatos extra de la organización de Clerk.
CREATE TABLE IF NOT EXISTS public.organizations_metadata (
  org_id text PRIMARY KEY, -- ID de la organización en Clerk (ej. org_...)
  business_type text CHECK (business_type IN ('veterinary', 'walking', 'grooming')),
  display_name text,
  address text,
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. Ejemplo de Tabla de Negocio (Mascotas)
CREATE TABLE IF NOT EXISTS public.pets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id uuid NOT NULL, -- Referencia al user_id de Clerk
  name text NOT NULL,
  species text,
  breed text,
  birth_date date,
  created_at timestamp with time zone DEFAULT now()
);

-- 5. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS DE SEGURIDAD (RLS) BASADAS EN CLERK JWT

-- A. Perfiles: Solo el dueño puede ver/editar su perfil
-- El claim 'sub' en Clerk es el ID del usuario.
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid()::text = id::text);

-- B. Mascotas: Solo el dueño puede ver/gestionar sus mascotas
CREATE POLICY "Owners can manage their pets" 
ON public.pets FOR ALL 
USING (auth.uid()::text = owner_id::text);

-- C. Organizaciones: Solo los miembros de la organización pueden ver los datos
-- Requiere que el JWT Template de Clerk incluya 'org_id'
CREATE POLICY "Org members can view their organization" 
ON public.organizations_metadata FOR SELECT 
USING ((auth.jwt() ->> 'org_id') = org_id);

-- 7. FUNCIONES DE AYUDA (Opcional)
-- Función para obtener el org_id actual del JWT de Clerk fácilmente
CREATE OR REPLACE FUNCTION get_current_org_id() 
RETURNS text AS $$
  SELECT auth.jwt() ->> 'org_id';
$$ LANGUAGE sql STABLE;





