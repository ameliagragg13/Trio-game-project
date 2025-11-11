# Trio Games - Retro Gaming Experience

A local web application featuring three classic games with a cyberpunk/retro gaming aesthetic. Built with React, TypeScript, and Vite.

## Features

- **Local Authentication**: Username/password authentication stored locally in the browser
- **Three Games**: Memory Matching, Tic Tac Toe, and Sudoku (placeholders ready for implementation)
- **Pixel Art Design**: Retro gaming aesthetic with pink/purple cyberpunk color palette
- **Modern UX**: Clean, responsive design with smooth animations

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **LocalStorage** - Local data persistence

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone or navigate to the project directory
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

### Building for Production

Build the project:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/       # React components
│   ├── Welcome.tsx
│   ├── Login.tsx
│   ├── SignUp.tsx
│   ├── Dashboard.tsx
│   ├── GameCard.tsx
│   └── GamePlaceholder.tsx
├── contexts/         # React Context providers
│   └── AuthContext.tsx
├── types/           # TypeScript type definitions
│   └── auth.ts
├── utils/           # Utility functions
│   └── auth.ts
└── styles/          # CSS stylesheets
    ├── global.css
    ├── welcome.css
    ├── auth.css
    └── dashboard.css
```

## Usage

1. **Welcome Screen**: Choose to log in or sign up
2. **Sign Up**: Create a new account with username and password
3. **Log In**: Access your account with your credentials
4. **Dashboard**: Select a game to play (currently placeholders)
5. **Log Out**: Return to the welcome screen

## Authentication

- All user data is stored locally in the browser's localStorage
- No external services or email verification required
- Passwords are stored in plain text (for local development only)

## Design

- **Color Palette**: Pink (#FF00FF, #FF1493) and Purple (#9D00FF, #8B00FF)
- **Font**: Press Start 2P (Google Fonts)
- **Style**: Pixel art aesthetic with retro gaming vibes

## Future Development

The game placeholders are ready for implementation:
- Memory Matching Game
- Tic Tac Toe
- Sudoku

## License

This project is for local development and personal use.
