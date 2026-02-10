-- 1. Create a security definer function to check roles without triggering RLS
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.user_roles WHERE user_roles.user_id = $1 LIMIT 1;
$$;

-- 2. Drop existing problematic policies on user_roles
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
-- Drop any other existing policies (adjust names as needed)
DROP POLICY IF EXISTS "select_user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "insert_user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "update_user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "delete_user_roles" ON public.user_roles;

-- 3. Recreate policies WITHOUT self-referencing queries

-- Everyone can read their own role
CREATE POLICY "Users can view their own role"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all roles (uses the security definer function, not a direct query)
CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Admins can insert roles
CREATE POLICY "Admins can insert roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- Admins can update roles
CREATE POLICY "Admins can update roles"
  ON public.user_roles
  FOR UPDATE
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Admins can delete roles
CREATE POLICY "Admins can delete roles"
  ON public.user_roles
  FOR DELETE
  USING (public.get_user_role(auth.uid()) = 'admin');
