import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { Button, ButtonText, VStack, Text } from '@gluestack-ui/themed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

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
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (Platform.OS !== 'web' || isInstalled || (!isInstallable && !deferredPrompt)) {
    return null;
  }

  return (
    <VStack alignItems="center" marginVertical="$4" gap="$2">
      <Button 
        onPress={handleInstallClick}
        action="primary"
        variant="solid"
        size="lg"
        borderRadius="$lg"
      >
        <ButtonText>📱 Instalar PelusApp</ButtonText>
      </Button>
      <Text size="xs" color="$textLight500">
        Agrega PelusApp a tu pantalla de inicio
      </Text>
    </VStack>
  );
}

