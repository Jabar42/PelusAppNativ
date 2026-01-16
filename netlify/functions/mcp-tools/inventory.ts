/**
 * MCP Tool: Inventory
 * Gestión de inventario de la clínica con RLS
 */

import { MCPToolContext } from './supabase-mcp';

export interface SearchInventoryParams {
  query: string;
  category?: string;
  lowStock?: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  location_id: string;
  low_stock_threshold: number;
  notes?: string;
}

/**
 * Tool: search_inventory
 * Busca productos en el inventario de la clínica
 * 
 * RLS: Solo usuarios profesionales en organizaciones
 * Requiere: userType=professional, orgId, activeLocationId
 */
export async function searchInventory(
  params: SearchInventoryParams,
  context: MCPToolContext
): Promise<InventoryItem[]> {
  const { query, category, lowStock } = params;
  const { supabase, aiContext } = context;

  // Validar que tenga organización y sede activa
  if (!aiContext.orgId || !aiContext.activeLocationId) {
    throw new Error('Requiere organización y sede activa para consultar inventario');
  }

  console.log('[Tool] search_inventory:', {
    query,
    category,
    lowStock,
    orgId: aiContext.orgId,
    locationId: aiContext.activeLocationId,
  });

  // TODO: Implementar cuando exista tabla de inventario
  // Por ahora retornar resultado mock
  console.warn('[Tool] search_inventory: Tabla de inventario no implementada todavía');

  return [];
}
