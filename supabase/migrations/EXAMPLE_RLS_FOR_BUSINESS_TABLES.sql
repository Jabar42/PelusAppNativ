-- EJEMPLO: Políticas RLS para Tablas de Negocio con Sistema de Sedes
-- Este archivo es solo un ejemplo/referencia. NO se ejecuta como migración.
-- Úsalo como plantilla cuando crees nuevas tablas de negocio.

-- ============================================
-- PASO 1: Agregar location_id a la tabla
-- ============================================
-- ALTER TABLE public.medical_histories 
-- ADD COLUMN location_id uuid REFERENCES public.locations(id);

-- ============================================
-- PASO 2: Crear políticas RLS dinámicas
-- ============================================

-- Política de SELECT: Staff ve registros de su sede activa, Admins ven todos
CREATE POLICY "Staff can view records of their active location"
ON public.medical_histories
FOR SELECT
USING (
  -- Si hay location_id en JWT, filtrar por esa sede
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
-- NOTAS IMPORTANTES:
-- ============================================
-- 1. Reemplaza 'medical_histories' con el nombre de tu tabla
-- 2. Asegúrate de que la tabla tenga RLS habilitado: ALTER TABLE ... ENABLE ROW LEVEL SECURITY;
-- 3. Los admins siempre ven todas las sedes de su org
-- 4. El staff solo ve su sede activa (active_location_id del JWT)
-- 5. Si no hay active_location_id en el JWT, el staff no verá nada (comportamiento seguro)
