-- Función RPC para validación atómica de conflictos de horario
-- Fase 3.3: Sistema de Citas (B2B - Veterinary)
-- Evita "double-booking" cuando dos recepcionistas intentan agendar simultáneamente

CREATE OR REPLACE FUNCTION check_appointment_conflict(
  p_location_id uuid,
  p_veterinarian_id text,
  p_appointment_date date,
  p_appointment_time time,
  p_duration_minutes integer DEFAULT 30,
  p_exclude_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_conflict_exists boolean := false;
  v_end_time time;
BEGIN
  -- Calcular hora de fin
  v_end_time := (p_appointment_time + (p_duration_minutes || ' minutes')::interval)::time;
  
  -- Buscar conflictos con SELECT FOR UPDATE para lock de filas
  SELECT EXISTS(
    SELECT 1
    FROM public.appointments
    WHERE location_id = p_location_id
      AND veterinarian_id = p_veterinarian_id
      AND appointment_date = p_appointment_date
      AND status = 'scheduled'
      AND (id != p_exclude_id OR p_exclude_id IS NULL)
      AND (
        -- La nueva cita empieza durante una existente
        (appointment_time <= p_appointment_time AND (appointment_time + (duration_minutes || ' minutes')::interval)::time > p_appointment_time)
        OR
        -- La nueva cita termina durante una existente
        (appointment_time < v_end_time AND (appointment_time + (duration_minutes || ' minutes')::interval)::time >= v_end_time)
        OR
        -- La nueva cita contiene completamente una existente
        (appointment_time >= p_appointment_time AND (appointment_time + (duration_minutes || ' minutes')::interval)::time <= v_end_time)
      )
    FOR UPDATE
  ) INTO v_conflict_exists;
  
  RETURN v_conflict_exists;
END;
$$;

COMMENT ON FUNCTION check_appointment_conflict IS 'Valida si hay conflicto de horario para una cita. Retorna true si hay conflicto, false si no hay conflicto. Usa SELECT FOR UPDATE para evitar race conditions.';
