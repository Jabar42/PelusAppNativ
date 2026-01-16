/**
 * AI Store - Estado global de IA
 * Gestiona conversaciones, acciones y comandos de IA
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AIMessage, AIAction } from '@/features/AI_Core/services/aiClient';

interface AIStore {
  // Estado de conversación
  messages: AIMessage[];
  isLoading: boolean;
  error: string | null;
  
  // Command bar state
  isCommandBarOpen: boolean;
  commandBarInput: string;
  
  // Acciones pendientes (para navegación asistida)
  pendingActions: AIAction[];
  
  // Métodos
  addMessage: (message: AIMessage) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Command bar
  openCommandBar: () => void;
  closeCommandBar: () => void;
  setCommandBarInput: (input: string) => void;
  
  // Actions
  addPendingAction: (action: AIAction) => void;
  executePendingActions: () => Promise<void>;
  clearPendingActions: () => void;
  
  // Persistencia
  loadMessagesFromStorage: () => Promise<void>;
  saveMessagesToStorage: () => Promise<void>;
}

const MESSAGES_STORAGE_KEY = '@pelusapp:ai_messages';
const MAX_STORED_MESSAGES = 50; // Limitar para no llenar el storage

export const useAIStore = create<AIStore>((set, get) => ({
  // Estado inicial
  messages: [],
  isLoading: false,
  error: null,
  isCommandBarOpen: false,
  commandBarInput: '',
  pendingActions: [],
  
  // Métodos de mensajes
  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
    get().saveMessagesToStorage();
  },
  
  clearMessages: () => {
    set({ messages: [] });
    AsyncStorage.removeItem(MESSAGES_STORAGE_KEY);
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  // Command bar methods
  openCommandBar: () => set({ isCommandBarOpen: true, commandBarInput: '' }),
  closeCommandBar: () => set({ isCommandBarOpen: false, commandBarInput: '' }),
  setCommandBarInput: (input) => set({ commandBarInput: input }),
  
  // Actions
  addPendingAction: (action) => {
    set((state) => ({
      pendingActions: [...state.pendingActions, action],
    }));
  },
  
  executePendingActions: async () => {
    const actions = get().pendingActions;
    // Las acciones se ejecutan en los componentes que se suscriban
    // Este método solo limpia las acciones después de ser procesadas
    console.log('[AI Store] Executing pending actions:', actions);
    set({ pendingActions: [] });
  },
  
  clearPendingActions: () => set({ pendingActions: [] }),
  
  // Persistencia
  loadMessagesFromStorage: async () => {
    try {
      const stored = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
      if (stored) {
        const messages = JSON.parse(stored) as AIMessage[];
        set({ messages });
      }
    } catch (error) {
      console.error('[AI Store] Error loading messages:', error);
    }
  },
  
  saveMessagesToStorage: async () => {
    try {
      const { messages } = get();
      // Solo guardar los últimos N mensajes
      const toStore = messages.slice(-MAX_STORED_MESSAGES);
      await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(toStore));
    } catch (error) {
      console.error('[AI Store] Error saving messages:', error);
    }
  },
}));
