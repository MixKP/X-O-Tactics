import type { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { GameState, Move, Player } from '../types';

export interface RealtimeCallbacks {
  onMoveMade: (move: Move, gameState: GameState) => void;
  onPlayerConnected: (playerNumber: 1 | 2, connected: boolean) => void;
  onGameEnded: (result: GameEndResult) => void;
  onOpponentReconnected: () => void;
  onError?: (error: Error) => void;
}

export interface GameEndResult {
  winner: Player | null;
  isDraw: boolean;
  reason: 'won' | 'draw' | 'abandoned' | 'disconnect';
  player1RatingChange?: number;
  player2RatingChange?: number;
}

export interface MoveBroadcastPayload {
  type: 'move_made';
  move: Move;
  gameState: GameState;
  playerNumber: 1 | 2;
}

export interface PlayerConnectedPayload {
  type: 'player_connected';
  playerNumber: 1 | 2;
  playerId: string;
  connected: boolean;
}

export interface GameEndedPayload {
  type: 'game_ended';
  result: GameEndResult;
}

class RealtimeManager {
  private channel: RealtimeChannel | null = null;
  private userId: string | null = null;
  private playerNumber: 1 | 2 | null = null;
  private callbacks: RealtimeCallbacks | null = null;

  /**
   * Subscribe to a game session's realtime channel
   */
  async subscribeToGameSession(
    sessionId: string,
    userId: string,
    playerNumber: 1 | 2,
    callbacks: RealtimeCallbacks
  ): Promise<void> {
    this.userId = userId;
    this.playerNumber = playerNumber;
    this.callbacks = callbacks;

    const channelName = `game_session:${sessionId}`;

    this.channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    // Listen for opponent moves
    this.channel.on('broadcast', { event: 'move_made' }, (payload) => {
      console.log('Received move from opponent:', payload);
      const data = payload.payload as MoveBroadcastPayload;
      if (this.callbacks) {
        this.callbacks.onMoveMade(data.move, data.gameState);
      }
    });

    // Listen for player connection changes
    this.channel.on('presence', { event: 'sync' }, () => {
      this.handlePresenceSync();
    });

    this.channel.on('presence', { event: 'join' }, ({ key }) => {
      console.log('Player joined:', key);
      this.handlePresenceSync();
    });

    this.channel.on('presence', { event: 'leave' }, ({ key }) => {
      console.log('Player left:', key);
      this.handlePresenceSync();
    });

    // Listen for game end
    this.channel.on('broadcast', { event: 'game_ended' }, (payload) => {
      console.log('Game ended:', payload);
      const data = payload.payload as GameEndedPayload;
      if (this.callbacks) {
        this.callbacks.onGameEnded(data.result);
      }
    });

    // Subscribe to the channel
    await this.channel.subscribe((status) => {
      console.log('Subscription status:', status);
      if (status === 'CHANNEL_ERROR') {
        console.error('Failed to subscribe to game channel');
        if (this.callbacks?.onError) {
          this.callbacks.onError(new Error('Failed to subscribe to game channel'));
        }
      }
    });

    console.log('Subscribed to game session:', sessionId);
  }

  /**
   * Send a move to the opponent
   */
  async sendMove(move: Move, gameState: GameState): Promise<void> {
    if (!this.channel) {
      throw new Error('Not subscribed to any game session');
    }

    const payload: MoveBroadcastPayload = {
      type: 'move_made',
      move: move,
      gameState: gameState,
      playerNumber: this.playerNumber!,
    };

    await this.channel.send({
      type: 'broadcast',
      event: 'move_made',
      payload,
    });

    console.log('Sent move:', move);
  }

  /**
   * Broadcast that player has reconnected
   */
  async sendReconnected(): Promise<void> {
    if (!this.channel) {
      throw new Error('Not subscribed to any game session');
    }

    const payload: PlayerConnectedPayload = {
      type: 'player_connected',
      playerNumber: this.playerNumber!,
      playerId: this.userId!,
      connected: true,
    };

    await this.channel.send({
      type: 'broadcast',
      event: 'player_connected',
      payload,
    });
  }

  /**
   * Request a full state resync (for reconnection)
   */
  async requestResync(): Promise<void> {
    if (!this.channel) {
      throw new Error('Not subscribed to any game session');
    }

    await this.channel.send({
      type: 'broadcast',
      event: 'request_resync',
      payload: {
        playerId: this.userId,
        playerNumber: this.playerNumber,
      },
    });
  }

  /**
   * Handle presence state synchronization
   */
  private handlePresenceSync(): void {
    if (!this.channel || !this.callbacks) return;

    const state = this.channel.presenceState() as RealtimePresenceState;

    // Check opponent connection status
    const opponentNumber = this.playerNumber === 1 ? 2 : 1;
    const opponentKeyPrefix = `player_${opponentNumber}_`;

    let opponentConnected = false;
    for (const [key, presences] of Object.entries(state)) {
      if (key.startsWith(opponentKeyPrefix) && presences.length > 0) {
        opponentConnected = true;
        break;
      }
    }

    console.log('Opponent connected:', opponentConnected);

    this.callbacks.onPlayerConnected(opponentNumber, opponentConnected);
  }

  /**
   * Unsubscribe from the game session
   */
  async unsubscribe(): Promise<void> {
    if (this.channel) {
      await supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.userId = null;
    this.playerNumber = null;
    this.callbacks = null;

    console.log('Unsubscribed from game session');
  }

  /**
   * Get current subscription status
   */
  isSubscribed(): boolean {
    return this.channel !== null;
  }
}

// Singleton instance
let realtimeManager: RealtimeManager | null = null;

/**
 * Get the singleton realtime manager instance
 */
export function getRealtimeManager(): RealtimeManager {
  if (!realtimeManager) {
    realtimeManager = new RealtimeManager();
  }
  return realtimeManager;
}

/**
 * Reset the singleton (for testing)
 */
export function resetRealtimeManager(): void {
  if (realtimeManager) {
    realtimeManager.unsubscribe();
  }
  realtimeManager = null;
}
