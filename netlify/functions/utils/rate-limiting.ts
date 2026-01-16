/**
 * Rate Limiting Utilities
 * Control de uso de IA por tipo de usuario
 */

import { AIContext } from './auth';

// En memoria para desarrollo (usar Redis en producción)
const requestCounts: Map<string, { count: number; resetAt: number }> = new Map();

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Ventana de tiempo en milisegundos
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  reason?: string;
}

/**
 * Configuración de límites por tipo de usuario
 */
export function getRateLimitConfig(context: AIContext): RateLimitConfig {
  // B2C (pet_owner)
  if (context.userType === 'pet_owner' && !context.orgId) {
    return {
      maxRequests: 5, // 5 consultas por hora gratis
      windowMs: 60 * 60 * 1000, // 1 hora
    };
  }

  // B2B (professional en organización)
  if (context.userType === 'professional' && context.orgId) {
    return {
      maxRequests: 100, // 100 consultas por día por organización
      windowMs: 24 * 60 * 60 * 1000, // 24 horas
    };
  }

  // Default: muy restrictivo
  return {
    maxRequests: 2,
    windowMs: 60 * 60 * 1000,
  };
}

/**
 * Verifica si el usuario puede hacer una request
 */
export function checkRateLimit(
  context: AIContext,
  toolName?: string
): RateLimitResult {
  // Herramientas de navegación no tienen rate limit
  const navigationTools = ['navigate_to_route', 'find_pet_and_navigate', 'navigate_to_medical_history'];
  if (toolName && navigationTools.includes(toolName)) {
    return {
      allowed: true,
      remaining: Infinity,
      resetAt: Date.now(),
    };
  }

  const config = getRateLimitConfig(context);
  
  // Clave de rate limit:
  // - B2C: por userId
  // - B2B: por orgId (compartido entre todos en la org)
  const key = context.orgId || context.userId;

  const now = Date.now();
  const record = requestCounts.get(key);

  // Si no hay registro o la ventana expiró, crear uno nuevo
  if (!record || now >= record.resetAt) {
    const newResetAt = now + config.windowMs;
    requestCounts.set(key, {
      count: 1, // Incrementar inmediatamente para la request actual
      resetAt: newResetAt,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: newResetAt,
    };
  }

  // Verificar si excedió el límite
  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
      reason: `Límite de ${config.maxRequests} consultas alcanzado. Intenta de nuevo después de ${new Date(
        record.resetAt
      ).toLocaleTimeString()}.`,
    };
  }

  // Incrementar contador
  record.count++;

  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Reset manual del rate limit (para testing o admin override)
 */
export function resetRateLimit(key: string) {
  requestCounts.delete(key);
}

/**
 * Obtener estadísticas de uso
 */
export function getRateLimitStats(context: AIContext) {
  const key = context.orgId || context.userId;
  const record = requestCounts.get(key);
  const config = getRateLimitConfig(context);

  if (!record || Date.now() >= record.resetAt) {
    return {
      used: 0,
      limit: config.maxRequests,
      resetAt: Date.now() + config.windowMs,
    };
  }

  return {
    used: record.count,
    limit: config.maxRequests,
    resetAt: record.resetAt,
  };
}

/**
 * Cleanup periódico de registros expirados (llamar en background job)
 */
export function cleanupExpiredRecords() {
  const now = Date.now();
  const expiredKeys: string[] = [];

  for (const [key, record] of requestCounts.entries()) {
    if (now >= record.resetAt) {
      expiredKeys.push(key);
    }
  }

  expiredKeys.forEach((key) => requestCounts.delete(key));
  
  console.log(`[Rate Limit] Cleaned up ${expiredKeys.length} expired records`);
}

// Cleanup automático cada 1 hora
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredRecords, 60 * 60 * 1000);
}
