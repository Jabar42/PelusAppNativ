-- Configuración de bucket y políticas RLS para fotos de mascotas
-- Fase 1.2: CRUD de Mascotas (B2C)

-- ============================================
-- 1. CREAR BUCKET (si no existe)
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-photos', 'pet-photos', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. CONFIGURAR POLÍTICAS RLS EN EL BUCKET
-- ============================================
DROP POLICY IF EXISTS "Users can view their pet photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their pet photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their pet photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their pet photos" ON storage.objects;

-- Política de SELECT: Solo el dueño puede ver sus fotos
-- El path debe seguir el patrón: {owner_id}/{pet_id}/{filename}
CREATE POLICY "Users can view their pet photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'pet-photos'
  AND (storage.foldername(name))[1] = (auth.jwt() ->> 'user_id')
);

-- Política de INSERT: Solo el dueño puede subir fotos para sus mascotas
CREATE POLICY "Users can upload their pet photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'pet-photos'
  AND (storage.foldername(name))[1] = (auth.jwt() ->> 'user_id')
);

-- Política de UPDATE: Solo el dueño puede actualizar sus fotos
CREATE POLICY "Users can update their pet photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'pet-photos'
  AND (storage.foldername(name))[1] = (auth.jwt() ->> 'user_id')
)
WITH CHECK (
  bucket_id = 'pet-photos'
  AND (storage.foldername(name))[1] = (auth.jwt() ->> 'user_id')
);

-- Política de DELETE: Solo el dueño puede eliminar sus fotos
CREATE POLICY "Users can delete their pet photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'pet-photos'
  AND (storage.foldername(name))[1] = (auth.jwt() ->> 'user_id')
);
