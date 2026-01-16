/**
 * useAIActions Hook
 * Hook para suscribirse y ejecutar acciones de IA (navegación, etc.)
 */

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAIStore } from '@/core/store/aiStore';
import { AIAction } from '../services/aiClient';
import { Alert } from 'react-native';

export function useAIActions() {
  const router = useRouter();
  const { pendingActions, clearPendingActions } = useAIStore();

  useEffect(() => {
    if (pendingActions.length === 0) return;

    // Ejecutar cada acción pendiente
    pendingActions.forEach((action) => {
      executeAction(action);
    });

    // Limpiar acciones ejecutadas
    clearPendingActions();
  }, [pendingActions, clearPendingActions]);

  const executeAction = (action: AIAction) => {
    console.log('[AI Actions] Executing action:', action.type, action.payload);

    switch (action.type) {
      case 'navigate':
        handleNavigate(action.payload);
        break;

      case 'show_notification':
        handleShowNotification(action.payload);
        break;

      case 'update_state':
        handleUpdateState(action.payload);
        break;

      default:
        console.warn('[AI Actions] Unknown action type:', action.type);
    }
  };

  const handleNavigate = (payload: any) => {
    const { screen, params } = payload;
    
    if (!screen) {
      console.error('[AI Actions] Navigate action missing screen parameter');
      return;
    }

    try {
      if (params) {
        router.push({ pathname: screen, params });
      } else {
        router.push(screen);
      }
    } catch (error) {
      console.error('[AI Actions] Navigation error:', error);
      Alert.alert('Error', 'No se pudo navegar a la pantalla solicitada');
    }
  };

  const handleShowNotification = (payload: any) => {
    const { title, message, type = 'info' } = payload;
    Alert.alert(title || 'Notificación', message || '', [{ text: 'OK' }]);
  };

  const handleUpdateState = (payload: any) => {
    // TODO: Implementar actualización de estado global según sea necesario
    console.log('[AI Actions] Update state:', payload);
  };

  return {
    pendingActions,
    executeAction,
  };
}
