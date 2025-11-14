import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GameCard from './GameCard';
import GameModal from './GameModal';
import { getGameStats } from '../utils/gameStats';
import '../styles/dashboard.css';

interface GameInfo {
  title: string;
  description: string;
  detailedDescription: string;
  gameName: string;
}

const games: GameInfo[] = [
  {
    title: "Memory Matching",
    description: "Test your memory with this classic matching game",
    detailedDescription: "Flip cards to find matching pairs! Test your memory skills by remembering the positions of cards and matching them. The goal is to find all pairs with the fewest number of flips. Challenge yourself with different difficulty levels!",
    gameName: "memory"
  },
  {
    title: "Tic Tac Toe",
    description: "Play the classic X and O game",
    detailedDescription: "The classic game of Tic Tac Toe! Take turns placing X's and O's on a 3x3 grid. Be the first to get three in a row horizontally, vertically, or diagonally. Play against a friend or challenge the computer!",
    gameName: "tictactoe"
  },
  {
    title: "Sudoku",
    description: "Solve number puzzles and challenge your mind",
    detailedDescription: "Fill in the 9x9 grid so that each row, column, and 3x3 box contains the digits 1 through 9 exactly once. Start with easy puzzles and work your way up to expert level. Perfect your logic and problem-solving skills!",
    gameName: "sudoku"
  }
];

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedGame, setSelectedGame] = useState<GameInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gameStats, setGameStats] = useState<{ memory: number; tictactoe: number; sudoku: number }>({ memory: 0, tictactoe: 0, sudoku: 0 });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Refresh game stats when component mounts, user changes, or when returning from a game
  useEffect(() => {
    const refreshStats = async () => {
      const stats = await getGameStats();
      setGameStats(stats);
    };
    
    // Refresh on mount and when user changes
    refreshStats();
    
    // Refresh when window gains focus (returning from game)
    window.addEventListener('focus', refreshStats);
    
    // Also refresh when component becomes visible (handles navigation back)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshStats();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', refreshStats);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]); // Refresh when user changes

  // Refresh stats when location changes (navigating back from a game)
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      const refreshStats = async () => {
        const stats = await getGameStats();
        setGameStats(stats);
      };
      refreshStats();
    }
  }, [location.pathname]);

  // Listen for game win events
  useEffect(() => {
    const handleGameWin = async () => {
      const stats = await getGameStats();
      setGameStats(stats);
    };
    
    window.addEventListener('gameWinUpdated', handleGameWin);
    
    return () => {
      window.removeEventListener('gameWinUpdated', handleGameWin);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleGameClick = (game: GameInfo) => {
    setSelectedGame(game);
    setIsModalOpen(true);
  };

  const handleCloseModal = async () => {
    setIsModalOpen(false);
    setSelectedGame(null);
    // Refresh stats when modal closes
    const stats = await getGameStats();
    setGameStats(stats);
  };

  // Function to manually refresh stats (can be called from anywhere)
  const refreshStats = async () => {
    const stats = await getGameStats();
    setGameStats(stats);
  };

  // Expose refresh function to window for debugging/testing
  useEffect(() => {
    (window as any).refreshGameStats = refreshStats;
    return () => {
      delete (window as any).refreshGameStats;
    };
  }, []);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome, {user.username}!</h1>
        <button 
          className="pixel-button pixel-button-secondary logout-button"
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>
      <div className="games-grid">
        {games.map((game) => (
          <GameCard
            key={game.gameName}
            title={game.title}
            description={game.description}
            gameName={game.gameName}
            winCount={gameStats[game.gameName as keyof typeof gameStats] || 0}
            onClick={() => handleGameClick(game)}
          />
        ))}
      </div>
      {selectedGame && (
        <GameModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={selectedGame.title}
          description={selectedGame.detailedDescription}
          gameName={selectedGame.gameName}
        />
      )}
    </div>
  );
}

