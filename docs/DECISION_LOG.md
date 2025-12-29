# Registro de Decisiones de Arquitectura (ADR) - PelusApp

Este documento registra las decisiones críticas de arquitectura, su contexto y sus consecuencias.

## ADR 001: Identidad Unificada y Multi-Contexto (B2B2C)
**Estado: Aceptado**
**Fecha: Diciembre 2025**

### Contexto
Originalmente la app separaba usuarios en roles rígidos (B2C o B2B) desde el login. Esto causaba fricción y problemas para usuarios híbridos (ej. un veterinario con mascota propia).

### Decisión
Migrar a una arquitectura de **Identidad Unificada** basada en Clerk Organizations.
- Todo usuario inicia como B2C.
- La creación de una organización "activa" el contexto B2B.
- El cambio de contexto es dinámico y no requiere re-autenticación.

### Consecuencias
- **Positivas**: Reducción de fricción, soporte nativo para usuarios híbridos, escalabilidad horizontal para nuevos negocios.
- **Negativas**: Mayor complejidad en el orquestador de navegación y lógica de carga.

---

## ADR 002: Jerarquía de Metadatos Segura (Backend-Driven)
**Estado: Aceptado**
**Fecha: Diciembre 2025**

### Contexto
Clerk permite actualizar `publicMetadata` desde el frontend, pero esto es inseguro para lógica de permisos (roles/tipos). El error `public_metadata is not a valid parameter` confirmó que Clerk restringe esto por seguridad.

### Decisión
Implementar un flujo **Backend-First** para metadatos críticos.
- El frontend llama a Netlify Functions enviando un JWT de Clerk.
- El backend valida el JWT y usa el Admin SDK para actualizar `publicMetadata`.
- Se prohíbe el uso de `unsafeMetadata` para lógica de negocio.

### Consecuencias
- **Positivas**: Integridad total de los datos de identidad, seguridad contra manipulación en cliente.
- **Negativas**: Necesidad de gestionar estados de carga adicionales mientras el backend procesa la actualización.

---

## ADR 003: Sistema de Temas Dinámico vs Modo Oscuro Nativo
**Estado: Aceptado**
**Fecha: Diciembre 2025**

### Contexto
Se requiere diferenciar visualmente cuando el usuario está en modo "Personal" (B2C) vs "Profesional" (B2B).

### Decisión
Utilizar un sistema de temas basado en Gluestack UI donde el color primario cambia según el contexto (ej. Cyan para B2C, Azul/Profesional para B2B).
- Se prioriza la **Conciencia de Contexto** sobre el modo oscuro nativo del sistema operativo en esta fase.

### Consecuencias
- **Positivas**: El usuario siempre sabe en qué "espacio" está operando.
- **Negativas**: La implementación del modo oscuro estándar de Android/iOS se posterga.










