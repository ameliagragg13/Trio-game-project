import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

interface GamePlaceholderProps {
  gameName: string;
  displayName: string;
}

export default function GamePlaceholder({ displayName }: GamePlaceholderProps) {
  const navigate = useNavigate();

  return (
    <div className="game-placeholder-container">
      <div className="game-placeholder-content">
        <h1 className="game-placeholder-title">{displayName}</h1>
        <p className="game-placeholder-message">Coming Soon</p>
        <button 
          className="pixel-button pixel-button-primary"
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

