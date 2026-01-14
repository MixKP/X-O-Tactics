# 🕹️ Project Identity: X/O Tactics (Turn-Based Skill Edition)

## 1. Vision & Core Idea
**X/O Tactics** is a reimagining of classic Tic-Tac-Toe.  
Instead of being only about placing marks, the game becomes a **turn-based tactical battle** where players manage **Energy (MP)** and deploy **Skills** at the right moment.

Core goals:
- Preserve the simplicity of classic Tic-Tac-Toe (3-in-a-row to win)
- Add meaningful strategic depth
- Prevent stalling, abuse, and infinite disruption loops

---

## 2. Game Overview
- Board size: **3x3**
- Two players: **X** and **O**
- Turn-based play
- A player wins by aligning **three of their own marks** (horizontal, vertical, or diagonal)

What makes it different:
- Energy (MP) resource system
- Skills that replace normal placement
- Every turn involves risk–reward decisions

---

## 3. Core Mechanics

### 3.1 Energy System (MP)
- All players start with **0 MP**
- Each time a player places a normal mark:
  - Gain **+1 MP**
- Maximum MP: **5**
- When using a Skill:
  - MP is consumed
  - **No MP is gained that turn**

---

### 3.2 Turn & Action Rules
- Each turn allows **1 Action**
- Possible Actions:
  1. Place a mark (X or O)
  2. Use a Skill
- Using a Skill **immediately ends the turn**
- No mark placement is allowed afterward  
  (unless the Skill explicitly allows it)

---

### 3.3 Cooldowns & Balance
- Powerful Skills may have cooldowns (future versions)
- Prevents repetitive Skill abuse
- Every Skill must define:
  - MP cost
  - Targeting rules
  - Balance constraints

---

## 4. Class System

Players choose a class **before the game starts**.  
Both players may choose the same class.

---

### 4.1 Class A: **The Disruptor**
Focus:
- Interference
- Board control
- Breaking opponent tempo

**Skills**

- **Shift** (2 MP)  
  Move one of your own marks to an adjacent empty cell (up, down, left, right).

- **Freeze** (3 MP)  
  Lock one empty cell:
  - No mark can be placed there
  - Lasts for **2 turns**

- **Vanish** (4 MP)  
  Remove one opponent mark.  
  **Restrictions:**
  - Cannot remove a mark that is part of a potential winning line (2-in-a-row).

---

### 4.2 Class B: **The Tactician**
Focus:
- Planning ahead
- Combo play
- Momentum control

**Skills**

- **Double Step** (3 MP)  
  Place **two marks in the same turn**.  
  - On the next turn, the player **does not gain MP**.

- **Shield** (2 MP)  
  Protect one of your marks:
  - Cannot be removed
  - Cannot be moved

- **Swap** (5 MP)  
  Swap positions between:
  - One of your marks
  - One opponent mark

---

## 5. Global Balance Rules (Anti-Cheat Design)

### 5.1 Anti-Line-Break Rule
- A Skill cannot remove an opponent’s mark
- If that mark is part of a line with **two aligned marks**
- Prevents endless denial of victory

---

### 5.2 Last Stand Rule (Critical Balance)
If a player has:
- Only **one mark left** on the board

Effect:
- Removal-based Skills (Clear / Vanish)  
  → **Cannot be used against that player**

Purpose:
- Prevent infinite loops
- Ensure the game always reaches an end
- Preserve fairness in endgame scenarios

---

## 6. UI / UX Requirements
- Clear 3x3 board display
- Always show:
  - MP of Player X
  - MP of Player O
- Visual indicators for:
  - Blocked / Frozen cells
  - Shielded marks
- Clear feedback when:
  - A Skill cannot be used (low MP / invalid target)
  - A player wins or the game ends in a draw

---

## 7. Technical Design Principles
- Code structure must:
  - Separate Game Logic, UI, and Skill System
  - Allow easy addition of new Skills
  - Be ready for AI players in the future
- Each Skill should:
  - Be encapsulated as a function or class
  - Validate conditions before execution
  - Avoid hardcoded state manipulation

---

## 8. Future Expansion Ideas
- Larger boards (4x4, 5x5)
- Passive abilities
- Ultimate Skills with charge mechanics
- AI difficulty levels
- Online or hot-seat multiplayer

---

## 9. Design Philosophy
> **Easy to Learn, Hard to Master**

X/O Tactics is not about memorization.  
Victory comes from:
- Timing
- Resource management
- Reading your opponent

Every Skill is a double-edged sword.  
Use it poorly—and you create your own defeat.