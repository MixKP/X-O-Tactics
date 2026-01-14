// Supabase Edge Function for validating and processing online game moves
// This ensures fair play by validating all moves server-side

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface MoveRequest {
  sessionId: string;
  userId: string;
  move: {
    type: 'place' | 'skill';
    cell: number;
    skillName?: string;
    targetCell?: number;
  };
}

interface MoveResponse {
  success: boolean;
  error?: string;
  gameState?: any;
}

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const { sessionId, userId, move }: MoveRequest = await req.json();

    // Validate request
    if (!sessionId || !userId || !move) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the current game session
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ success: false, error: 'Game session not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if game is still active
    if (session.status !== 'playing') {
      return new Response(
        JSON.stringify({ success: false, error: 'Game is not in playing state' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Determine which player is making the move
    const playerNumber = session.player1_id === userId ? 1 : 2;
    const playerSymbol = playerNumber === 1 ? 'X' : 'O';

    // Check if it's this player's turn
    if (session.current_player !== playerSymbol) {
      return new Response(
        JSON.stringify({ success: false, error: 'Not your turn' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse current game state
    const board = session.board as (Player | null)[];
    const players = session.players as any;
    const effects = deserializeEffects(session.effects);

    // Validate and apply the move
    const validationResult = validateAndApplyMove(move, board, players, effects, playerSymbol);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ success: false, error: validationResult.error }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check for win/draw condition
    const newBoard = validationResult.newBoard;
    const winResult = checkWinCondition(newBoard);
    const nextPlayer = playerSymbol === 'X' ? 'O' : 'X';

    // Prepare update data
    const updateData: any = {
      board: newBoard,
      current_player: winResult.winner ? session.current_player : nextPlayer,
      players: validationResult.newPlayers,
      effects: serializeEffects(validationResult.newEffects),
      status: winResult.winner ? 'won' : winResult.isDraw ? 'draw' : 'playing',
      winner: winResult.winner,
      move_history: [...session.move_history, move],
    };

    // Update game session in database
    const { error: updateError } = await supabase
      .from('game_sessions')
      .update(updateData)
      .eq('id', sessionId);

    if (updateError) {
      console.error('Failed to update game session:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update game state' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Save move to game_moves table
    const { error: moveError } = await supabase
      .from('game_moves')
      .insert({
        game_session_id: sessionId,
        player_id: userId,
        player: playerSymbol,
        move_number: session.move_history.length + 1,
        type: move.type,
        cell_index: move.cell,
        skill_name: move.skillName,
        move_data: move,
      });

    if (moveError) {
      console.error('Failed to save move:', moveError);
      // Non-critical, don't fail the request
    }

    // If game ended, complete it and update ELO
    if (winResult.winner || winResult.isDraw) {
      const { error: completeError } = await supabase.rpc('complete_online_game', {
        p_session_id: sessionId,
        p_winner: winResult.winner || '',
        p_is_draw: winResult.isDraw,
        p_abandoned: false,
      });

      if (completeError) {
        console.error('Failed to complete game:', completeError);
        // Non-critical at this point
      }
    }

    // Return success with new game state
    const response: MoveResponse = {
      success: true,
      gameState: updateData,
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// Helper: Validate and apply move
function validateAndApplyMove(
  move: any,
  board: any[],
  players: any,
  effects: any,
  playerSymbol: 'X' | 'O'
): { success: boolean; error?: string; newBoard?: any; newPlayers?: any; newEffects?: any } {
  const cell = move.cell;

  // Validate cell index
  if (cell < 0 || cell > 8) {
    return { success: false, error: 'Invalid cell index' };
  }

  // Check for frozen cell
  if (effects.frozenCells[cell] && effects.frozenCells[cell] > 0) {
    return { success: false, error: 'This cell is frozen' };
  }

  const currentPlayer = players[playerSymbol];
  const opponentSymbol = playerSymbol === 'X' ? 'O' : 'X';

  if (move.type === 'place') {
    // Normal placement - cell must be empty
    if (board[cell] !== null) {
      return { success: false, error: 'Cell is already occupied' };
    }

    // Place the mark
    const newBoard = [...board];
    newBoard[cell] = playerSymbol;

    // Update MP (gain 1 MP, max 5)
    const newPlayers = {
      ...players,
      [playerSymbol]: {
        ...currentPlayer,
        mp: Math.min(5, currentPlayer.mp + 1),
      },
    };

    return {
      success: true,
      newBoard,
      newPlayers,
      newEffects: effects,
    };

  } else if (move.type === 'skill') {
    // Skill usage
    const skillName = move.skillName;

    if (!skillName) {
      return { success: false, error: 'Skill name required' };
    }

    // TODO: Implement skill validation and application
    // For now, we'll reject all skills until we implement them server-side
    return { success: false, error: 'Skills not yet implemented in online mode' };
  }

  return { success: false, error: 'Invalid move type' };
}

// Helper: Check win condition
function checkWinCondition(board: any[]): { winner: 'X' | 'O' | null; isDraw: boolean } {
  const winningCombinations = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal
    [2, 4, 6], // Anti-diagonal
  ];

  // Check for winner
  for (const combo of winningCombinations) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], isDraw: false };
    }
  }

  // Check for draw (board full)
  const isDraw = !board.includes(null);
  return { winner: null, isDraw };
}

// Helper: Deserialize effects from JSON
function deserializeEffects(data: any): any {
  return {
    frozenCells: data.frozenCells || {},
    shieldedMarks: new Set(data.shieldedMarks || []),
  };
}

// Helper: Serialize effects for JSON storage
function serializeEffects(effects: any): any {
  return {
    frozenCells: effects.frozenCells || {},
    shieldedMarks: Array.from(effects.shieldedMarks || []),
  };
}

type Player = 'X' | 'O' | null;
