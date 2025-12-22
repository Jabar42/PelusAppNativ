---
description: Reglas obligatorias para el sistema de diseño y estilos usando Gluestack UI y Design Tokens.
globs: "**/*.{tsx,ts,jsx,js}"
alwaysApply: true
---

# Reglas de Estilo y UI (Gluestack)

- **Uso Estricto de Tokens:** Prohibido el uso de valores hexadecimales, RGB o números fijos (hardcoded) para colores, espaciados (padding/margin), radios o tamaños de fuente.
- **Identificación de Tokens:** Usa siempre el prefijo `$` (ej. `$primary500`, `$4`, `$md`).
- **Prioridad de Componentes:** Utiliza exclusivamente componentes de `@gluestack-ui/themed` (Box, Center, VStack, HStack, Text, etc.) para asegurar que los tokens sean interpretados.
- **Nombres de Propiedades:**
    - Usa nombres completos si las abreviaturas (`p`, `mt`, `w`) fallan en el tipado: `padding`, `marginTop`, `width`, `height`.
    - Para espaciado entre elementos en stacks, usa `gap="$4"` en lugar de `space`.
- **Sincronización con Configuración:** Cualquier color nuevo o escala de espaciado debe ser agregado primero en `gluestack-ui.config.ts` antes de usarse en los componentes.
- **Refactorización Proactiva:** Si encuentras estilos inline o `StyleSheet.create` con valores fijos, cámbialos por componentes de Gluestack con tokens.


