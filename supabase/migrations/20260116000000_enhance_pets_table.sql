-- Mejora de la tabla pets: Agregar campos adicionales e índices
-- Fase 1.1: CRUD de Mascotas (B2C)

-- ============================================
-- 1. AGREGAR CAMPOS FALTANTES
-- ============================================

-- Peso de la mascota (en kg)
ALTER TABLE public.pets 
  ADD COLUMN IF NOT EXISTS weight numeric(5,2);

-- Género de la mascota
ALTER TABLE public.pets 
  ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('male', 'female', 'unknown'));

-- Color de la mascota
ALTER TABLE public.pets 
  ADD COLUMN IF NOT EXISTS color text;

-- URL de la foto almacenada en Supabase Storage
ALTER TABLE public.pets 
  ADD COLUMN IF NOT EXISTS photo_url text;

-- Notas adicionales sobre la mascota
ALTER TABLE public.pets 
  ADD COLUMN IF NOT EXISTS notes text;

-- Campo updated_at para tracking de modificaciones
ALTER TABLE public.pets 
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- ============================================
-- 2. CREAR ÍNDICES PARA BÚSQUEDAS
-- ============================================

-- Índice para búsquedas por owner_id (muy frecuente)
CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON public.pets(owner_id);

-- Índice para búsquedas por especie (filtros comunes)
CREATE INDEX IF NOT EXISTS idx_pets_species ON public.pets(species);

-- Índice compuesto para búsquedas por owner y especie
CREATE INDEX IF NOT EXISTS idx_pets_owner_species ON public.pets(owner_id, species);

-- Índice para ordenamiento por fecha de creación
CREATE INDEX IF NOT EXISTS idx_pets_created_at ON public.pets(created_at DESC);

-- ============================================
-- 3. VERIFICAR RLS
-- ============================================

-- La política RLS ya está correctamente configurada en migraciones anteriores
-- usando auth.jwt() ->> 'user_id' (no auth.uid())
-- Verificar que existe y usa el patrón correcto:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'pets' 
    AND policyname = 'Owners can manage their pets'
  ) THEN
    RAISE EXCEPTION 'La política RLS "Owners can manage their pets" no existe. Debe usar auth.jwt() ->> user_id';
  END IF;
  
  -- Verificar que la política usa auth.jwt() ->> 'user_id' y no auth.uid()
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'pets' 
    AND policyname = 'Owners can manage their pets'
    AND (qual::text LIKE '%auth.uid()%' OR with_check::text LIKE '%auth.uid()%')
  ) THEN
    RAISE WARNING 'La política RLS usa auth.uid() en lugar de auth.jwt() ->> user_id. Esto causará errores con Clerk IDs.';
  END IF;
END $$;

-- ============================================
-- 4. TRIGGER PARA ACTUALIZAR updated_at
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_pets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger si no existe
DROP TRIGGER IF EXISTS trigger_update_pets_updated_at ON public.pets;
CREATE TRIGGER trigger_update_pets_updated_at
  BEFORE UPDATE ON public.pets
  FOR EACH ROW
  EXECUTE FUNCTION update_pets_updated_at();
