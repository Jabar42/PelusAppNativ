-- FIX: Cambiar owner_id de uuid a text para coincidir con IDs de Clerk
-- Los IDs de Clerk son strings (ej: "user_351tu1j6Vvu5qkF83bJ2fcFljQe")
-- No son UUIDs, por lo que necesitamos cambiar el tipo de columna

-- 1. Eliminar la política RLS existente (se recreará después)
DROP POLICY IF EXISTS "Owners can manage their pets" ON public.pets;

-- 2. Cambiar el tipo de columna owner_id de uuid a text
ALTER TABLE public.pets 
  ALTER COLUMN owner_id TYPE text USING owner_id::text;

-- 3. Recrear la política RLS con el tipo correcto
CREATE POLICY "Owners can manage their pets" 
ON public.pets FOR ALL 
USING (auth.uid()::text = owner_id);
