# Architecture - X/O Tactics

## High-Level System Structure

```
┌─────────────────────────────────────────────────────────┐
│                     UI Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Board UI   │  │  Skill Panel │  │  Status Bar  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ (State queries, user actions)
                        │
┌───────────────────────▼─────────────────────────────────┐
│                  Game Controller                        │
│  - Turn management                                      │
│  - Action orchestration                                 │
│  - Game flow coordination                               │
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼──────┐  ┌────▼──────┐  ┌─────▼────────┐
│ Game Engine  │  │Skill System│  │  State Store │
│              │  │            │  │              │
│ - Board      │  │- Registry  │  │- Game state  │
│ - Win detect │  │- Validation│  │- History     │
│ - MP logic   │  │- Execution │  │- Persistence │
└──────────────┘  └────────────┘  └──────────────┘
```

---

## Major Components

### 1. State Store
**Responsibility**: Single source of truth for all game data

**Data Structure**:
```typescript
interface GameState {
  board: Board           // 3x3 grid
  currentPlayer: 'X' | 'O'
  players: {
    X: PlayerState
    O: PlayerState
  }
  status: 'playing' | 'won' | 'draw'
  winner?: 'X' | 'O' | 'draw'
  moveHistory: Move[]
  effects: BoardEffects   // frozen cells, shields, etc.
}

interface PlayerState {
  mp: number              // 0-5
  class: 'disruptor' | 'tactician'
  skipMpGain?: boolean    // flag for Double Step
}

interface BoardEffects {
  frozenCells: Map<string, number>  // cell -> turns remaining
  shieldedMarks: Set<string>        // cell positions
}
```

**Responsibilities**:
- Store current game state
- Provide read-only access to state
- Handle state updates (immutable)
- Maintain move history
- Persist/restore game state

**Key Functions**:
- `getState()`: Readonly game state
- `updateState(updater)`: Apply state transition
- `resetGame()`: Initialize new game
- `undoMove()`: Revert to previous state

---

### 2. Game Engine
**Responsibility**: Core game logic and rules enforcement

**Key Subsystems**:

#### Board Manager
- Initialize empty 3x3 board
- Validate cell positions
- Check cell occupancy
- Get/set cell values

#### Win Detector
- Check rows for 3-in-a-row
- Check columns for 3-in-a-row
- Check diagonals for 3-in-a-row
- Determine if game is won

#### Turn Manager
- Switch between X and O
- Handle turn start/end events
- Apply turn-based effects (frozen cell countdown)
- Check for game end conditions

#### MP Manager
- Add MP on normal placement (+1, max 5)
- Consume MP on skill usage
- Apply MP gain skipping (Double Step)
- Validate MP availability

#### Move Validator
- Check if cell is empty
- Check if cell is frozen
- Validate move legality

**Key Functions**:
- `placeMark(position)`: Execute normal placement
- `checkWin()`: Determine if current player won
- `checkDraw()`: Determine if board is full
- `switchTurn()`: Toggle between X and O
- `updateMP(player, amount)`: Adjust MP with validation

---

### 3. Skill System
**Responsibility**: Skill definition, validation, and execution

**Architecture**:
```
Skill Interface
    ▲
    │ implements
    │
    ├─► BaseSkill (abstract)
    │     ├─ validate() - Check MP, target, constraints
    │     └─ execute() - Apply skill effect
    │
    └─► Concrete Skills
          ├─ Shift
          ├─ Freeze
          ├─ Vanish
          ├─ DoubleStep
          ├─ Shield
          └─ Swap
```

**Skill Interface**:
```typescript
interface Skill {
  name: string
  cost: number
  description: string
  class: 'disruptor' | 'tactician'

  // Check if skill can be used
  canUse(gameState: GameState, target: Target): boolean

  // Apply skill effect
  use(gameState: GameState, target: Target): GameState

  // Get valid targets for this skill
  getValidTargets(gameState: GameState): Target[]
}
```

**Key Components**:

#### Skill Registry
- Map skill names to skill instances
- Lookup skills by class
- Provide skill metadata (cost, description)

#### Skill Validator
- Check MP availability
- Validate targeting rules
- Enforce global balance rules:
  - Anti-Line-Break Rule
  - Last Stand Rule
  - Skill-specific constraints

#### Skill Executor
- Apply skill effects to game state
- Handle side effects (MP consumption, turn end)
- Create new immutable state

---

### 4. Game Controller
**Responsibility**: Orchestrate game flow and coordinate components

