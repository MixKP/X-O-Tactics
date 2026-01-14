-- Update the handle_new_user function to store email in profiles table
-- Run this in your Supabase SQL Editor after adding the email column

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );

  INSERT INTO public.elo_ratings (user_id, game_mode)
  VALUES (NEW.id, 'ranked');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
