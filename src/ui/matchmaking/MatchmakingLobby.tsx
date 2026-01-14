import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Profile, EloRating } from '../../lib/supabase';
import { matchmakingHelpers, eloHelpers } from '../../lib/supabase';
import type { GameMode, MatchmakingStatus } from '../../types/auth';
import type { PlayerClass } from '../../types/state';
import { createOnlineGameSession } from '../../services/game-session-service';

interface MatchmakingLobbyProps {
  userId: string;
  profile?: Profile;
  onMatchFound: (sessionId: string, playerNumber: 1 | 2, opponentUsername: string, playerClass: PlayerClass) => void;
  onCancel: () => void;
}

export function MatchmakingLobby({ userId, onMatchFound: _onMatchFound, onCancel }: MatchmakingLobbyProps) {
  const [gameMode, setGameMode] = useState<GameMode>('ranked');
  const [playerClass, setPlayerClass] = useState<PlayerClass>('disruptor');
  const [eloRating, setEloRating] = useState<EloRating | null>(null);
  const [status, setStatus] = useState<MatchmakingStatus>('idle');
  const [searchTime, setSearchTime] = useState(0);
  const [estimatedPlayers, setEstimatedPlayers] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEloRating();
  }, [userId, gameMode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (status === 'searching') {
      // Update search time every second
      interval = setInterval(() => {
        setSearchTime(prev => prev + 1);

        // Simulate player count fluctuation
        setEstimatedPlayers(Math.floor(Math.random() * 50) + 10);
      }, 1000);

      // Start matchmaking
      startMatchmaking();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  const loadEloRating = async () => {
    const { data } = await eloHelpers.getUserRating(userId, gameMode);
    setEloRating(data);
  };

  const startMatchmaking = async () => {
    if (!eloRating) return;

    setError(null);

    try {
      // Join the queue
      const { error: joinError } = await matchmakingHelpers.joinQueue(
        userId,
        gameMode,
        playerClass,
        eloRating.rating
      );

      if (joinError) throw joinError;

      // Subscribe to queue updates for real-time matchmaking
      matchmakingHelpers.subscribeToQueue(async (payload) => {
        if (payload.new.status === 'matched' && payload.new.user_id !== userId) {
          // Found a match!
          handleMatchFound(payload.new.id);
        }
      });

      // Poll for matches (fallback)
      pollForMatch();

    } catch (err: any) {
      setError(err.message || 'Failed to join matchmaking queue');
      setStatus('idle');
    }
  };

  const pollForMatch = async () => {
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds max

    const pollInterval = setInterval(async () => {
      if (status !== 'searching') {
        clearInterval(pollInterval);
        return;
      }

      attempts++;

      if (attempts >= maxAttempts) {
        clearInterval(pollInterval);
        setError('Matchmaking timeout. No players found.');
        await leaveQueue();
        setStatus('idle');
        return;
      }

      // Try to find a match
      const { data: matchId, error: findError } = await matchmakingHelpers.findMatch(
        userId,
        gameMode,
        playerClass
      );

      if (!findError && matchId) {
        clearInterval(pollInterval);
        handleMatchFound(matchId);
      }

    }, 1000);
  };

  const handleMatchFound = async (matchQueueId: string) => {
    setStatus('found');

    try {
      setStatus('connecting');

      // Get the match queue entry to find opponent info
      const { data: queueEntry, error: queueError } = await supabase
        .from('matchmaking_queue')
        .select('*')
        .eq('id', matchQueueId)
        .single();

      if (queueError || !queueEntry) {
        throw new Error('Failed to get match information');
      }

      // Find opponent's queue entry to get their class
      const { data: opponentQueue, error: opponentError } = await supabase
        .from('matchmaking_queue')
        .select('*, user_id')
        .eq('game_mode', gameMode)
        .eq('status', 'matched')
        .neq('user_id', userId)
        .limit(1)
        .single();

      if (opponentError || !opponentQueue) {
        throw new Error('Failed to find opponent information');
      }

      const opponentId = opponentQueue.user_id;

      // Fetch opponent's profile separately
      const { data: opponentProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', opponentId)
        .single();

      const opponentUsername = opponentProfile?.username || 'Unknown';
      const opponentClass = opponentQueue.player_class;

      // Determine player numbers (first in queue = Player 1/X)
      const isPlayer1 = new Date(queueEntry.created_at) < new Date(opponentQueue.created_at);
      const playerNumber: 1 | 2 = isPlayer1 ? 1 : 2;

      // Create the game session
      const sessionId = await createOnlineGameSession({
        player1Id: isPlayer1 ? userId : opponentId,
        player2Id: isPlayer1 ? opponentId : userId,
        player1Class: isPlayer1 ? playerClass : opponentClass,
        player2Class: isPlayer1 ? opponentClass : playerClass,
        gameMode,
      });

      console.log('Game session created:', sessionId, 'Player', playerNumber, 'vs', opponentUsername);

      // Navigate to online game
      _onMatchFound(sessionId, playerNumber, opponentUsername, playerClass);

    } catch (err: any) {
      console.error('Match found error:', err);
      setError(err.message || 'Failed to connect to match');
      setStatus('idle');
      await leaveQueue();
    }
  };

  const leaveQueue = async () => {
    if (status === 'searching') {
      await matchmakingHelpers.leaveQueue(userId);
    }
    setStatus('idle');
    setSearchTime(0);
  };

  const handleStartSearch = () => {
    if (!eloRating) {
      setError('Failed to load ELO rating');
      return;
    }
    setStatus('searching');
  };

  const handleCancelSearch = async () => {
    await leaveQueue();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Matchmaking</h1>
          <button
            onClick={onCancel}
            disabled={status === 'searching'}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6 shadow-xl">
          {status === 'idle' && (
            <div className="animate-fade-in">
              {/* Game Mode Selection */}
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-semibold mb-3">
                  Game Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setGameMode('ranked'); }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      gameMode === 'ranked'
                        ? 'border-cyan-500 bg-cyan-500/20 text-white'
                        : 'border-gray-700 bg-gray-900/50 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <p className="text-lg font-bold mb-1">⭐ Ranked</p>
                    <p className="text-xs">ELO rating on the line</p>
                  </button>
                  <button
                    onClick={() => { setGameMode('casual'); }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      gameMode === 'casual'
                        ? 'border-cyan-500 bg-cyan-500/20 text-white'
                        : 'border-gray-700 bg-gray-900/50 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <p className="text-lg font-bold mb-1">🎮 Casual</p>
                    <p className="text-xs">Play without pressure</p>
                  </button>
                </div>
              </div>

              {/* Class Selection */}
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-semibold mb-3">
                  Select Your Class
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setPlayerClass('disruptor'); }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      playerClass === 'disruptor'
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-gray-700 bg-gray-900/50 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <p className="text-lg font-bold mb-1">🌀 Disruptor</p>
                    <p className="text-xs">Shift, Freeze, Vanish</p>
                  </button>
                  <button
                    onClick={() => { setPlayerClass('tactician'); }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      playerClass === 'tactician'
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-gray-700 bg-gray-900/50 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <p className="text-lg font-bold mb-1">🎯 Tactician</p>
                    <p className="text-xs">Double Step, Shield, Swap</p>
                  </button>
                </div>
              </div>

              {/* Your Rating */}
              {eloRating && gameMode === 'ranked' && (
                <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Your Rating</p>
                      <p className="text-3xl font-bold text-white">{eloRating.rating}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">Peak</p>
                      <p className="text-xl font-bold text-yellow-400">{eloRating.peak_rating}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                  ⚠️ {error}
                </div>
              )}

              {/* Start Search Button */}
              <button
                onClick={handleStartSearch}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-purple-600 text-white text-xl font-bold rounded-lg hover:from-cyan-500 hover:to-purple-500 transition-all transform hover:scale-[1.02] shadow-lg"
              >
                🔍 Find Match
              </button>
            </div>
          )}

          {status === 'searching' && (
            <div className="text-center animate-fade-in">
              {/* Searching Animation */}
              <div className="mb-8">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-4 border-4 border-purple-500 rounded-full border-b-transparent animate-spin" style={{ animationDirection: 'reverse' }}></div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Finding Opponent...</h2>
                <p className="text-gray-400">{formatTime(searchTime)}</p>
              </div>

              {/* Searching Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Game Mode</p>
                  <p className="text-white font-bold">{gameMode === 'ranked' ? '⭐ Ranked' : '🎮 Casual'}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Your Class</p>
                  <p className="text-white font-bold">{playerClass === 'disruptor' ? '🌀 Disruptor' : '🎯 Tactician'}</p>
                </div>
              </div>

              {eloRating && gameMode === 'ranked' && (
                <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
                  <p className="text-gray-400 text-sm mb-1">Searching Range</p>
                  <p className="text-white font-bold">
                    {eloRating.rating - 100} - {eloRating.rating + 100}
                  </p>
                </div>
              )}

              {/* Estimated Players */}
              <div className="mb-6">
                <p className="text-gray-400 text-sm">
                  👥 Estimated players searching: <span className="text-cyan-400 font-bold">{estimatedPlayers}</span>
                </p>
              </div>

              {/* Cancel Button */}
              <button
                onClick={handleCancelSearch}
                className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition-all"
              >
                ✕ Cancel Search
              </button>
            </div>
          )}

          {status === 'found' && (
            <div className="text-center animate-pop-in">
              <div className="mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-white mb-2">Match Found!</h2>
                <p className="text-gray-400">Connecting to game server...</p>
              </div>

              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
