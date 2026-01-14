/**
 * Game session service exports
 */

export { createOnlineGameSession, getGameSession, updateGameState, saveMove, getMoveHistory, completeGame, abandonSession, updatePlayerConnection, deserializeEffects, isSessionAbandoned } from './game-session-service';
export type { OnlineGameSession, CreateSessionParams } from './game-session-service';
