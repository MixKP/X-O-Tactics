# Game Design Document - X/O Tactics

## Core Feeling
Tactical turn-based gameplay where every decision matters. The tension of managing limited resources (MP) while deciding between immediate gains and long-term strategy. A chess-like mental duel compressed into quick, intense rounds.

## Game Fantasy
You are a tactical commander on a 3x3 battlefield. Instead of merely placing marks, you wield special abilities that can turn the tide of battle. You must outthink your opponent by:
- Managing your energy reserves wisely
- Timing your skills for maximum impact
- Adapting to an ever-changing board state

## Target Players
- **Primary**: Fans of strategy games who want quick, tactical gameplay
- **Secondary**: Players who enjoy classic Tic-Tac-Toe but crave more depth
- **Skill Level**: Easy to learn, hard to master

## Player Experience

### What Players Should Feel
1. **Tension**: Every turn matters—wasting MP or missing a skill opportunity can cost the game
2. **Empowerment**: Skills give you agency beyond simple mark placement
3. **Outsmarting**: Victory comes from reading your opponent, not memorization
4. **Replayability**: Different class combinations create varied matchups

### Core Gameplay Loop
1. Assess current board state and MP levels
2. Evaluate: normal placement vs. skill usage
3. Execute action (place mark or use skill)
4. Respond to opponent's move
5. Repeat until victory or draw

### Emotional Journey
- **Early Game**: Cautious buildup, accumulating MP
- **Mid Game**: Critical decisions—when to commit to skills
- **Late Game**: Desperate tactics or final strategic pushes

## Project Goals

### Must Have (MVP)
- [x] Complete game design documentation
- [ ] 3x3 board with X/O turn-based play
- [ ] MP system (0-5, gain +1 per normal placement)
- [ ] Two playable classes with 3 skills each
- [ ] Win detection (3-in-a-row)
- [ ] Balance rules (Anti-Line-Break, Last Stand)
- [ ] Basic UI showing board, MP, and skill availability

### Should Have
- [ ] Clear visual feedback for all game states
- [ ] Skill validation (MP checks, targeting rules)
- [ ] Undo/reset functionality
- [ ] Hot-seat multiplayer (same device)

### Could Have (Future)
- [ ] AI opponent with difficulty levels
- [ ] Online multiplayer
- [ ] Larger board sizes (4x4, 5x5)
- [ ] Additional classes and skills
- [ ] Passive abilities
- [ ] Ultimate skills with charge mechanics
- [ ] Match history and replay

## Non-Negotiable Design Principles

### 1. No Infinite Loops
The game must always progress toward an end state. All skills must be designed with constraints that prevent stalling or endless disruption.

### 2. Meaningful Choices
Every turn should present a real decision:
- Build MP now or spend it now?
- Which skill to use?
- When is the right moment to commit?

### 3. Prevent Unfair Advantages
- Anti-Line-Break Rule: Can't destroy opponent's 2-in-a-row
- Last Stand Rule: Can't completely eliminate a player's presence
- Every skill must have counterplay

### 4. Clarity Over Complexity
Rules must be intuitive. UI must make state visible at a glance:
- MP levels for both players
- Active effects (frozen cells, shields)
- Available skills and costs
