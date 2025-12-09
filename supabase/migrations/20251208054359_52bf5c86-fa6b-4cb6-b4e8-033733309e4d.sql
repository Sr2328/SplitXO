-- Create a security definer function to check if two users share a group
-- This avoids infinite recursion when used in RLS policies
CREATE OR REPLACE FUNCTION public.shares_group_with(_user_id uuid, _other_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.group_members gm1
    JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = _user_id 
      AND gm2.user_id = _other_user_id
  )
$$;

-- Drop the overly permissive profiles SELECT policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a new policy that only allows viewing profiles of users in shared groups
CREATE POLICY "Users can view own and group members profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id 
  OR public.shares_group_with(auth.uid(), user_id)
);

-- Drop the insecure notifications INSERT policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Create a proper notifications INSERT policy
-- Only allow users to create notifications for themselves (e.g., for testing)
-- In production, notifications should be created via triggers/edge functions using service role
CREATE POLICY "Users can create own notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);