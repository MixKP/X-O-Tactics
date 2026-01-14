# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Memory Bank Workflow

**Before starting any work**: Read the `memory-bank/` directory to understand project context.
- `memory-bank/architecture.md` - System structure, component responsibilities, data flow
- `memory-bank/tech-stack.md` - Technology decisions and build commands
- `memory-bank/implementation-plan.md` - Development phases and step-by-step roadmap
- `memory-bank/progress.md` - Development log, milestones, blockers, decisions
- `memory-bank/game-design-document.md` - Core feeling, player experience, design philosophy

**After completing tasks**: Update `memory-bank/progress.md` with:
- Completed features
- Decisions made
- New blockers or issues
- Updated milestone status

**Note**: The memory-bank contains planning documents from early development. The project is now fully implemented with all features complete. Refer to the actual codebase for current implementation.

## Project Overview

**X/O Tactics** is a turn-based tactical battle game based on Tic-Tac-Toe with an MP system and class-based skills. The project includes local PvP, AI opponents (Easy/Medium/Hard), and competitive online multiplayer with ELO rankings.

**Current Status**: ✅ Fully implemented with core gameplay, all 6 skills, AI opponents with 3 difficulty levels, authentication, real-time matchmaking, and ELO ranking system.

**Implementation Progress**: All core features complete (see memory-bank/progress.md for detailed status).

## Game Concept

- **Board**: 3x3 grid
- **Players**: X and O
- **Win Condition**: Three marks in a row (horizontal, vertical, or diagonal)
- **Twist**: Energy (MP) system and class-based Skills

### Core Mechanics

1. **Energy System (MP)**
   - Players start with 0 MP
   - Normal mark placement: +1 MP (max 5 MP)
   - Using a Skill: consumes MP, no MP gained that turn

2. **Turn Structure**
   - One action per turn: place a mark OR use a Skill
   - Using a Skill immediately ends the turn

3. **Class System**
   - Players choose a class before game start
   - **The Disruptor**: Focus on interference and board control
   - **The Tactician**: Focus on planning and combo play

## Architecture Principles

### Separation of Concerns
- **Game Logic** (`src/core/`): Board state, win detection, turn management
- **Skill System** (`src/skills/`): Modular, encapsulated skill functions
- **UI** (`src/ui/`, `src/routes/`): Presentation layer using React
- **Online Services** (`src/services/`, `src/lib/`): Supabase integration for multiplayer

### Skill Implementation
Each skill implements the `SkillDefinition` interface:
- `validate()`: Check MP, target, constraints before execution
- `execute()`: Apply skill effect, return new immutable state
- Skills are registered in `src/skills/skill-registry.ts`

### Global Balance Rules (CRITICAL - MUST ENFORCE)

These rules prevent game-breaking exploits. Every skill that removes marks MUST enforce:

1. **Anti-Line-Break Rule**: Skills cannot remove opponent marks that are part of a 2-in-a-row alignment
   - Before executing a removal skill, check if the target mark is part of any line with 2 aligned marks
   - If yes, block the skill usage

2. **Last Stand Rule**: If a player has only one mark left, removal-based Skills cannot be used against them
   - Before executing a removal skill, count opponent's marks on the board
   - If count is 1, block the skill usage

**Implementation Note**: These validations are centralized in `src/skills/skill-validator.ts` and must be used by all removal-based skills (Vanish, Swap).

### Implemented Skills

**The Disruptor**:
- `shift` (2 MP): Move your mark to adjacent empty cell
- `freeze` (3 MP): Lock an empty cell for 2 turns
- `vanish` (4 MP): Remove one opponent mark (with Anti-Line-Break restriction)

**The Tactician**:
- `doubleStep` (3 MP): Place two marks, but skip MP gain next turn
- `shield` (2 MP): Protect your mark from removal/movement
- `swap` (5 MP): Swap your mark with opponent's mark

## Development Commands

```bash
# Start development server (http://localhost:5173)
npm run dev

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run a specific test file
npm run test -- path/to/test.test.ts

# Run tests with coverage
npm run test -- --coverage

# Build for production (includes type checking)
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint

# Format code with Prettier
npm run format
```

**CI/CD**: The project uses GitHub Actions for continuous integration. See `.github/workflows/ci.yml`. Deployments to Vercel happen automatically on push to main. See `DEPLOYMENT.md` for details.

## Tech Stack

- **Frontend**: React 18.3 + TypeScript 5.6, Vite 6.0
- **Styling**: Tailwind CSS 3.4
- **State Management**: React hooks (useState, useEffect, useMemo)
- **Backend**: Supabase 2.90 (PostgreSQL, authentication, database, real-time WebSocket)
- **Testing**: Vitest 2.1 + React Testing Library
- **Routing**: React Router v7.12
- **Linting/Formatting**: ESLint 9, Prettier 3.4

## Data Structures

