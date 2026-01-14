-- PelusApp: Clerk IDs are strings like "user_...".
-- In Supabase, auth.uid() expects the JWT "sub" to be a UUID and will raise:
--   22P02 invalid input syntax for type uuid
-- when used with Clerk.
--
-- This migration removes auth.uid() usage from RLS policies and replaces it with
-- the Clerk claim injected via the JWT template `supabase`:
--   auth.jwt() ->> 'user_id'

-- ---------------------------------------------------------------------------
-- pets
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Owners can manage their pets" ON public.pets;

CREATE POLICY "Owners can manage their pets"
ON public.pets
FOR ALL
USING ((auth.jwt() ->> 'user_id') = owner_id)
WITH CHECK ((auth.jwt() ->> 'user_id') = owner_id);

-- ---------------------------------------------------------------------------
-- profiles
-- NOTE: profiles.id is currently uuid in schema, so we compare as text.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING ((auth.jwt() ->> 'user_id') = (id)::text);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING ((auth.jwt() ->> 'user_id') = (id)::text)
WITH CHECK ((auth.jwt() ->> 'user_id') = (id)::text);

-- ---------------------------------------------------------------------------
-- user_location_assignments
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view relevant assignments" ON public.user_location_assignments;

CREATE POLICY "Users can view relevant assignments"
ON public.user_location_assignments
FOR SELECT
USING (
  ((auth.jwt() ->> 'user_id') = user_id)
  OR (
    ((auth.jwt() ->> 'org_id') = org_id)
    AND ((auth.jwt() ->> 'org_role') = ANY (ARRAY['org:admin','org:creator']))
  )
);

