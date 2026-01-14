-- Add email column to profiles table
-- This allows username-based login to work correctly

-- Add the email column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Update existing profiles with their email from auth.users
UPDATE public.profiles p
SET email = au.email
FROM auth.users au
WHERE p.id = au.id AND p.email IS NULL;

-- Make the column nullable (for backward compatibility)
-- New users will have email set via trigger
