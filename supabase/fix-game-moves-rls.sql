-- Fix for game_moves RLS policy - Add INSERT permission
-- Run this in your Supabase SQL Editor

-- Allow players to insert moves for their own game sessions
CREATE POLICY "Players can insert moves in their sessions"
ON public.game_moves
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.game_sessions
    WHERE id = game_moves.game_session_id
    AND (player1_id = auth.uid() OR player2_id = auth.uid())
  )
);
