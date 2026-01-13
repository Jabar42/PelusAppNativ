-- SISTEMA DE SEDES (LOCATIONS) PARA PELUSAPP
-- Permite a las organizaciones tener múltiples ubicaciones y asignar usuarios a sedes específicas
-- Transforma PelusApp de "App para una sola veterinaria" a "Plataforma SaaS Multisede"

-- ============================================
-- 1. TABLA DE SEDES (LOCATIONS)
-- ============================================

CREATE TABLE IF NOT EXISTS public.locations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id text NOT NULL, -- FK a organizations_metadata.org_id
  name text NOT NULL,
  address text,
  city text,
  state text,
  country text DEFAULT 'Colombia',
  phone text,
  email text,
  is_primary boolean DEFAULT false, -- Primera sede creada
  is_main boolean DEFAULT true, -- Sede principal (para UI)
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Constraint: Solo una sede principal por organización
  CONSTRAINT unique_main_location_per_org 
    UNIQUE NULLS NOT DISTINCT (org_id, is_main) 
    WHERE is_main = true
);

-- ============================================
-- 2. TABLA DE ASIGNACIÓN USUARIO-SEDE (MODELO DIAMANTE)
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_location_assignments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL, -- ID del usuario de Clerk (sub)
  org_id text NOT NULL, -- ID de la organización
  location_id uuid NOT NULL, -- FK a locations.id
  role text CHECK (role IN ('admin', 'manager', 'staff', 'viewer')), -- Rol específico en la sede
  assigned_by uuid, -- ID del admin que hizo la asignación
  assigned_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  
  -- Constraint: Un usuario solo puede tener un rol activo por sede
  CONSTRAINT unique_active_assignment 
    UNIQUE (user_id, location_id) 
    WHERE is_active = true,
  
  -- Foreign keys
  CONSTRAINT fk_location 
    FOREIGN KEY (location_id) 
    REFERENCES public.locations(id) ON DELETE CASCADE
);

-- ============================================
-- 3. ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX idx_locations_org_id ON public.locations(org_id);
CREATE INDEX idx_locations_is_main ON public.locations(org_id, is_main) WHERE is_main = true;
CREATE INDEX idx_user_location_assignments_user_id ON public.user_location_assignments(user_id);
CREATE INDEX idx_user_location_assignments_org_id ON public.user_location_assignments(org_id);
CREATE INDEX idx_user_location_assignments_location_id ON public.user_location_assignments(location_id);
CREATE INDEX idx_user_location_assignments_active ON public.user_location_assignments(user_id, org_id, is_active) WHERE is_active = true;

-- ============================================
-- 4. TRIGGER DE VALIDACIÓN: "SEDE HUÉRFANA"
-- ============================================

-- Función para validar que no se elimine una sede con registros médicos
CREATE OR REPLACE FUNCTION prevent_location_deletion_with_records()
RETURNS TRIGGER AS $$
DECLARE
  has_medical_records boolean := false;
  has_appointments boolean := false;
  has_consultations boolean := false;
BEGIN
  -- Verificar si existen tablas de negocio y si tienen registros asociados
  -- Esta función se expande cuando se agreguen nuevas tablas de negocio
  
  -- Verificar medical_histories (si existe)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'medical_histories'
  ) THEN
    SELECT EXISTS (
      SELECT 1 FROM public.medical_histories 
      WHERE location_id = OLD.id
    ) INTO has_medical_records;
  END IF;
  
  -- Verificar appointments (si existe)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'appointments'
  ) THEN
    SELECT EXISTS (
      SELECT 1 FROM public.appointments 
      WHERE location_id = OLD.id
    ) INTO has_appointments;
  END IF;
  
  -- Verificar consultations (si existe)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'consultations'
  ) THEN
    SELECT EXISTS (
      SELECT 1 FROM public.consultations 
      WHERE location_id = OLD.id
    ) INTO has_consultations;
  END IF;
  
  -- Si hay registros asociados, prevenir eliminación
  IF has_medical_records OR has_appointments OR has_consultations THEN
    RAISE EXCEPTION 'No se puede eliminar una sede con registros médicos asociados. Primero debe migrar o eliminar los registros.';
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_location_deletion
BEFORE DELETE ON public.locations
FOR EACH ROW
EXECUTE FUNCTION prevent_location_deletion_with_records();

