# Estructura de Capas y Módulos (Feature Structure)

PelusApp utiliza una arquitectura basada en funcionalidades (Feature-driven) con fronteras estrictas para evitar el acoplamiento.

## 1. Jerarquía de Carpetas (`src/`)

### `core/` (El Motor Inmutable)
Contiene código agnóstico a la UI de las funcionalidades.
- `store/`: Estado global mínimo (Auth, UI loading).
- `services/`: Clientes de infraestructura (API, Supabase, Storage).
- `hooks/`: Hooks de infraestructura global (ej. `useSupabaseClient`).
- `types/`: Definiciones TypeScript compartidas.

### `features/` (Módulos de Negocio)
Cada funcionalidad es un silo independiente.
- `Auth/`: Registro, login y orquestación inicial.
- `User_Space/`: Todo lo relativo al perfil B2C (Dueños).
- `Business_Center/`: El orquestador y los módulos verticales (Veterinary, etc.).

### `Shared/` (Componentes Genéricos)
UI pura y lógica de navegación cross-feature.
- `components/`: Botones, inputs, modales.
- `navigation/`: Sidebar, MobileMenu, TabsLayout.

## 2. Regla de "Barrera de Capas"

Para mantener el código desacoplado, se aplican estas reglas de importación:

1.  **Shared no conoce Features**: Un componente en `Shared/` NUNCA debe importar nada de `features/`.
2.  **Features consumen Shared y Core**: Las funcionalidades pueden usar componentes compartidos y servicios base.
3.  **Comunicación entre Features**: Debe evitarse. Si dos funcionalidades necesitan compartir lógica, esta debe promoverse a `core/` o `Shared/`.
4.  **Uso de Path Aliases**: Siempre usar `@/` para evitar rutas relativas complejas (`../../`).

## 3. Estructura interna de una Feature

Cada carpeta dentro de `features/` debe (preferiblemente) seguir este orden:
- `screens/`: Componentes de página completa (Expo Router).
- `components/`: Componentes específicos de esta funcionalidad.
- `hooks/`: Lógica de React reutilizable dentro de la feature.
- `services/`: Llamadas API específicas de la feature.






