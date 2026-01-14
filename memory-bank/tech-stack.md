# Tech Stack - X/O Tactics

## Status: ✅ CONFIRMED

Technology stack has been finalized as of 2026-01-14.

---

## Final Selection

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **State Management**: Custom store (using React patterns)
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library

### Development Tools
- **Linting**: ESLint
- **Formatting**: Prettier
- **Package Manager**: npm

### Platform Target
- **Primary**: Web browser (Chrome, Firefox, Safari, Edge)
- **Responsive**: Desktop and mobile

---

## Development Commands

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

---

## Setup Commands

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

---

## Project Initialization

See the approved implementation plan for detailed configuration steps:
- Configure `vite.config.ts` for Vitest
- Update `tailwind.config.js` content paths
- Add Tailwind directives to `src/index.css`
- Configure `.eslintrc.cjs`
- Configure `.prettierrc`

---

## Rationale for Choices

### React + TypeScript + Vite
- **TypeScript**: Type safety for complex game logic
- **React**: Huge ecosystem, great community support
- **Vite**: Excellent DX with instant HMR, fast builds
- **Easy deployment**: Can deploy as static site to Vercel/Netlify

### Custom State Store
- **Lightweight**: No external dependencies for state management
- **Simple**: React Context + useReducer patterns
- **Sufficient**: Game state is simple enough for custom solution

### Tailwind CSS
- **Rapid development**: Utility-first approach
- **Responsive**: Built-in responsive utilities
- **Customizable**: Easy to theme for game colors

### Vitest
- **Native ESM**: Works with Vite out of the box
- **Fast**: Same configuration as Vite
- **Compatible**: Jest-like API for familiarity

---

## Future Considerations (Post-MVP)

### Backend (if adding online multiplayer)
- **Node.js + Express**: Same language as frontend
- **Socket.IO**: Real-time WebSocket connections
- **Deployment**: Railway, Render, or similar

### AI Enhancement
- **TypeScript Minimax**: Sufficient for basic AI
- **Python backend**: If ML-based AI needed
- **Web Workers**: Prevent UI blocking during AI calculation

### Desktop/Mobile
- **Tauri**: For desktop apps (smaller than Electron)
- **Capacitor**: For mobile apps