**Key Responsibilities**:
- Handle user actions (place mark, use skill)
- Coordinate between State Store, Game Engine, and Skill System
- Enforce turn rules (one action per turn)
- Manage skill selection and targeting
- Trigger UI updates on state changes

**Key Functions**:
- `handlePlaceMark(position)`: Process normal placement
- `handleUseSkill(skillName, target)`: Process skill usage
- `selectSkill(skillName)`: Enter skill targeting mode
- `cancelSkill()`: Exit skill targeting mode
- `restartGame()`: Reset to initial state

---

### 5. UI Layer
**Responsibility**: Render game state and capture user input

**Key Components**:

#### Board UI
- Render 3x3 grid
- Display X/O marks
- Show visual effects (frozen cells, shields)
- Handle click events

#### Skill Panel
- Display available skills
- Show MP costs
- Highlight available/unavailable skills
- Handle skill selection

#### Status Bar
- Show current player
- Display MP for both players
- Show game status (playing, won, draw)
- Display active effects

#### Notifications
- Show error messages (invalid actions)
- Show game events (skill usage, turn changes)
- Display win/draw announcements

---

## Data Flow

### Normal Placement Flow
```
User clicks cell
    ▼
UI calls controller.handlePlaceMark(position)
    ▼
Controller validates move through Game Engine
    ▼
Game Engine checks: cell empty? cell frozen?
    ▼
If valid:
    - Update board
    - Add +1 MP to current player
    - Check for win/draw
    - Switch turn
    ▼
Update State Store
    ▼
UI re-renders with new state
```

### Skill Usage Flow
```
User selects skill from UI
    ▼
UI calls controller.selectSkill(skillName)
    ▼
UI enters targeting mode
    ▼
User clicks target cell(s)
    ▼
UI calls controller.handleUseSkill(skillName, target)
    ▼
Controller validates through Skill System
    ▼
Skill System checks:
    - Sufficient MP?
    - Valid target?
    - Balance rules (Anti-Line-Break, Last Stand)
    ▼
If valid:
    - Execute skill effect
    - Consume MP
    - End turn
    ▼
Update State Store
    ▼
UI re-renders with new state
```

---

## Design Patterns

### 1. Immutable State
- All state updates create new state objects
- Prevents accidental mutations
- Enables time-travel debugging (undo/redo)

### 2. Separation of Concerns
- Game logic independent of UI
- Skills isolated in own system
- State managed centrally

### 3. Strategy Pattern (Skills)
- Common interface for all skills
- Each skill encapsulates its own logic
- Easy to add new skills

### 4. Observer Pattern (State Updates)
- UI subscribes to state changes
- Automatic re-renders on state updates
- Decouples logic from presentation

---

## Module Structure (Recommended)

```
src/
├── core/               # Core game logic
│   ├── game-engine.ts
│   ├── board.ts
│   ├── win-detector.ts
│   ├── turn-manager.ts
│   └── mp-manager.ts
│
├── skills/             # Skill system
│   ├── skill-registry.ts
│   ├── skill-validator.ts
│   ├── base-skill.ts
│   ├── disruptor/
│   │   ├── shift.ts
│   │   ├── freeze.ts
│   │   └── vanish.ts
│   └── tactician/
│       ├── double-step.ts
│       ├── shield.ts
│       └── swap.ts
│
├── state/              # State management
│   ├── state-store.ts
│   ├── state-types.ts
│   └── initial-state.ts
│
├── controller/         # Game orchestration
│   └── game-controller.ts
│
├── ui/                 # UI components
│   ├── board/
│   ├── skill-panel/
│   ├── status-bar/
│   └── notifications/
│
├── utils/              # Utilities
│   ├── validators.ts
│   └── helpers.ts
│
└── types/              # Shared types
    └── game-types.ts
```

---

## Extension Points

### Adding New Skills
1. Create new skill class implementing `Skill` interface
2. Implement `canUse()`, `use()`, `getValidTargets()`
3. Register in `SkillRegistry`
4. Add to appropriate class

### Adding New Classes
1. Define new class type in types
2. Create 3 new skills
3. Update character selection UI

### AI Integration
1. Create `AIPlayer` class
2. Implement move selection logic (Minimax)
3. Integrate with Game Controller
4. Add difficulty settings

### Multiplayer
1. Add `GameServer` backend
2. Implement state synchronization
3. Add WebSocket communication
4. Create matchmaking UI