The game state uses TypeScript interfaces. State MUST be immutable:

```typescript
interface GameState {
  board: Board           // 3x3 grid: (null | 'X' | 'O')[]
  currentPlayer: 'X' | 'O'
  players: {
    X: PlayerState
    O: PlayerState
  }
  status: 'playing' | 'won' | 'draw'
  winner?: 'X' | 'O'
  moveHistory: Move[]
  effects: BoardEffects
  playerClasses: {
    X: PlayerClass | null
    O: PlayerClass | null
  }
}

interface PlayerState {
  mp: number              // 0-5
  skipMpGain?: boolean    // flag for Double Step skill
}

interface BoardEffects {
  frozenCells: Map<string, number>  // cell -> turns remaining
  shieldedMarks: Set<string>        // cell positions
}
```

**CRITICAL**: All state updates must create new objects, never mutate existing state. Use spread operators and immutable update patterns.

## Component Architecture

```
src/
├── core/                    # Core game logic
│   ├── game-engine.ts       # Main game state functions, move execution
│   ├── win-detector.ts      # Win condition checking (3-in-a-row)
│   └── mp-manager.ts        # MP management utilities
│
├── skills/                  # Skill system
│   ├── skill-registry.ts    # Maps skill names to definitions
│   ├── skill-validator.ts   # Balance rules enforcement (Anti-Line-Break, Last Stand)
│   ├── disruptor/           # Disruptor class skills
│   │   ├── shift.ts         # Move mark to adjacent cell (2 MP)
│   │   ├── freeze.ts        # Lock empty cell for 2 turns (3 MP)
│   │   └── vanish.ts        # Remove opponent mark (4 MP)
│   └── tactician/           # Tactician class skills
│       ├── doubleStep.ts    # Place two marks, skip MP gain (3 MP)
│       ├── shield.ts        # Protect mark from removal/movement (2 MP)
│       └── swap.ts          # Swap positions with opponent mark (5 MP)
│
├── services/                # Online multiplayer services
│   └── game-session-service.ts  # Session CRUD, ELO rating updates, matchmaking
│
├── lib/                     # External service integration
│   ├── supabase.ts          # Supabase client configuration & auth helpers
│   └── realtime-manager.ts  # WebSocket connection management for online play
│
├── ai/                      # AI opponent system
│   └── ai-engine.ts         # AI with 3 difficulties (random, heuristic, minimax)
│
├── types/                   # TypeScript type definitions
│   ├── state.ts             # Game state, players, moves, effects
│   ├── ai.ts                # AI difficulty, move scoring
│   └── auth.ts              # Authentication types
│
├── utils/                   # Utility functions
│   ├── board.ts             # Board manipulation helpers (empty check, cell access)
│   └── effects.ts           # Frozen/shield effects management
│
├── ui/                      # UI components (presentational)
│   ├── board/               # Game board rendering with cell interaction
│   ├── skills/              # Skill panels, buttons, targeting UI
│   ├── status/              # Game status, player info displays
│   ├── controls/            # Game controls, headers, navigation
│   ├── classes/             # Class selection UI
│   ├── title/               # Title screen
│   ├── auth/                # Login/register screens
│   └── online/              # Online game UI components
│
├── routes/                  # Page components (routing via React Router)
│   ├── HomePage.tsx         # Title screen with game mode selection
│   ├── LocalGamePage.tsx    # Local PvP and AI gameplay
│   ├── LoginPage.tsx        # Authentication entry point
│   ├── RegisterPage.tsx     # New user registration
│   ├── DashboardPage.tsx    # User profile, stats, match history
│   ├── MatchmakingPage.tsx  # Competitive matchmaking queue
│   └── MatchPage.tsx        # Online gameplay with real-time sync
│
├── hooks/                   # Custom React hooks
│   └── useGameState.ts      # Game state management hook
│
└── test/                    # Test configuration
    └── setup.ts             # Vitest + React Testing Library setup
```

**Test files**: Co-located with source files (e.g., `game-engine.test.ts` next to `game-engine.ts`).

## Data Flow

### Normal Placement Flow
```
User clicks cell
    → UI calls makeMove(gameState, cellIndex)
    → Game Engine validates (cell empty? not frozen? game active?)
    → Update board, add MP, check win/draw
    → Switch turn
    → Return new immutable state
    → UI re-renders with new state
```

### Skill Usage Flow
```
User selects skill from UI
    → UI sets selectedSkill state
    → User clicks target cell
    → UI calls executeSkill(gameState, skillName, target)
    → Skill validates (MP? valid target? balance rules?)
    → Skill executes, consumes MP
    → Check win/draw
    → Switch turn
    → Return new immutable state
    → UI re-renders with new state
```

