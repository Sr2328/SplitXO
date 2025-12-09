-- Drop any existing foreign key constraints (ignore errors if they don't exist)
ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS expenses_paid_by_fkey;
ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS expenses_created_by_fkey;
ALTER TABLE public.expense_splits DROP CONSTRAINT IF EXISTS expense_splits_user_id_fkey;
ALTER TABLE public.settlements DROP CONSTRAINT IF EXISTS settlements_paid_by_fkey;
ALTER TABLE public.settlements DROP CONSTRAINT IF EXISTS settlements_paid_to_fkey;
ALTER TABLE public.group_members DROP CONSTRAINT IF EXISTS group_members_user_id_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

-- Ensure all users have profiles
INSERT INTO public.profiles (user_id, email, full_name)
SELECT id, email, COALESCE(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name')
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles)
ON CONFLICT (user_id) DO NOTHING;

-- Add foreign key from expenses.paid_by to profiles.user_id
ALTER TABLE public.expenses
ADD CONSTRAINT expenses_paid_by_fkey
FOREIGN KEY (paid_by) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key from expenses.created_by to profiles.user_id (nullable)
ALTER TABLE public.expenses
ADD CONSTRAINT expenses_created_by_fkey
FOREIGN KEY (created_by) REFERENCES public.profiles(user_id) ON DELETE SET NULL;

-- Add foreign key from expense_splits.user_id to profiles.user_id
ALTER TABLE public.expense_splits
ADD CONSTRAINT expense_splits_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key from settlements.paid_by to profiles.user_id
ALTER TABLE public.settlements
ADD CONSTRAINT settlements_paid_by_fkey
FOREIGN KEY (paid_by) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key from settlements.paid_to to profiles.user_id
ALTER TABLE public.settlements
ADD CONSTRAINT settlements_paid_to_fkey
FOREIGN KEY (paid_to) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key from group_members.user_id to profiles.user_id
ALTER TABLE public.group_members
ADD CONSTRAINT group_members_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key from notifications.user_id to profiles.user_id
ALTER TABLE public.notifications
ADD CONSTRAINT notifications_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;