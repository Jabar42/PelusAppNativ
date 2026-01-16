/**
 * MCP Tool: Appointments
 * Gestión de citas veterinarias con RLS y validación de conflictos
 */

import { MCPToolContext } from './supabase-mcp';

export interface ScheduleAppointmentParams {
  petId: string;
  dateTime: string; // ISO 8601
  reason: string;
  duration?: number; // minutos, default 30
  notes?: string;
}

export interface Appointment {
  id: string;
  pet_id: string;
  org_id: string;
  location_id: string;
  scheduled_at: string;
  reason: string;
  duration_minutes: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
}

/**
 * Tool: schedule_appointment
 * Agenda una cita verificando disponibilidad
 * 
 * RLS: Solo usuarios profesionales en organizaciones
 * Validación: Usa function check_appointment_conflict de Supabase
 */
export async function scheduleAppointment(
  params: ScheduleAppointmentParams,
  context: MCPToolContext
): Promise<Appointment> {
  const { petId, dateTime, reason, duration = 30, notes } = params;
  const { supabase, aiContext } = context;

  // Validar que tenga organización y sede activa
  if (!aiContext.orgId || !aiContext.activeLocationId) {
    throw new Error('Requiere organización y sede activa para agendar citas');
  }

  console.log('[Tool] schedule_appointment:', {
    petId,
    dateTime,
    orgId: aiContext.orgId,
    locationId: aiContext.activeLocationId,
  });

  // 1. Verificar conflictos de horario
  const { data: conflictData, error: conflictError } = await supabase.rpc(
    'check_appointment_conflict',
    {
      p_location_id: aiContext.activeLocationId,
      p_scheduled_at: dateTime,
      p_duration_minutes: duration,
    }
  );

  if (conflictError) {
    console.error('[Tool] Error checking conflicts:', conflictError);
    throw new Error(`Error al verificar disponibilidad: ${conflictError.message}`);
  }

  if (conflictData === true) {
    throw new Error(
      'Ya existe una cita agendada en ese horario. Por favor elige otra hora.'
    );
  }

  // 2. Crear la cita
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      pet_id: petId,
      org_id: aiContext.orgId,
      location_id: aiContext.activeLocationId,
      scheduled_at: dateTime,
      reason,
      duration_minutes: duration,
      notes,
      status: 'scheduled',
    })
    .select()
    .single();

  if (error) {
    console.error('[Tool] schedule_appointment error:', error);
    throw new Error(`Failed to schedule appointment: ${error.message}`);
  }

  return data as Appointment;
}

/**
 * Tool: get_available_slots
 * Obtiene slots disponibles para agendar citas
 * 
 * @param date - Fecha en formato YYYY-MM-DD (se interpreta como UTC)
 * @param duration - Duración de la cita en minutos (para considerar bloques ocupados)
 * @returns Array de timestamps ISO 8601 en UTC de slots disponibles
 * 
 * NOTA: Esta implementación trabaja enteramente en UTC.
 * El frontend debe convertir a timezone local para mostrar al usuario.
 * TODO: Agregar timezone de la sede en tabla locations para conversión correcta.
 */
export async function getAvailableSlots(
  params: { date: string; duration?: number },
  context: MCPToolContext
): Promise<string[]> {
  const { date, duration = 30 } = params;
  const { supabase, aiContext } = context;

  if (!aiContext.activeLocationId) {
    throw new Error('Requiere sede activa para consultar disponibilidad');
  }

  console.log('[Tool] get_available_slots:', {
    date,
    locationId: aiContext.activeLocationId,
  });

  // Horario de negocio en UTC (ej: clínica en UTC-5 que abre 9 AM local = 14:00 UTC)
  // TODO: Obtener el timezone de la sede desde la BD y ajustar dinámicamente
  // Por ahora, asumimos horarios en UTC para consistencia
  const businessHoursUTC = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  ];

  // Consultar citas existentes para esa fecha en UTC
  const startOfDay = `${date}T00:00:00.000Z`;
  const endOfDay = `${date}T23:59:59.999Z`;

  const { data: existingAppointments, error } = await supabase
    .from('appointments')
    .select('scheduled_at, duration_minutes')
    .eq('location_id', aiContext.activeLocationId)
    .gte('scheduled_at', startOfDay)
    .lte('scheduled_at', endOfDay)
    .neq('status', 'cancelled');

  if (error) {
    console.error('[Tool] Error fetching appointments:', error);
    throw new Error(`Error consultando citas: ${error.message}`);
  }

  // Construir set de slots ocupados por citas existentes
  const occupiedSlots = new Set<string>();
  
  existingAppointments?.forEach((apt) => {
    const aptDate = new Date(apt.scheduled_at);
    const aptTimeUTC = aptDate.toISOString().slice(11, 16); // HH:MM en UTC
    const durationSlots = Math.ceil(apt.duration_minutes / 30); // Cuántos slots de 30min ocupa
    
    // Marcar como ocupados todos los slots que cubre esta cita
    occupiedSlots.add(aptTimeUTC);
    
    // Si la cita dura más de 30min, marcar siguientes slots como ocupados
    for (let i = 1; i < durationSlots; i++) {
      const nextSlotTime = new Date(aptDate.getTime() + i * 30 * 60 * 1000);
      occupiedSlots.add(nextSlotTime.toISOString().slice(11, 16));
    }
  });

  // Calcular cuántos slots consecutivos necesita la duración solicitada
  const slotsNeeded = Math.ceil(duration / 30);

  // Filtrar slots que tienen suficiente espacio CONTINUO para la duración
  const availableSlots = businessHoursUTC
    .filter((slot, index) => {
      // Verificar que el slot actual esté libre
      if (occupiedSlots.has(slot)) {
        return false;
      }

      // Verificar que los siguientes (slotsNeeded - 1) slots también estén libres
      for (let i = 1; i < slotsNeeded; i++) {
        const nextIndex = index + i;
        
        // Si nos salimos del horario de negocio, el slot no es válido
        if (nextIndex >= businessHoursUTC.length) {
          return false;
        }

        const nextSlot = businessHoursUTC[nextIndex];
        
        // Verificar que el siguiente slot esté libre
        if (occupiedSlots.has(nextSlot)) {
          return false;
        }

        // Verificar que los slots sean consecutivos (diferencia de 30 min exactos)
        // Comparar el slot ANTERIOR con el ACTUAL (pares consecutivos)
        const prevSlot = businessHoursUTC[nextIndex - 1];
        const prevTime = new Date(`${date}T${prevSlot}:00.000Z`).getTime();
        const nextTime = new Date(`${date}T${nextSlot}:00.000Z`).getTime();
        const timeDiff = nextTime - prevTime;
        
        // Si hay un gap mayor a 30 min (ej: pausa de almuerzo), no es consecutivo
        if (timeDiff > 30 * 60 * 1000) {
          return false;
        }
      }

      return true;
    })
    .map((slot) => `${date}T${slot}:00.000Z`);

  console.log('[Tool] Available slots found:', availableSlots.length, `(for ${duration} min appointments)`);

  return availableSlots;
}