### Online Match Flow
```
User enters matchmaking
    → game-session-service.ts creates entry in matchmaking_queue
    → Supabase Realtime listens for match
    → When paired, create game_sessions record
    → realtime-manager.ts establishes WebSocket connection
    → Players make moves → updateGameState() syncs to database
    → Realtime subscription triggers update in opponent's UI
    → Game ends → completeGame() updates ELO ratings
```

## Environment Setup

### Required Environment Variables
Create a `.env` file in the project root with:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get these values from your Supabase project settings.

### Database Setup
1. Create a new Supabase project at https://supabase.com
2. Run the SQL schema from `supabase/schema.sql` in the Supabase SQL Editor
   - This sets up tables for profiles, ELO ratings, matches, matchmaking, and game sessions
3. Enable Realtime for the `game_sessions` table in Supabase dashboard
4. Configure Row Level Security (RLS) policies as defined in the schema

See `supabase/SETUP-GUIDE.md` for detailed setup instructions.

### Local Development
1. Install dependencies: `npm install`
2. Set up `.env` file with Supabase credentials
3. Start dev server: `npm run dev`
4. Open http://localhost:5173

## Supabase Integration

### Database Schema
Run `supabase/schema.sql` in your Supabase SQL Editor to set up:
- `profiles` - User data (username, stats)
- `elo_ratings` - ELO by game mode (competitive, casual)
- `matches` - Match history for leaderboards
- `matchmaking_queue` - Real-time matchmaking pool
- `game_sessions` - Active online games with state sync
- `game_moves` - Move-by-move history for replay

### Key Supabase Functions
- `find_match()` - Finds opponent in matchmaking queue
- `create_game_session()` - Creates new online game record
- `update_game_state()` - Syncs game state via Realtime
- `complete_online_game(session_id, winner, is_draw, abandoned)` - Updates ELO ratings
- ELO calculation uses K=32 factor with standard formula

For detailed setup instructions, see `supabase/SETUP-GUIDE.md`

## Deployment

The project is configured for deployment to Vercel. See `DEPLOYMENT.md` for comprehensive deployment instructions.

**Quick deploy**:
```bash
npm install -g vercel
vercel
```

**Environment variables** (required for production):
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

**Automatic deployments**: Connected to GitHub, Vercel auto-deploys on push to main branch and creates preview deployments for PRs.

## Adding New Features

### Adding a New Skill
1. Create skill file in `src/skills/disruptor/` or `src/skills/tactician/`
2. Implement `SkillDefinition` interface with `validate()` and `execute()`
3. Import and add to `SKILL_REGISTRY` in `src/skills/skill-registry.ts`
4. Add to `SkillName` type in `src/types/state.ts`
5. Update UI to display new skill (if needed)

### Adding a New Game Mode
1. Update types to include new mode
2. Add route in `src/App.tsx`
3. Create page component in `src/routes/`
4. Update database schema if storing results

### Modifying AI Difficulty
AI logic is in `src/ai/ai-engine.ts`:
- **Easy**: Random valid moves
- **Medium**: Heuristic-based (takes wins, blocks opponent, prefers center, otherwise random)
- **Hard**: Minimax algorithm with alpha-beta pruning (depth 4-5)

To adjust difficulty:
1. Modify evaluation function in `getHardAIMove()` to weight different factors
2. Adjust search depth (higher = smarter but slower)
3. Tune heuristic scoring in medium AI

### Testing
Tests are co-located alongside source files (e.g., `src/core/game-engine.test.ts`).

Run all tests: `npm run test`
Run specific test file: `npm run test -- path/to/test.test.ts`
Run tests in watch mode: `npm run test:watch`
Run tests with coverage: `npm run test -- --coverage`

**CI/CD**: GitHub Actions automatically runs tests, linting, and type checking on all pushes and PRs.

## Common Issues

### State Not Updating
Make sure you're creating new objects, not mutating:
```typescript
// ❌ WRONG - mutates state
gameState.players[currentPlayer].mp += 1;

// ✅ CORRECT - creates new state
{
  ...gameState,
  players: {
    ...gameState.players,
    [currentPlayer]: {
      ...gameState.players[currentPlayer],
      mp: gameState.players[currentPlayer].mp + 1
    }
  }
}
```

### Skill Validation Not Working
All skills must:
1. Check MP availability via `validateMP()` from `skill-validator.ts`
2. Validate target cell (empty, not frozen, etc.)
3. For removal skills: check Anti-Line-Break and Last Stand rules

### Online Moves Not Syncing
Ensure:
1. Realtime is enabled in Supabase dashboard
2. `realtime-manager.ts` is properly subscribed to game_sessions channel
3. Both players are subscribed to the same channel (session ID)
4. `updateGameState()` is called after every move

## Design Philosophy

> **Easy to Learn, Hard to Master**

Victory comes from timing, resource management, and reading the opponent—not memorization. Every Skill is a double-edged sword.

When implementing new features:
- Keep UI clean and intuitive
- Provide clear visual feedback
- Balance is more important than complexity
- Test with real players before committing to balance changes
