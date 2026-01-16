/**
 * useAIChat Hook
 * Hook principal para interactuar con el agente de IA
 */

import { useState, useCallback } from 'react';
import { useUser, useOrganization, useAuth } from '@clerk/clerk-expo';
import { sendAIMessage, AIMessage, AIChatRequest } from '../services/aiClient';
import { useAIStore } from '@/core/store/aiStore';

export function useAIChat() {
  const { user } = useUser();
  const { organization } = useOrganization();
  const { getToken } = useAuth();
  const {
    messages,
    isLoading,
    error,
    addMessage,
    setLoading,
    setError,
    addPendingAction,
  } = useAIStore();

  const [localLoading, setLocalLoading] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!user) {
        setError('Usuario no autenticado');
        return;
      }

      setLoading(true);
      setLocalLoading(true);
      setError(null);

      try {
        // Agregar mensaje del usuario al store
        const userMessage: AIMessage = {
          role: 'user',
          content,
          timestamp: Date.now(),
        };
        addMessage(userMessage);

        // Preparar contexto
        const context = {
          userId: user.id,
          orgId: organization?.id,
          activeLocationId: organization?.publicMetadata?.active_location_id as string | undefined,
          userType: (user.publicMetadata?.user_type as 'pet_owner' | 'professional') || 'pet_owner',
        };

        // Obtener token de autenticación
        const token = await getToken();
        if (!token) {
          throw new Error('No se pudo obtener el token de autenticación');
        }

        // Enviar a la IA
        const request: AIChatRequest = {
          messages: [...messages, userMessage],
          context,
          streamMode: false, // Fase 1: sin streaming
        };

        const response = await sendAIMessage(request, token);

        // Agregar respuesta del asistente
        addMessage(response.message);

        // Procesar acciones si las hay
        if (response.actions && response.actions.length > 0) {
          response.actions.forEach((action) => {
            addPendingAction(action);
          });
        }
      } catch (err: any) {
        console.error('[useAIChat] Error:', err);
        setError(err.message || 'Error al comunicarse con el agente de IA');
      } finally {
        setLoading(false);
        setLocalLoading(false);
      }
    },
    [user, organization, messages, addMessage, setLoading, setError, addPendingAction, getToken]
  );

  return {
    messages,
    isLoading: isLoading || localLoading,
    error,
    sendMessage,
  };
}
