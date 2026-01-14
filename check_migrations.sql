-- Script para verificar el estado de las migraciones
-- Verifica qué tablas existen en la base de datos

-- Listar todas las tablas en el esquema public
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar tablas específicas esperadas
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN '✓'
        ELSE '✗'
    END as profiles,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations_metadata') THEN '✓'
        ELSE '✗'
    END as organizations_metadata,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pets') THEN '✓'
        ELSE '✗'
    END as pets,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'locations') THEN '✓'
        ELSE '✗'
    END as locations,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_location_assignments') THEN '✓'
        ELSE '✗'
    END as user_location_assignments,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'medical_histories') THEN '✓'
        ELSE '✗'
    END as medical_histories,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'appointments') THEN '✓'
        ELSE '✗'
    END as appointments;

-- Verificar columnas específicas en pets (de la migración enhance_pets_table)
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'pets'
  AND column_name IN ('weight', 'gender', 'color', 'photo_url', 'notes', 'updated_at')
ORDER BY column_name;

-- Verificar funciones RPC
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%appointment%'
ORDER BY routine_name;
