# Implementation Plan - X/O Tactics

## Tech Stack (CONFIRMED)

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Custom store (React patterns)
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library

---

## Development Commands

```bash
npm run dev          # Start development server
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run build        # Build for production
npm run lint         # Lint code
npm run format       # Format code
```

---

## High-Level Development Phases

### Phase 1: Foundation (Core Game Engine)
**Goal**: Build a working game with basic mechanics, no skills yet.

### Phase 2: Skill System
**Goal**: Implement all skills for both classes with proper validation.

### Phase 3: UI/UX Polish & Class Selection
**Goal**: Complete game experience with class selection and visual polish.

### Phase 4: AI Integration (Future)
**Goal**: Add AI opponent(s) with difficulty levels.

### Phase 5: Multiplayer (Future)
**Goal**: Enable hot-seat and online multiplayer.

---

## Step-by-Step Build Plan

### Phase 1: Foundation (Core Game Engine)

#### 1.1 Project Setup

**Setup Commands**:
```bash
# Initialize Vite project
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install testing utilities
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Install linting/formatting
npm install -D eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Create folder structure
mkdir -p src/{core,skills/{disruptor,tactician},state,controller,ui/{board,status,skills,controls,classes,result},types,utils}
```

**Configuration Steps**:
- Configure `vite.config.ts` for Vitest
- Update `tailwind.config.js` content paths
- Add Tailwind directives to `src/index.css`
- Configure `.eslintrc.cjs`
- Configure `.prettierrc`

#### 1.2 Core Game State
- Define game state data structure
  - Board representation (3x3 array)
  - Current player (X or O)
  - Player MP (X: 0-5, O: 0-5)
  - Game status (playing, won, draw)
  - Move history (for undo/replay)
- Implement state initialization
- Create state update functions (immutable updates preferred)

#### 1.3 Basic Gameplay
- Implement mark placement logic
- Add turn switching
- Validate moves (cell must be empty)
- Implement win detection (check rows, columns, diagonals)
- Implement draw detection (board full, no winner)

#### 1.4 MP System
- Track MP for each player
- Add +1 MP on normal placement
- Enforce MP cap (max 5)
- Reset MP on game restart

#### 1.5 Core Architecture
- Separate game logic from UI
- Create game engine module/class
- Define clear APIs for:
  - Getting current state
  - Making moves
  - Checking game status
- Write unit tests for all game logic

#### 1.6 Basic UI
- Create 3x3 game board
- Display player turn indicator
- Show current MP for both players
- Implement click handler for cell placement
- Display win/draw messages
- Add restart button

---

### Phase 2: Skill System

#### 2.1 Skill Architecture
- Design skill interface/contract
  - `name`: string
  - `cost`: number (MP)
  - `validate(gameState, target)`: boolean
  - `execute(gameState, target)`: newGameState
- Create skill registry/factory
- Implement skill availability checking (MP sufficient?)

#### 2.2 The Disruptor Skills
- **Shift (2 MP)**
  - Implement adjacency validation (up, down, left, right)
  - Create move logic
  - Prevent moving into occupied cells
- **Freeze (3 MP)**
  - Track frozen cells (cell + duration)
  - Implement turn countdown
  - Prevent placement in frozen cells
