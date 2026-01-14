import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GameState, PlayerClass, AIDifficulty } from '../types';
import { createInitialState, makeMove, isValidMove, executeSkill } from '../core/game-engine';
import { GameBoard } from '../ui/board/GameBoard';
import { GameStatusDisplay } from '../ui/status/GameStatus';
import { ClassSelection } from '../ui/classes/ClassSelection';
import { PlayerPanel } from '../ui/players/PlayerPanel';
import { HowToPlay } from '../ui/skills/HowToPlay';
import { getSkillsForClass } from '../skills/skill-registry';
import { getAIMove } from '../ai/ai-engine';

type GameScreen = 'classSelect' | 'playing' | 'gameOver';

export function LocalGamePage() {
  const navigate = useNavigate();

  // Game state
  const [gameScreen, setGameScreen] = useState<GameScreen>('classSelect');
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [winningLine, setWinningLine] = useState<number[] | undefined>();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Class selection
  const [playerXClass, setPlayerXClass] = useState<PlayerClass | null>(null);
  const [playerOClass, setPlayerOClass] = useState<PlayerClass | null>(null);

  // AI mode
  const [isAIMode, setIsAIMode] = useState(false);
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty | null>(null);

  // Get skills for each player based on their class
  const playerXSkills = useMemo(() => {
    return playerXClass ? getSkillsForClass(playerXClass) : [];
  }, [playerXClass]);

  const playerOSkills = useMemo(() => {
    return playerOClass ? getSkillsForClass(playerOClass) : [];
  }, [playerOClass]);

  // ESC key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedSkill) {
          setSelectedSkill(null);
          setErrorMessage(null);
        } else if (showHowToPlay) {
          setShowHowToPlay(false);
        }
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => { window.removeEventListener('keydown', handleEsc); };
  }, [selectedSkill, showHowToPlay]);

  // AI turn handling
  useEffect(() => {
    if (
      isAIMode &&
      gameScreen === 'playing' &&
      gameState.currentPlayer === 'O' &&
      gameState.status === 'playing' &&
      aiDifficulty
    ) {
      const timer = setTimeout(() => {
        try {
          const aiMove = getAIMove(gameState, aiDifficulty);
          const newState = makeMove(gameState, aiMove.cellIndex as any);
          setGameState(newState);

          if (newState.status === 'won') {
            const lines = [
              [0, 1, 2], [3, 4, 5], [6, 7, 8],
              [0, 3, 6], [1, 4, 7], [2, 5, 8],
              [0, 4, 8], [2, 4, 6],
            ];

            for (const line of lines) {
              const [a, b, c] = line;
              if (
                newState.board[a] &&
                newState.board[a] === newState.board[b] &&
                newState.board[a] === newState.board[c]
              ) {
                setWinningLine(line);
                break;
              }
            }
          }

          if (newState.status === 'won' || newState.status === 'draw') {
            setGameScreen('gameOver');
          }
        } catch (error) {
          console.error('AI move error:', error);
        }
      }, 800);

      return () => { clearTimeout(timer); };
    }
  }, [gameState, gameScreen, isAIMode, aiDifficulty]);

  const handleStartGame = () => {
    if (playerXClass && (playerOClass || isAIMode)) {
      const newState = createInitialState();
      newState.playerClasses.X = playerXClass;
      newState.playerClasses.O = isAIMode ? playerXClass : playerOClass;
      setGameState(newState);
      setWinningLine(undefined);
      setGameScreen('playing');
    }
  };

  const handleCellClick = (index: number) => {
    if (isAIMode && gameState.currentPlayer === 'O') {
      return;
    }

    setErrorMessage(null);

    if (index < 0 || index > 8) {
      return;
    }

    try {
      let newState: GameState;

      if (selectedSkill) {
        newState = executeSkill(gameState, selectedSkill, index as any);
        setSelectedSkill(null);
      } else {
        if (!isValidMove(gameState, index as any)) {
          return;
        }
        newState = makeMove(gameState, index as any);
      }

      setGameState(newState);

      if (newState.status === 'won') {
        const lines = [
          [0, 1, 2], [3, 4, 5], [6, 7, 8],
          [0, 3, 6], [1, 4, 7], [2, 5, 8],
          [0, 4, 8], [2, 4, 6],
        ];

        for (const line of lines) {
          const [a, b, c] = line;
          if (
            newState.board[a] &&
            newState.board[a] === newState.board[b] &&
            newState.board[a] === newState.board[c]
          ) {
            setWinningLine(line);
            break;
          }
        }
      }

      if (newState.status === 'won' || newState.status === 'draw') {
        setGameScreen('gameOver');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid action';
      setErrorMessage(message);
      setSelectedSkill(null);
      console.error('Error:', error);
      setTimeout(() => { setErrorMessage(null); }, 3000);
    }
  };

  const handleRestart = () => {
    const newState = createInitialState();
    newState.playerClasses.X = playerXClass;
    newState.playerClasses.O = isAIMode ? playerXClass : playerOClass;
    setGameState(newState);
    setWinningLine(undefined);
    setSelectedSkill(null);
    setErrorMessage(null);
    setGameScreen('playing');
  };

  const handleBackToTitle = () => {
    navigate('/');
  };

  const handleSkillSelect = (skillName: string) => {
    setErrorMessage(null);
    if (skillName === '') {
      setSelectedSkill(null);
    } else {
      setSelectedSkill(skillName);
    }
  };

  const isAIThinking = isAIMode && gameState.currentPlayer === 'O' && gameScreen === 'playing';

  // Class Selection Screen
  if (gameScreen === 'classSelect') {
    return (
      <ClassSelection
        playerXClass={playerXClass}
        playerOClass={playerOClass}
        onPlayerXSelect={setPlayerXClass}
        onPlayerOSelect={setPlayerOClass}
        onStartGame={handleStartGame}
        onBack={handleBackToTitle}
        aiDifficulty={aiDifficulty}
        onAIDifficultySelect={setAIDifficulty}
        isAIMode={isAIMode}
        onAIModeToggle={() => {
          setIsAIMode(!isAIMode);
          if (!isAIMode) {
            setAIDifficulty(null);
          }
        }}
      />
    );
  }

  // Game Screen
  return (
    <div className="h-screen w-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">X/O Tactics</h1>
          <p className="text-gray-400 text-xs">
            {gameState.status === 'playing' ? '⚔️ Battle!' : '🏆 Game Over'}
            {isAIMode && <span className="ml-2 text-purple-400">• vs AI ({aiDifficulty})</span>}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => { setShowHowToPlay(true); }}
            className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
          >
            📖 Help
          </button>
          <button
            onClick={handleBackToTitle}
            className="px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600 transition-colors"
          >
            🏠 Menu
          </button>
        </div>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="flex-shrink-0 mx-auto max-w-md mt-2 animate-bounce z-10">
          <div className="bg-red-900 text-white px-4 py-2 rounded-lg text-sm text-center border border-red-700">
            ⚠️ {errorMessage}
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-2 p-2 overflow-hidden">
        {/* Player X */}
        <div className="lg:w-1/4 w-full">
          <PlayerPanel
            player="X"
            playerClass={playerXClass}
            mp={gameState.players.X.mp}
            isCurrentTurn={gameState.currentPlayer === 'X' && gameScreen === 'playing'}
            skills={playerXSkills}
            selectedSkill={selectedSkill}
            onSkillSelect={handleSkillSelect}
          />
        </div>

        {/* Center - Board */}
        <div className="lg:w-1/2 w-full flex flex-col items-center justify-center">
          {gameScreen === 'playing' && (
            <div className="mb-4 text-center">
              <div className={`inline-block px-4 py-2 rounded-lg ${
                gameState.currentPlayer === 'X'
                  ? 'bg-cyan-900/50 text-cyan-300'
                  : 'bg-orange-900/50 text-orange-300'
              }`}>
                <p className="text-sm font-bold">
                  {gameState.currentPlayer === 'X' ? '🔵' : '🟠'} {gameState.currentPlayer === 'X' ? 'Your' : (isAIMode ? 'AI\'s' : 'Player O\'s')} Turn
                  {isAIThinking && ' 🤖 Thinking...'}
                </p>
                {selectedSkill && !isAIThinking && (
                  <p className="text-xs text-purple-300 animate-pulse">🔮 Select target cell...</p>
                )}
                {!selectedSkill && !isAIThinking && (
                  <p className="text-xs text-gray-400">Place a mark or use a skill</p>
                )}
              </div>
            </div>
          )}

          <div className="w-full max-w-lg flex-1 flex items-center justify-center">
            <GameBoard
              board={gameState.board}
              effects={gameState.effects}
              onCellClick={handleCellClick}
              disabled={gameScreen !== 'playing' || isAIThinking}
              winningLine={winningLine}
              selectedSkill={selectedSkill}
            />
          </div>

          <div className="mt-4">
            <GameStatusDisplay
              status={gameState.status}
              winner={gameState.winner}
            />
          </div>

          {gameScreen === 'gameOver' && (
            <div className="flex gap-3 mt-4 justify-center">
              <button
                onClick={handleRestart}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
              >
                🔄 Play Again
              </button>
              <button
                onClick={handleBackToTitle}
                className="px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 active:scale-95 transition-all"
              >
                🏠 Main Menu
              </button>
            </div>
          )}
        </div>

        {/* Player O / AI */}
        <div className="lg:w-1/4 w-full">
          <PlayerPanel
            player="O"
            playerClass={isAIMode ? playerXClass : playerOClass}
            mp={gameState.players.O.mp}
            isCurrentTurn={gameState.currentPlayer === 'O' && gameScreen === 'playing'}
            skills={isAIMode ? [] : playerOSkills}
            selectedSkill={selectedSkill}
            onSkillSelect={handleSkillSelect}
          />
          {isAIMode && (
            <div className="mt-2 p-3 bg-purple-900/30 rounded-lg text-center">
              <p className="text-xs text-purple-300">🤖 AI Difficulty</p>
              <p className="text-lg font-bold text-white capitalize">{aiDifficulty}</p>
            </div>
          )}
        </div>
      </div>

      {showHowToPlay && (
        <HowToPlay onClose={() => { setShowHowToPlay(false); }} />
      )}
    </div>
  );
}
