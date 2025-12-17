import React, { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import { Box, Button, ButtonText, Text, VStack } from '@gluestack-ui/themed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// matchMedia ya está definido en los tipos de React Native Web

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

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

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Usuario aceptó la instalación');
      setIsInstalled(true);
    } else {
      console.log('Usuario rechazó la instalación');
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (Platform.OS !== 'web' || isInstalled || (!isInstallable && !deferredPrompt)) {
    return null;
  }

  return (
    <Box className="items-center my-4">
      <Button
        size="md"
        variant="solid"
        action="primary"
        className="bg-primary-500 shadow-md"
        onPress={handleInstallClick}
      >
        <ButtonText>📱 Instalar App</ButtonText>
      </Button>
      <Text className="mt-2 text-xs text-gray-600 dark:text-gray-400">
        Agregar a pantalla principal
      </Text>
    </Box>
  );
}

