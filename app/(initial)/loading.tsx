import { useEffect, useRef } from 'react';
import { useAuth, useUser, useOrganizationList } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import LoadingScreen from '@/shared/components/LoadingScreen';
import { useAuthStore } from '@/core/store/authStore';
import { apiClient } from '@/core/services/api';

/**
 * Orquestador secundario que solo se monta cuando el usuario está logueado.
 * Esto evita el error "requires an active user session" de Clerk.
 */
function SignedInOrchestrator({ user, getToken }: { user: any, getToken: any }) {
  const router = useRouter();
  const { userMemberships, isLoaded: orgsLoaded } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    if (hasNavigatedRef.current || !orgsLoaded) return;

    const userType = user?.publicMetadata?.user_type as string | undefined;
    const memberships = userMemberships?.data || [];
    const hasOrganizations = memberships.length > 0;

    if (!userType && hasOrganizations) {
      console.log('Detectada inconsistencia de identidad. Iniciando auto-reparación...');
      
      const repairUser = async () => {
        try {
          const token = await getToken();
          await apiClient.post('/complete-onboarding', {
            userId: user.id,
            userType: 'professional'
          }, token);
          console.log('Auto-reparación completada con éxito.');
        } catch (error) {
          console.error('Fallo en el intento de auto-reparación:', error);
        }
      };
      
      repairUser();
      hasNavigatedRef.current = true;
      router.replace('/(tabs)');
      return;
    }

    if (!userType) {
      hasNavigatedRef.current = true;
      router.replace('/(initial)/professional-inquiry');
      return;
    }

    hasNavigatedRef.current = true;
    router.replace('/(tabs)');
    
  }, [orgsLoaded, user, userMemberships, router]);

  return <LoadingScreen />;
}

/**
 * Orquestador de carga inicial (El "Recepcionista").
 */
export default function InitialLoadingScreen() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const router = useRouter();
  const { isLoading: authLoading } = useAuthStore();
  
  const hasNavigatedGuestRef = useRef(false);

  useEffect(() => {
    if (hasNavigatedGuestRef.current) return;
    if (!isLoaded || !userLoaded || authLoading) return;

    if (!isSignedIn) {
      hasNavigatedGuestRef.current = true;
      router.replace('/(auth)/login');
    }
  }, [isLoaded, userLoaded, authLoading, isSignedIn, router]);

  if (!isLoaded || !userLoaded || authLoading) {
    return <LoadingScreen />;
  }

  // Si está logueado, delegamos al orquestador que tiene acceso a organizaciones
  if (isSignedIn && user) {
    return <SignedInOrchestrator user={user} getToken={getToken} />;
  }

  return <LoadingScreen />;
}
