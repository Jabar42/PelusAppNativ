import React, { useState, useEffect } from 'react';
import { Platform, StyleSheet, TouchableOpacity, Text, View, Alert } from 'react-native';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Extender el tipo Window para incluir matchMedia
declare global {
  interface Window {
    matchMedia?: (query: string) => MediaQueryList;
  }
}

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Solo funciona en web
    if (Platform.OS !== 'web') {
      return;
    }

    // Verificar si la app ya está instalada
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    // Verificar si ya está instalada cuando se carga
    const checkInstalled = () => {
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        setIsInstallable(false);
      }
    };
    checkInstalled();

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      }
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Si no hay prompt disponible, mostrar instrucciones para iOS
      if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
          Alert.alert(
            'Instalar App',
            'Para instalar esta app en iOS:\n\n1. Toca el botón de compartir\n2. Selecciona "Agregar a pantalla de inicio"\n3. Confirma el nombre y toca "Agregar"'
          );
        } else {
          Alert.alert(
            'Instalar App',
            'Busca el botón de instalación en la barra de direcciones de tu navegador o en el menú del navegador.'
          );
        }
      }
      return;
    }

    // Mostrar el prompt de instalación
    deferredPrompt.prompt();

    // Esperar a que el usuario responda
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Usuario aceptó la instalación');
      setIsInstalled(true);
    } else {
      console.log('Usuario rechazó la instalación');
    }

    // Limpiar el prompt
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // No mostrar nada si ya está instalada o no es web
  if (Platform.OS !== 'web' || isInstalled || (!isInstallable && !deferredPrompt)) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleInstallClick}>
        <Text style={styles.buttonText}>📱 Instalar App</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>Agregar a pantalla principal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
});

