import { useState, useEffect, useCallback } from 'react';
import { getRealtimeManager } from '../../lib/realtime-manager';
import { getGameSession, updateGameState, saveMove, completeGame } from '../../services/game-session-service';
import { createInitialState } from '../../core/game-engine';
import { OnlineGameStatus, ReconnectionOverlay, OnlineGameOver } from './index';
import type { OnlineGameSession } from '../../services/game-session-service';
import type { PlayerClass, Move } from '../../types';
import type { GameEndResult } from '../../lib/realtime-manager';

interface OnlineGameProps {
  sessionId: string;
  userId: string;
  playerNumber: 1 | 2;
  opponentUsername: string;
  playerClass: PlayerClass;
  onReturnToMenu: () => void;
  onPlayAgain?: () => void;
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

export function OnlineGame({
  sessionId,
  userId,
  playerNumber,
  opponentUsername,
  playerClass,
  onReturnToMenu,
  onPlayAgain,
}: OnlineGameProps) {

  // Game state
  const [session, setSession] = useState<OnlineGameSession | null>(null);
  const [gameState, setGameState] = useState(createInitialState());
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [opponentConnected, setOpponentConnected] = useState(true);
  const [reconnectionState, setReconnectionState] = useState({
    attempting: false,
    attemptNumber: 0,
    lastAttempt: 0,
  });
  const [gameResult, setGameResult] = useState<GameEndResult | null>(null);
  const [playerRatingChange, setPlayerRatingChange] = useState<number | undefined>();
  const [opponentRatingChange, setOpponentRatingChange] = useState<number | undefined>();

  // Derived state
  const playerSymbol: 'X' | 'O' = playerNumber === 1 ? 'X' : 'O';
  const opponentSymbol: 'X' | 'O' = playerNumber === 1 ? 'O' : 'X';
  const opponentClass = session?.player2_class || playerClass;
  const isPlayerTurn = gameState.currentPlayer === playerSymbol;
  const gameMode = session?.game_mode || 'casual';

  // Load initial game session
  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const sessionData = await getGameSession(sessionId);
      if (!sessionData) {
        console.error('Failed to load game session');
        onReturnToMenu();
        return;
      }

      setSession(sessionData);

      // Convert session data to game state
      const loadedState = createInitialState();
      loadedState.board = sessionData.board as any;
      loadedState.currentPlayer = sessionData.current_player as any;
      loadedState.players = sessionData.players as any;
      loadedState.status = sessionData.status as any;
      loadedState.winner = sessionData.winner as any;
      loadedState.moveHistory = sessionData.move_history as any;

      setGameState(loadedState);

      // Subscribe to realtime updates
      await subscribeToGame();

    } catch (error) {
      console.error('Error loading session:', error);
      onReturnToMenu();
    }
  };

  const subscribeToGame = async () => {
    try {
      const realtimeManager = getRealtimeManager();

      await realtimeManager.subscribeToGameSession(
        sessionId,
        userId,
        playerNumber,
        {
          onMoveMade: handleOpponentMove,
          onPlayerConnected: handlePlayerConnectionChange,
          onGameEnded: handleGameEnded,
          onOpponentReconnected: handleOpponentReconnected,
          onError: handleError,
        }
      );

      setConnectionStatus('connected');

    } catch (error) {
      console.error('Failed to subscribe to game session:', error);
      setConnectionStatus('disconnected');
      startReconnection();
    }
  };

  const handleOpponentMove = (move: any, newGameState: any) => {
    console.log('Opponent made move:', move);
    setGameState(newGameState);
  };

  const handlePlayerConnectionChange = (playerNum: 1 | 2, connected: boolean) => {
    if (playerNum !== playerNumber) {
      setOpponentConnected(connected);
    }
  };

  const handleOpponentReconnected = () => {
    setOpponentConnected(true);
  };

  const handleGameEnded = (result: GameEndResult) => {
    console.log('Game ended:', result);
    setGameResult(result);
    setPlayerRatingChange(result.player1RatingChange);
    setOpponentRatingChange(result.player2RatingChange);
  };

  const handleError = (error: Error) => {
    console.error('Realtime error:', error);
    setConnectionStatus('disconnected');
    startReconnection();
  };

  const startReconnection = () => {
    setReconnectionState({
      attempting: true,
      attemptNumber: 1,
      lastAttempt: Date.now(),
    });
  };

  // Handle reconnection attempts
  useEffect(() => {
    if (!reconnectionState.attempting) return;

    const maxAttempts = 3;
    const delay = 2000;

    if (reconnectionState.attemptNumber > maxAttempts) {
      // Give up on reconnection
      setReconnectionState({ attempting: false, attemptNumber: 0, lastAttempt: 0 });
      onReturnToMenu();
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const realtimeManager = getRealtimeManager();

        // Resubscribe to game session
        await realtimeManager.subscribeToGameSession(
          sessionId,
          userId,
          playerNumber,
          {
            onMoveMade: handleOpponentMove,
            onPlayerConnected: handlePlayerConnectionChange,
            onGameEnded: handleGameEnded,
            onOpponentReconnected: handleOpponentReconnected,
            onError: handleError,
          }
        );

        // Request state resync
        await realtimeManager.requestResync();

        setConnectionStatus('connected');
        setReconnectionState({ attempting: false, attemptNumber: 0, lastAttempt: 0 });

      } catch (error) {
        console.error('Reconnection attempt failed:', error);
        setReconnectionState({
          attempting: true,
          attemptNumber: reconnectionState.attemptNumber + 1,
          lastAttempt: Date.now(),
        });
      }
    }, delay);

    return () => { clearTimeout(timeout); };
  }, [reconnectionState]);

  // Handle cell click
  const handleCellClick = useCallback(async (cellIndex: number) => {
    if (!isPlayerTurn || gameState.status !== 'playing') return;
    if (gameState.board[cellIndex] !== null) return;

    try {
      const realtimeManager = getRealtimeManager();

      // Create move object
      const move: Move = {
        type: 'place',
        cell: cellIndex as any,
        player: playerSymbol,
        timestamp: Date.now(),
      };

      // Optimistically update local state
      const newBoard = [...gameState.board];
      newBoard[cellIndex] = playerSymbol;

      const newPlayers = {
        ...gameState.players,
        [playerSymbol]: {
          ...gameState.players[playerSymbol],
          mp: Math.min(5, gameState.players[playerSymbol].mp + 1),
        },
      };

      const newGameState = {
        ...gameState,
        board: newBoard,
        players: newPlayers,
      };

      setGameState(newGameState);

      // Send move to opponent
      await realtimeManager.sendMove(move, newGameState);

      // Update database
      await updateGameState(sessionId, newGameState, move);
      await saveMove(sessionId, userId, playerSymbol, gameState.moveHistory.length + 1, move);

    } catch (error) {
      console.error('Failed to make move:', error);
      // Rollback optimistic update
      setGameState(gameState);
    }
  }, [gameState, isPlayerTurn, playerSymbol, sessionId, userId]);

  // Handle giving up on reconnection
  const handleGiveUp = async () => {
    try {
      await completeGame(sessionId, opponentSymbol, false, true);
    } catch (error) {
      console.error('Failed to abandon game:', error);
    }
    onReturnToMenu();
  };

  if (reconnectionState.attempting) {
    return (
      <ReconnectionOverlay
        attemptNumber={reconnectionState.attemptNumber}
        maxAttempts={3}
        onGiveUp={handleGiveUp}
      />
    );
  }

  if (gameResult || (gameState.status !== 'playing')) {
    const winner = gameResult?.winner || gameState.winner || null;
    const isDraw = gameResult?.isDraw || gameState.status === 'draw';

    return (
      <OnlineGameOver
        winner={winner}
        isDraw={isDraw}
        playerSymbol={playerSymbol}
        opponentUsername={opponentUsername}
        gameMode={gameMode}
        playerRatingChange={playerRatingChange}
        opponentRatingChange={opponentRatingChange}
        onPlayAgain={onPlayAgain}
        onReturnToMenu={onReturnToMenu}
      />
    );
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Online Game Status Bar */}
        <OnlineGameStatus
          opponentUsername={opponentUsername}
          playerNumber={playerNumber}
          playerSymbol={playerSymbol}
          opponentSymbol={opponentSymbol}
          playerClass={playerClass}
          opponentClass={opponentClass}
          isPlayerTurn={isPlayerTurn}
          opponentConnected={opponentConnected}
          connectionStatus={connectionStatus}
          gameMode={gameMode}
        />

        {/* Game Board */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6 shadow-xl">
          {/* Board */}
          <div className="grid grid-cols-3 gap-2 max-w-md mx-auto mb-6">
            {gameState.board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={!isPlayerTurn || cell !== null}
                className={`
                  aspect-square rounded-lg text-4xl font-bold transition-all
                  ${cell === 'X'
                    ? 'bg-cyan-500/30 text-cyan-400'
                    : cell === 'O'
                    ? 'bg-purple-500/30 text-purple-400'
                    : 'bg-gray-900/50 hover:bg-gray-700/50'
                  }
                  ${!isPlayerTurn ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {cell}
              </button>
            ))}
          </div>

          {/* Player Info */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {/* X Player */}
            <div className={`p-4 rounded-lg ${gameState.currentPlayer === 'X' ? 'bg-cyan-500/20 border border-cyan-500/50' : 'bg-gray-900/50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-cyan-400">X</span>
                <span className="text-sm text-gray-400">{playerNumber === 1 ? 'You' : opponentUsername}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">⚡</span>
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-full rounded-full transition-all"
                    style={{ width: `${(gameState.players.X.mp / 5) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-white">{gameState.players.X.mp}/5</span>
              </div>
            </div>

            {/* O Player */}
            <div className={`p-4 rounded-lg ${gameState.currentPlayer === 'O' ? 'bg-purple-500/20 border border-purple-500/50' : 'bg-gray-900/50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-purple-400">O</span>
                <span className="text-sm text-gray-400">{playerNumber === 2 ? 'You' : opponentUsername}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">⚡</span>
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-full rounded-full transition-all"
                    style={{ width: `${(gameState.players.O.mp / 5) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-white">{gameState.players.O.mp}/5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Forfeit Button */}
        <button
          onClick={handleGiveUp}
          className="w-full mt-4 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition-all"
        >
          🏳️ Forfeit Match
        </button>
      </div>
    </div>
  );
}
