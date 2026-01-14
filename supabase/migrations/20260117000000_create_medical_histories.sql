-- Crear tabla medical_histories para historiales médicos
-- Fase 2.1: Historiales Médicos (B2B - Veterinary)
-- Incluye campo metadata JSONB para extensibilidad futura
-- RLS dinámicas con patrón de sede activa (Staff ve solo su sede, Admins ven todas)

-- ============================================
-- 1. CREAR TABLA
-- ============================================

CREATE TABLE IF NOT EXISTS public.medical_histories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
  veterinarian_id text NOT NULL, -- ID de Clerk del veterinario
  visit_date date NOT NULL,
  diagnosis text,
  treatment text,
  notes text,
  -- Campo flexible para datos personalizados futuros (constantes vitales, etc.)
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Constraint: Un veterinario no puede tener múltiples visitas para la misma mascota en el mismo día
  CONSTRAINT unique_visit_per_pet_per_day 
    UNIQUE (pet_id, visit_date, veterinarian_id)
);

-- ============================================
-- 2. HABILITAR RLS
-- ============================================

ALTER TABLE public.medical_histories ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. CREAR ÍNDICES
-- ============================================

-- Índice para búsquedas por mascota
CREATE INDEX IF NOT EXISTS idx_medical_histories_pet_id ON public.medical_histories(pet_id);

-- Índice para búsquedas por sede
CREATE INDEX IF NOT EXISTS idx_medical_histories_location_id ON public.medical_histories(location_id);

-- Índice para búsquedas por veterinario
CREATE INDEX IF NOT EXISTS idx_medical_histories_veterinarian_id ON public.medical_histories(veterinarian_id);

-- Índice para búsquedas por fecha de visita
CREATE INDEX IF NOT EXISTS idx_medical_histories_visit_date ON public.medical_histories(visit_date DESC);

-- Índice compuesto para consultas frecuentes (sede + fecha)
CREATE INDEX IF NOT EXISTS idx_medical_histories_location_date ON public.medical_histories(location_id, visit_date DESC);

-- Índice GIN para búsquedas en metadata JSONB
CREATE INDEX IF NOT EXISTS idx_medical_histories_metadata ON public.medical_histories USING GIN (metadata);

-- ============================================
-- 4. POLÍTICAS RLS DINÁMICAS
-- ============================================

-- Política de SELECT: Staff ve registros de su sede activa, Admins ven todas las sedes de su org
CREATE POLICY "Acceso por sede activa"
ON public.medical_histories
FOR SELECT
USING (
  -- Si hay location_id en JWT, filtrar por esa sede (Staff)
  (
    (auth.jwt() ->> 'active_location_id') IS NOT NULL
    AND location_id = (auth.jwt() ->> 'active_location_id')::uuid
  )
  OR
  -- Admins ven todas las sedes de su org
  (
    (auth.jwt() ->> 'org_role') IN ('org:admin', 'org:creator')
    AND EXISTS (
      SELECT 1 FROM public.locations 
      WHERE id = medical_histories.location_id 
      AND org_id = (auth.jwt() ->> 'org_id')
    )
  )
);

-- Política de INSERT: Solo miembros de la org pueden crear registros
CREATE POLICY "Org members can create records"
ON public.medical_histories
FOR INSERT
WITH CHECK (
  (auth.jwt() ->> 'org_id') IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.locations 
    WHERE id = medical_histories.location_id 
    AND org_id = (auth.jwt() ->> 'org_id')
  )
  -- El veterinarian_id debe ser el usuario actual o un miembro de la org
  AND (
    veterinarian_id = (auth.jwt() ->> 'user_id')
    OR EXISTS (
      SELECT 1 FROM public.user_location_assignments
      WHERE user_id = veterinarian_id
      AND org_id = (auth.jwt() ->> 'org_id')
      AND is_active = true
    )
  )
);

-- Política de UPDATE: Staff solo puede actualizar registros de su sede activa
CREATE POLICY "Staff can update records of their active location"
ON public.medical_histories
FOR UPDATE
USING (
  (
    (auth.jwt() ->> 'active_location_id') IS NOT NULL
    AND location_id = (auth.jwt() ->> 'active_location_id')::uuid
  )
  OR
  (
    (auth.jwt() ->> 'org_role') IN ('org:admin', 'org:creator')
    AND EXISTS (
      SELECT 1 FROM public.locations 
      WHERE id = medical_histories.location_id 
      AND org_id = (auth.jwt() ->> 'org_id')
    )
  )
)
WITH CHECK (
  (
    (auth.jwt() ->> 'active_location_id') IS NOT NULL
    AND location_id = (auth.jwt() ->> 'active_location_id')::uuid
  )
  OR
  (
    (auth.jwt() ->> 'org_role') IN ('org:admin', 'org:creator')
    AND EXISTS (
      SELECT 1 FROM public.locations 
      WHERE id = medical_histories.location_id 
      AND org_id = (auth.jwt() ->> 'org_id')
    )
  )
);

-- Política de DELETE: Similar a UPDATE
CREATE POLICY "Staff can delete records of their active location"
ON public.medical_histories
FOR DELETE
USING (
  (
    (auth.jwt() ->> 'active_location_id') IS NOT NULL
    AND location_id = (auth.jwt() ->> 'active_location_id')::uuid
  )
  OR
  (
    (auth.jwt() ->> 'org_role') IN ('org:admin', 'org:creator')
    AND EXISTS (
      SELECT 1 FROM public.locations 
      WHERE id = medical_histories.location_id 
      AND org_id = (auth.jwt() ->> 'org_id')
    )
  )
);

-- ============================================
-- 5. TRIGGER PARA ACTUALIZAR updated_at
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_medical_histories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
DROP TRIGGER IF EXISTS trigger_update_medical_histories_updated_at ON public.medical_histories;
CREATE TRIGGER trigger_update_medical_histories_updated_at
  BEFORE UPDATE ON public.medical_histories
  FOR EACH ROW
  EXECUTE FUNCTION update_medical_histories_updated_at();

-- ============================================
-- 6. COMENTARIOS
-- ============================================

COMMENT ON TABLE public.medical_histories IS 'Historiales médicos de mascotas atendidas en las sedes';
COMMENT ON COLUMN public.medical_histories.metadata IS 'Campo JSONB flexible para datos personalizados futuros (constantes vitales, etc.)';
COMMENT ON COLUMN public.medical_histories.location_id IS 'Sede donde se realizó la visita. Auto-asignado desde JWT active_location_id';
