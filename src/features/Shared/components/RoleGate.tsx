import React from 'react';
import { useAuthStore } from '@/core/store/authStore';
import { UserRole } from '@/core/types/user';
import LoadingScreen from './LoadingScreen';

interface RoleGateProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente que renderiza contenido solo si el usuario tiene uno de los roles permitidos
 */
export default function RoleGate({ allowedRoles, children, fallback = null }: RoleGateProps) {
  const { userRole, isLoading } = useAuthStore();
  
  console.log('🛡️ RoleGate Rendering:', { 
    userRole, 
    isLoading, 
    allowedRoles,
    hasAccess: userRole ? allowedRoles.includes(userRole) : false 
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

