import React from 'react';

/**
 * Mock de expo-router para usar en Storybook
 * Proporciona implementaciones básicas de los hooks de expo-router
 */

// Mock del router
const mockRouter = {
  push: (href: string) => {
    console.log('[Storybook Mock] Router.push:', href);
  },
  replace: (href: string) => {
    console.log('[Storybook Mock] Router.replace:', href);
  },
  back: () => {
    console.log('[Storybook Mock] Router.back');
  },
  canGoBack: () => true,
  setParams: (params: Record<string, any>) => {
    console.log('[Storybook Mock] Router.setParams:', params);
  },
};

/**
 * Mock de useRouter hook
 */
export const useRouter = () => mockRouter;

/**
 * Mock de usePathname hook
 */
export const usePathname = () => '/';

/**
 * Mock de useSegments hook
 */
export const useSegments = () => [];

/**
 * Mock de useLocalSearchParams hook
 */
export const useLocalSearchParams = () => ({});

/**
 * Mock de useGlobalSearchParams hook
 */
export const useGlobalSearchParams = () => ({});

/**
 * Mock del componente Link
 */
export const Link = ({ children, href, ...props }: any) => {
  return (
    <a href={href} onClick={(e) => { e.preventDefault(); mockRouter.push(href); }} {...props}>
      {children}
    </a>
  );
};

/**
 * Mock de Redirect
 */
export const Redirect = ({ href }: { href: string }) => {
  mockRouter.replace(href);
  return null;
};

/**
 * Mock de Stack
 */
export const Stack = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

/**
 * Mock de Slot
 */
export const Slot = () => {
  return null;
};

/**
 * Mock de Tabs (componente de expo-router)
 */
export const Tabs = ({ children, ...props }: any) => {
  return <div {...props}>{children}</div>;
};

// Tabs.Screen para compatibilidad
Tabs.Screen = ({ children, ...props }: any) => {
  return <div {...props}>{children}</div>;
};

/**
 * Función helper para establecer el pathname mock
 */
let mockPathname = '/';
export const setMockPathname = (pathname: string) => {
  mockPathname = pathname;
};

// Sobrescribir usePathname para usar el mock
const originalUsePathname = usePathname;
export const usePathnameMock = () => mockPathname;
