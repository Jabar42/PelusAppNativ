Plan detallado para el flujo de inicio (Loading → Role → Onboarding → Auth)
1. Objetivo general
Diseñar un flujo de inicio limpio y sin parpadeos, con estas etapas:
LoadingScreen: decide a dónde va el usuario según sesión, rol y onboarding.
RoleSelectionScreen: para usuarios nuevos, capturar intención B2B/B2C.
Onboarding B2B/B2C: explicar valor y preparar el registro.
Auth (Clerk): login/registro; el backend asigna el rol y marca onboarding.
Todo esto se apoya en:
Expo Router con grupos (initial), (auth), (tabs).
Clerk para autenticación y publicMetadata.role.
Zustand para estado global (authStore, onboardingStore).
2. Estructura de carpetas y rutas
2.1. Rutas Expo Router (app/)
Crear la siguiente estructura:
app/├── _layout.tsx               # Root layout con ClerkProvider + Slot├── (initial)/                # 🔑 Flujo de inicio no autenticado│   ├── _layout.tsx           # Layout simple (sin tabs/headers)│   ├── loading.tsx           # 1. LoadingScreen (Traffic Cop)│   ├── role-select.tsx       # 2. RoleSelectionScreen│   └── (onboarding)/         # 3. Onboarding│       ├── _layout.tsx│       ├── b2b.tsx           # Onboarding B2B│       └── b2c.tsx           # Onboarding B2C├── (auth)/                   # Auth pública│   ├── _layout.tsx           # (si lo necesitas)│   └── login.tsx             # Ya existe (re-export a features)└── (tabs)/                   # Rutas privadas    ├── _layout.tsx    ├── index.tsx    ├── fav.tsx    ├── pro.tsx    ├── settings.tsx    └── help.tsx
2.2. Estado global (src/core/store)
Añadir dos stores en src/core/store/:
authStore.ts (ya existe, lo extendemos)
onboardingStore.ts (nuevo)
authStore.ts (extensión)
export interface AuthState {  userRole: UserRole | null;  isLoading: boolean;               // Carga de Clerk/rol  hasCompletedOnboarding: boolean;  // Flag global  setUserRole: (role: UserRole | null) => void;  setIsLoading: (loading: boolean) => void;  setHasCompletedOnboarding: (value: boolean) => void;  clearAuth: () => void;}
Inicialización:
export const useAuthStore = create<AuthState>((set) => ({  userRole: null,  isLoading: true,  hasCompletedOnboarding: false,  setUserRole: (role) => set({ userRole: role }),  setIsLoading: (loading) => set({ isLoading: loading }),  setHasCompletedOnboarding: (value) => set({ hasCompletedOnboarding: value }),  clearAuth: () => set({ userRole: null, isLoading: true, hasCompletedOnboarding: false }),}));
onboardingStore.ts (nuevo)
import { create } from 'zustand';import { UserRole } from '@/core/types/user';interface OnboardingState {  pendingRole: UserRole | null;  setPendingRole: (role: UserRole | null) => void;}export const useOnboardingStore = create<OnboardingState>((set) => ({  pendingRole: null,  setPendingRole: (role) => set({ pendingRole: role }),}));
Opcional: persistir pendingRole en localStorage/SecureStore si quieres usarlo en el backend.
3. Root Layout simplificado (app/_layout.tsx)
El Root Layout debe ser lo más simple posible:
Envuelve todo con ClerkProvider.
Renderiza <Slot />.
NO decide a dónde va el usuario (eso lo hace loading.tsx).
import { ClerkProvider } from '@clerk/clerk-expo';import { Slot } from 'expo-router';import { tokenCache } from '@/core/services/storage';import '../global.css';const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;if (!publishableKey) {  throw new Error(    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env file'  );}export default function RootLayout() {  return (    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>      <Slot />    </ClerkProvider>  );}
4. Layout del grupo (initial) (app/(initial)/_layout.tsx)
Layout minimal sin headers/tabs:
import { Slot } from 'expo-router';import { View, StyleSheet } from 'react-native';export default function InitialLayout() {  return (    <View style={styles.container}>      <Slot />    </View>  );}const styles = StyleSheet.create({  container: {    flex: 1,    backgroundColor: '#fff',  },});
5. Fase 1 – LoadingScreen (Traffic Cop)
5.1. Hook useAuthSync (en src/features/Auth/hooks/useAuthSync.ts)
Objetivo: sincronizar Clerk → authStore (rol + onboarding).
import { useEffect } from 'react';import { useAuth, useUser } from '@clerk/clerk-expo';import { useAuthStore } from '@/core/store/authStore';import { UserRole } from '@/core/types/user';export function useAuthSync() {  const { isLoaded, isSignedIn } = useAuth();  const { user, isLoaded: userLoaded } = useUser();  const { setUserRole, setIsLoading, setHasCompletedOnboarding } = useAuthStore();  useEffect(() => {    if (!isLoaded || !userLoaded) {      setIsLoading(true);      return;    }    if (!isSignedIn || !user) {      setUserRole(null);      setHasCompletedOnboarding(false);      setIsLoading(false);      return;    }    const role = user.publicMetadata?.role as UserRole | undefined;    const hasOnboarding = !!user.publicMetadata?.hasCompletedOnboarding;    if (role === 'B2B' || role === 'B2C') {      setUserRole(role);    } else {      // fallback temporal      setUserRole('B2C');    }    setHasCompletedOnboarding(hasOnboarding);    setIsLoading(false);  }, [isLoaded, userLoaded, isSignedIn, user, setUserRole, setHasCompletedOnboarding, setIsLoading]);}
5.2. Pantalla loading.tsx (app/(initial)/loading.tsx)
import React, { useEffect } from 'react';import { useAuth } from '@clerk/clerk-expo';import { useRouter } from 'expo-router';import { useAuthStore } from '@/core/store/authStore';import { useAuthSync } from '@/features/Auth/hooks/useAuthSync';import LoadingScreen from '@/shared/components/LoadingScreen';export default function InitialLoadingScreen() {  const { isLoaded, isSignedIn } = useAuth();  const router = useRouter();  const { isLoading: authLoading, hasCompletedOnboarding, userRole } = useAuthStore();  useAuthSync();  useEffect(() => {    if (!isLoaded || authLoading) return;    // Usuario no autenticado → ir a selección de rol    if (!isSignedIn) {      router.replace('/(initial)/role-select');      return;    }    // Usuario autenticado sin onboarding    if (!hasCompletedOnboarding) {      if (userRole === 'B2B') {        router.replace('/(initial)/(onboarding)/b2b');      } else {        router.replace('/(initial)/(onboarding)/b2c');      }      return;    }    // Usuario autenticado + onboarding completado → tabs    router.replace('/(tabs)');  }, [isLoaded, authLoading, isSignedIn, hasCompletedOnboarding, userRole, router]);  return <LoadingScreen />;}
6. Fase 2 – RoleSelectionScreen (app/(initial)/role-select.tsx)
import React from 'react';import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';import { useRouter } from 'expo-router';import { useOnboardingStore } from '@/core/store/onboardingStore';export default function RoleSelectionScreen() {  const router = useRouter();  const { setPendingRole } = useOnboardingStore();  const handleSelect = (role: 'B2B' | 'B2C') => {    setPendingRole(role);    if (role === 'B2B') {      router.push('/(initial)/(onboarding)/b2b');    } else {      router.push('/(initial)/(onboarding)/b2c');    }  };  return (    <View style={styles.container}>      <Text style={styles.title}>¿Cómo quieres usar PelusApp?</Text>      <TouchableOpacity style={styles.card} onPress={() => handleSelect('B2B')}>        <Text style={styles.cardTitle}>Soy veterinario</Text>        <Text style={styles.cardSubtitle}>Gestiona tu clínica, pacientes y recordatorios.</Text>      </TouchableOpacity>      <TouchableOpacity style={styles.card} onPress={() => handleSelect('B2C')}>        <Text style={styles.cardTitle}>Soy dueño de mascotas</Text>        <Text style={styles.cardSubtitle}>Controla vacunas, citas y bienestar de tus peludos.</Text>      </TouchableOpacity>    </View>  );}const styles = StyleSheet.create({  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },  title: { fontSize: 24, fontWeight: '700', marginBottom: 24, textAlign: 'center' },  card: {    padding: 16,    borderRadius: 12,    backgroundColor: '#f3f4ff',    marginBottom: 16,  },  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },  cardSubtitle: { fontSize: 14, color: '#4b5563' },});
7. Fase 3 – Onboarding (b2b.tsx / b2c.tsx)
app/(initial)/(onboarding)/b2b.tsx
UI con texto, beneficios y botón “Continuar con registro/login”:
import React from 'react';import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';import { useRouter } from 'expo-router';export default function B2BOnboardingScreen() {  const router = useRouter();  return (    <View style={styles.container}>      <Text style={styles.title}>PelusApp para Veterinarios</Text>      <Text style={styles.subtitle}>        Organiza tus pacientes, citas y recordatorios en un solo lugar.      </Text>      <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/login')}>        <Text style={styles.buttonText}>Crear cuenta o iniciar sesión</Text>      </TouchableOpacity>    </View>  );}
app/(initial)/(onboarding)/b2c.tsx
Análogo, pero para B2C.
8. Integración con Clerk (backend)
En tu backend (webhook de Clerk):
Cuando se cree/actualice un usuario:
Leer el rol elegido (p. ej. desde pendingRole enviado como metadata o algún claim).
Escribir:
publicMetadata: {  role: 'B2B' | 'B2C',  hasCompletedOnboarding: true,}
La próxima vez que el usuario abra la app:
loading.tsx + useAuthSync verán role + hasCompletedOnboarding === true → salto directo a /(tabs) sin pasar por (initial).
9. Resultado final
Usuario nuevo:
Entra → /(initial)/loading → detecta sin sesión → /(initial)/role-select
Elige rol → /(initial)/(onboarding)/b2b|b2c
Desde onboarding → (auth)/login → se registra (Clerk + webhook setea role y hasCompletedOnboarding)
Nuevo arranque → loading.tsx → /(tabs)
Usuario recurrente:
Entra → loading.tsx ve isSignedIn && hasCompletedOnboarding → /(tabs) directo
Sin flashes intermedios de login/otras pantallas.
Si quieres, el siguiente paso puede ser bajar esto a código real (ya lo tienes muy encaminado en tu proyecto) o ajustar detalles como cómo persistir pendingRole para el webhook.