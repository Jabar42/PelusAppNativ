# Seguridad y Jerarquía de Metadatos (Backend Security)

PelusApp utiliza Clerk como motor de identidad, pero la gobernanza de datos sensibles se delega al backend para asegurar la integridad.

## 1. Clasificación de Metadatos

| Tipo | Escritura (Frontend) | Escritura (Backend) | Lectura | Uso en PelusApp |
| :--- | :--- | :--- | :--- | :--- |
| **Public** | ❌ PROHIBIDO | ✅ Único Canal | App y Backend | `user_type`, `org_type`, plan. |
| **Private** | ❌ PROHIBIDO | ✅ Único Canal | Solo Backend | IDs de Stripe, llaves internas. |
| **Unsafe** | ✅ Permitido | ✅ Permitido | App y Backend | Preferencias de UI (tema, idioma). |

**Regla de Oro**: Ninguna lógica de permisos o navegación debe depender de `unsafeMetadata`.

## 2. Comunicación Frontend -> Backend

Toda llamada a Netlify Functions debe estar firmada:
- El frontend obtiene un token con `getToken()`.
- Se envía en el header `Authorization: Bearer <JWT>`.
- El backend valida la firma del JWT antes de interactuar con el Admin SDK de Clerk.

## 3. Manejo de Organizaciones

Al crear una organización en `RegisterBusinessScreen`:
1.  Se usa el SDK de cliente para crear la base.
2.  Inmediatamente se llama a `/update-org-metadata` (Backend) para asignar el `type` (veterinary, etc).
3.  **Bloqueo de Navegación**: No se permite al usuario entrar al dashboard hasta que el backend confirme la actualización de metadatos.

## 4. Retintentos y Resiliencia

En `RegisterBusinessScreen`, si la organización se crea pero el backend falla, el sistema guarda el `createdOrgId` localmente y ofrece un botón de "Reintentar Configuración", evitando la creación de organizaciones duplicadas.