- **Vanish (4 MP)**
  - Implement opponent mark removal
  - Add Anti-Line-Break validation (check for 2-in-a-row)
  - Add Last Stand validation (can't leave opponent with 0 marks)

#### 2.3 The Tactician Skills
- **Double Step (3 MP)**
  - Implement dual placement logic
  - Track "skip MP gain next turn" flag
  - Apply skip on next turn
- **Shield (2 MP)**
  - Track shielded marks
  - Prevent removal/movement of shielded marks
  - Visual indicator for shields
- **Swap (5 MP)**
  - Implement position swapping
  - Validate both positions are occupied
  - Prevent swapping shielded marks

#### 2.4 Skill Integration
- Connect skills to game state
- Implement skill execution flow:
  1. Validate MP cost
  2. Validate skill-specific conditions
  3. Execute skill
  4. Consume MP
  5. End turn
- Add skill selection UI

#### 2.5 Skill UI
- Create skill panel for each player
- Show available skills with MP costs
- Gray out unavailable skills (insufficient MP)
- Add skill targeting mode (click to select target)
- Display active effects (frozen cells, shields)

---

### Phase 3: UI/UX Polish & Class Selection

#### 3.1 Class Selection UI
- Create pre-game screen for class selection
- Show both classes (Disruptor, Tactician) with descriptions
- Player X selects class first
- Player O selects class second (can mirror or counter-pick)
- Store class choice in GameState
- Add "Start Game" button after both players selected

#### 3.2 Visual Design
- Create consistent color scheme (X: blue/cyan, O: red/orange)
- Design clean board layout
- Add animations for:
  - Mark placement
  - Skill effects
  - Turn transitions
  - Win/draw announcements

#### 3.3 Visual Feedback
- Highlight current player
- Show MP bars/numbers prominently
- Display frozen cells with visual overlay
- Show shielded marks with visual indicator
- Add error messages for invalid actions
- Show skill availability at a glance

#### 3.4 Game Flow & Controls
- Implement game flow: Title → Class Select → Game → Results → Restart
- Add restart button (accessible during and after game)
- Add win/draw announcements with clear messaging
- Add "Play Again" button on results screen
- Add undo button (optional)
- Add pause menu (optional)
- Add game history view (optional)

#### 3.5 Responsive Design
- Ensure board scales on mobile
- Optimize touch targets for mobile
- Adjust layout for different screen sizes

#### 3.6 Accessibility
- Keyboard navigation support
- Screen reader announcements for game events
- High contrast mode
- Clear visual indicators beyond color

---

### Phase 4: AI Integration

#### 4.1 AI Architecture
- Design AI interface
- Create AI difficulty levels:
  - Easy: Random moves
  - Medium: Basic heuristic (block wins, take wins)
  - Hard: Minimax with alpha-beta pruning

#### 4.2 AI Implementation
- Implement state evaluation function
  - Score based on: potential wins, MP advantage, board control
- Implement Minimax algorithm
  - Depth limit (3-5 moves ahead)
  - Alpha-beta pruning for efficiency
  - Include skills in decision tree
- Add move ordering for better pruning

#### 4.3 AI UI
- Add difficulty selector
- Add "Play vs AI" mode
- Show AI "thinking" indicator

---

### Phase 5: Multiplayer (Optional)

#### 5.1 Hot-Seat Multiplayer
- Implement player turn visibility
- Add "pass device" prompt
- Hide hands/state between turns (if using hidden info)

#### 5.2 Online Multiplayer
- Set up backend (Node.js + Socket.IO or equivalent)
- Implement matchmaking lobby
- Create game room management
- Implement real-time state synchronization
- Add reconnection handling
- Create player matchmaking UI

#### 5.3 Additional Features
- Player profiles and stats
- Match history
- Leaderboard
- Friend system

---

## Testing Strategy

### Unit Tests
- Game logic (win detection, MP calculations)
- Skill validation and execution
- State management
- AI decision-making

### Integration Tests
- Full game flow
- Skill combinations
- Edge cases (Last Stand, Anti-Line-Break)

### E2E Tests
- Complete user journeys
- Multiplayer scenarios
- Cross-browser testing

---

## Deployment Plan

1. **Build**: Compile for production
2. **Test**: Run full test suite
3. **Deploy**: Push to hosting platform (Vercel/Netlify)
4. **Monitor**: Set up error tracking and analytics
5. **Iterate**: Gather feedback and improve

---

## MVP Definition

**Minimum Viable Product** includes:
- ✅ Complete game design documentation
- ⏳ 3x3 board with X/O gameplay
- ⏳ MP system
- ⏳ Both classes with all 6 skills
- ⏳ Win/draw detection
- ⏳ Balance rules enforced
- ⏳ Hot-seat multiplayer
- ⏳ Basic responsive UI

**Post-MVP**:
- AI opponent
- Online multiplayer
- Advanced features
