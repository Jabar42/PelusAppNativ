-- Configuración de Supabase Storage para fotos de mascotas
-- Fase 1.2: CRUD de Mascotas (B2C)
-- CRÍTICO: Configurar RLS en el bucket para que solo el owner_id pueda INSERT/DELETE sus fotos

-- ============================================
-- 1. CREAR BUCKET (si no existe)
-- ============================================

-- Nota: Los buckets se crean manualmente en Supabase Dashboard o vía API
-- Este script asume que el bucket 'pet-photos' ya existe o se creará manualmente
-- Si el bucket no existe, crearlo desde el Dashboard de Supabase:
-- Storage > New bucket > Name: pet-photos > Public: false

-- ============================================
-- 2. CONFIGURAR POLÍTICAS RLS EN EL BUCKET
-- ============================================

-- IMPORTANTE: Las políticas de Storage usan una sintaxis diferente a las de tablas
-- Se basan en el path del archivo y el JWT del usuario

-- Política de SELECT: Solo el dueño puede ver sus fotos
-- El path debe seguir el patrón: {owner_id}/{pet_id}/{filename}
CREATE POLICY IF NOT EXISTS "Users can view their pet photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'pet-photos'
  AND (storage.foldername(name))[1] = (auth.jwt() ->> 'user_id')
);

-- Política de INSERT: Solo el dueño puede subir fotos para sus mascotas
-- El path debe seguir el patrón: {owner_id}/{pet_id}/{filename}
CREATE POLICY IF NOT EXISTS "Users can upload their pet photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'pet-photos'
  AND (storage.foldername(name))[1] = (auth.jwt() ->> 'user_id')
);

-- Política de UPDATE: Solo el dueño puede actualizar sus fotos
CREATE POLICY IF NOT EXISTS "Users can update their pet photos"
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
CREATE POLICY IF NOT EXISTS "Users can delete their pet photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'pet-photos'
  AND (storage.foldername(name))[1] = (auth.jwt() ->> 'user_id')
);

-- ============================================
-- 3. NOTAS IMPORTANTES
-- ============================================

-- Estructura de paths recomendada:
-- pet-photos/{owner_id}/{pet_id}/{timestamp}_{filename}
-- Ejemplo: pet-photos/user_123/pet_uuid_456/1705123456_photo.jpg
--
-- Esto permite:
-- 1. Fácil identificación del owner desde el path
-- 2. Organización por mascota
-- 3. Timestamps para evitar colisiones de nombres
--
-- Al subir una foto desde el frontend, usar:
-- const filePath = `${ownerId}/${petId}/${Date.now()}_${fileName}`;
-- await supabase.storage.from('pet-photos').upload(filePath, file);
