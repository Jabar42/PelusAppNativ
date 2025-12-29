# Flujo de Autenticación y Orquestación (Auth Flow)

Este documento detalla cómo PelusApp gestiona el ciclo de vida de la sesión desde el lanzamiento hasta el dashboard.

```mermaid
graph TD
    Start[Lanzamiento App] --> Loaded{¿isLoaded?}
    Loaded -- No --> Loading[LoadingScreen]
    Loaded -- Sí --> Auth{¿isSignedIn?}
    
    Auth -- No --> Login[Redirigir a /login]
    Auth -- Sí --> Orchestrator[SignedInOrchestrator]
    
    Orchestrator --> Meta{¿user_type?}
    Meta -- NULL --> CheckOrgs{¿Tiene Orgs?}
    
    CheckOrgs -- Sí --> Repair[Auto-reparación: 'professional']
    CheckOrgs -- No --> Inquiry[Redirigir a /professional-inquiry]
    
    Meta -- OK --> Tabs[Redirigir a /(tabs)]
    Repair --> Tabs
```

## 2. Segmentación Inicial (Professional Inquiry)

Ubicada en `app/(initial)/professional-inquiry.tsx`. 
- No es opcional para nuevos usuarios.
- Llama a la función `/complete-onboarding` en el backend.
- Ejecuta `user.reload()` para asegurar que el frontend tenga los metadatos actualizados antes de navegar.

## 3. Sincronización Global (`useAuthSync.ts`)

Hook reactivo que mantiene el `authStore` sincronizado:
- `isLoading`: Bloquea la UI durante cambios de sesión.
- `hasCompletedOnboarding`: Sincronizado con `user.publicMetadata.hasCompletedOnboarding`.

## 4. Recuperación de Errores (Self-Healing)

Si un usuario queda en un estado inconsistente (ej. creó una organización pero el backend falló al actualizar su `user_type`), el `SignedInOrchestrator` detecta la presencia de membresías y re-intenta la actualización de metadatos automáticamente.

