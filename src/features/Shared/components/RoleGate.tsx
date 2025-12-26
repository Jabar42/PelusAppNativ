import React from 'react';
import { useOrganization } from '@clerk/clerk-expo';
import { UserRole } from '@/core/types/user';
import LoadingScreen from './LoadingScreen';

interface RoleGateProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente que renderiza contenido solo si el usuario se encuentra en el contexto permitido.
 * Mapeo:
 * - 'B2B' -> Hay una organización activa en Clerk.
 * - 'B2C' -> No hay organización activa (Perfil Personal).
 */
export default function RoleGate({ allowedRoles, children, fallback = null }: RoleGateProps) {
  const { organization, isLoaded } = useOrganization();
  
  // Determinar el contexto actual
  const currentContext: UserRole = organization ? 'B2B' : 'B2C';

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  if (!allowedRoles.includes(currentContext)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
