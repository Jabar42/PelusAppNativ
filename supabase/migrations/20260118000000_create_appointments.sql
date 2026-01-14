-- Crear tabla appointments para sistema de citas
-- Fase 3.1: Sistema de Citas (B2B - Veterinary)
-- RLS dinámicas con patrón de sede activa

CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
  veterinarian_id text NOT NULL, -- ID de Clerk del veterinario
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  duration_minutes integer DEFAULT 30,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  reason text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Índice único compuesto para validación de conflictos
  CONSTRAINT unique_appointment_slot 
    UNIQUE (location_id, appointment_date, appointment_time, veterinarian_id)
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Índices
CREATE INDEX IF NOT EXISTS idx_appointments_pet_id ON public.appointments(pet_id);
CREATE INDEX IF NOT EXISTS idx_appointments_location_id ON public.appointments(location_id);
CREATE INDEX IF NOT EXISTS idx_appointments_veterinarian_id ON public.appointments(veterinarian_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_location_date ON public.appointments(location_id, appointment_date DESC);

-- RLS Policies (similar a medical_histories)
CREATE POLICY "Acceso por sede activa"
ON public.appointments FOR SELECT
USING (
  (auth.jwt() ->> 'active_location_id') IS NOT NULL
  AND location_id = (auth.jwt() ->> 'active_location_id')::uuid
  OR
  (auth.jwt() ->> 'org_role') IN ('org:admin', 'org:creator')
  AND EXISTS (
    SELECT 1 FROM public.locations 
    WHERE id = appointments.location_id 
    AND org_id = (auth.jwt() ->> 'org_id')
  )
);

CREATE POLICY "Org members can create appointments"
ON public.appointments FOR INSERT
WITH CHECK (
  (auth.jwt() ->> 'org_id') IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.locations 
    WHERE id = appointments.location_id 
    AND org_id = (auth.jwt() ->> 'org_id')
  )
);

CREATE POLICY "Staff can update appointments"
ON public.appointments FOR UPDATE
USING (
  (auth.jwt() ->> 'active_location_id') IS NOT NULL
  AND location_id = (auth.jwt() ->> 'active_location_id')::uuid
  OR
  (auth.jwt() ->> 'org_role') IN ('org:admin', 'org:creator')
  AND EXISTS (
    SELECT 1 FROM public.locations 
    WHERE id = appointments.location_id 
    AND org_id = (auth.jwt() ->> 'org_id')
  )
);

CREATE POLICY "Staff can delete appointments"
ON public.appointments FOR DELETE
USING (
  (auth.jwt() ->> 'active_location_id') IS NOT NULL
  AND location_id = (auth.jwt() ->> 'active_location_id')::uuid
  OR
  (auth.jwt() ->> 'org_role') IN ('org:admin', 'org:creator')
  AND EXISTS (
    SELECT 1 FROM public.locations 
    WHERE id = appointments.location_id 
    AND org_id = (auth.jwt() ->> 'org_id')
  )
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_appointments_updated_at ON public.appointments;
CREATE TRIGGER trigger_update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_appointments_updated_at();