-- ============================================
-- 5. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_location_assignments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. POLÍTICAS RLS PARA locations
-- ============================================

-- Ver: Miembros de la org pueden ver todas las sedes
CREATE POLICY "Org members can view locations" 
ON public.locations FOR SELECT 
USING ((auth.jwt() ->> 'org_id') = org_id);

-- Crear: Solo admins
CREATE POLICY "Org admins can create locations" 
ON public.locations FOR INSERT 
WITH CHECK (
  (auth.jwt() ->> 'org_id') = org_id 
  AND (auth.jwt() ->> 'org_role') IN ('org:admin', 'org:creator')
);

-- Actualizar/Eliminar: Solo admins
CREATE POLICY "Org admins can update locations" 
ON public.locations FOR UPDATE 
USING (
  (auth.jwt() ->> 'org_id') = org_id 
  AND (auth.jwt() ->> 'org_role') IN ('org:admin', 'org:creator')
);

CREATE POLICY "Org admins can delete locations" 
ON public.locations FOR DELETE 
USING (
  (auth.jwt() ->> 'org_id') = org_id 
  AND (auth.jwt() ->> 'org_role') IN ('org:admin', 'org:creator')
);

-- ============================================
-- 7. POLÍTICAS RLS PARA user_location_assignments
-- ============================================

-- Ver: Usuarios ven sus asignaciones + Admins ven todas
CREATE POLICY "Users can view relevant assignments" 
ON public.user_location_assignments FOR SELECT 
USING (
  auth.uid()::text = user_id::text 
  OR (
    (auth.jwt() ->> 'org_id') = org_id 
    AND (auth.jwt() ->> 'org_role') IN ('org:admin', 'org:creator')
  )
);

-- Crear: Solo admins
CREATE POLICY "Org admins can create assignments" 
ON public.user_location_assignments FOR INSERT 
WITH CHECK (
  (auth.jwt() ->> 'org_id') = org_id 
  AND (auth.jwt() ->> 'org_role') IN ('org:admin', 'org:creator')
);

-- Actualizar/Eliminar: Solo admins
CREATE POLICY "Org admins can update assignments" 
ON public.user_location_assignments FOR UPDATE 
USING (
  (auth.jwt() ->> 'org_id') = org_id 
  AND (auth.jwt() ->> 'org_role') IN ('org:admin', 'org:creator')
);

CREATE POLICY "Org admins can delete assignments" 
ON public.user_location_assignments FOR DELETE 
USING (
  (auth.jwt() ->> 'org_id') = org_id 
  AND (auth.jwt() ->> 'org_role') IN ('org:admin', 'org:creator')
);

-- ============================================
-- 8. FUNCIONES AUXILIARES
-- ============================================

-- Obtener location_id del JWT
CREATE OR REPLACE FUNCTION get_current_location_id() 
RETURNS uuid AS $$
  SELECT (auth.jwt() ->> 'active_location_id')::uuid;
$$ LANGUAGE sql STABLE;

-- Verificar acceso a sede
CREATE OR REPLACE FUNCTION user_has_location_access(
  p_user_id uuid,
  p_location_id uuid
) 
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_location_assignments 
    WHERE user_id = p_user_id 
      AND location_id = p_location_id 
      AND is_active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Obtener sedes del usuario en una org
CREATE OR REPLACE FUNCTION get_user_locations_in_org(
  p_user_id uuid,
  p_org_id text
)
RETURNS TABLE (
  location_id uuid,
  location_name text,
  role text,
  is_main boolean
) AS $$
  SELECT 
    l.id,
    l.name,
    ula.role,
    l.is_main
  FROM public.user_location_assignments ula
  INNER JOIN public.locations l ON l.id = ula.location_id
  WHERE ula.user_id = p_user_id
    AND ula.org_id = p_org_id
    AND ula.is_active = true
    AND l.org_id = p_org_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

