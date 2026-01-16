/**
 * MCP Tool: Medical History
 * Consulta historias clínicas con RLS activo
 */

import { MCPToolContext } from './supabase-mcp';

export interface MedicalHistoryParams {
  petId: string;
  limit?: number;
  includeAttachments?: boolean;
}

export interface MedicalHistoryRecord {
  id: string;
  pet_id: string;
  visit_date: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  vet_name?: string;
  location_id?: string;
  created_at: string;
}

/**
 * Tool: get_medical_history
 * Obtiene el historial médico de una mascota
 * 
 * RLS: Automático via JWT
 * - B2C: Solo puede ver historias de sus propias mascotas
 * - B2B: Solo puede ver historias de mascotas de su organización/sede
 */
export async function getMedicalHistory(
  params: MedicalHistoryParams,
  context: MCPToolContext
): Promise<MedicalHistoryRecord[]> {
  const { petId, limit = 20, includeAttachments = false } = params;
  // TODO: Implementar includeAttachments cuando exista la tabla medical_history_attachments
  const { supabase, aiContext } = context;

  console.log('[Tool] get_medical_history:', {
    petId,
    limit,
    userId: aiContext.userId,
    orgId: aiContext.orgId,
  });

  // Query base con RLS
  // TODO: Cuando exista la tabla medical_history_attachments, agregar relación aquí
  const query = supabase
    .from('medical_histories')
    .select('*')
    .eq('pet_id', petId)
    .order('visit_date', { ascending: false })
    .limit(limit);

  const { data, error } = await query;

  if (error) {
    console.error('[Tool] get_medical_history error:', error);
    throw new Error(`Failed to fetch medical history: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  return data as MedicalHistoryRecord[];
}

/**
 * Tool: summarize_medical_history
 * Resume el historial médico de una mascota usando IA
 * 
 * Este tool internamente llama a get_medical_history y procesa los datos
 */
export async function summarizeMedicalHistory(
  params: { petId: string; maxRecords?: number },
  context: MCPToolContext
): Promise<{ summary: string; keyPoints: string[]; lastVisit?: string }> {
  const { petId, maxRecords = 10 } = params;

  // Obtener historial
  const history = await getMedicalHistory(
    { petId, limit: maxRecords },
    context
  );

  if (history.length === 0) {
    return {
      summary: 'No hay historial médico disponible para esta mascota.',
      keyPoints: [],
    };
  }

  // TODO: Fase 2 - Usar LLM para generar resumen inteligente
  // Por ahora, resumen simple
  const lastVisit = history[0];
  const diagnosisCount = new Set(history.map((h) => h.diagnosis)).size;

  const summary = `Esta mascota tiene ${history.length} registros médicos. Última visita: ${new Date(
    lastVisit.visit_date
  ).toLocaleDateString()}. Se han registrado ${diagnosisCount} diagnósticos diferentes.`;

  const keyPoints = history.slice(0, 3).map((h) => {
    return `${new Date(h.visit_date).toLocaleDateString()}: ${h.diagnosis}`;
  });

  return {
    summary,
    keyPoints,
    lastVisit: lastVisit.visit_date,
  };
}
