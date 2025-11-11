import { useEffect } from 'react';
import '../styles/dashboard.css';

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  gameName: string;
}

export default function GameModal({ isOpen, onClose, title, description, gameName }: GameModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleStartGame = () => {
    // This will navigate to the game when implemented
    // For now, we can just close the modal or show a message
    onClose();
    // TODO: Navigate to actual game when implemented
    // navigate(`/games/${gameName}`);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>×</button>
        <h2 className="modal-title">{title}</h2>
        <p className="modal-description">{description}</p>
        <div className="modal-buttons">
          <button 
            className="pixel-button pixel-button-primary modal-start-button"
            onClick={handleStartGame}
          >
            Start Game
          </button>
          <button 
            className="pixel-button pixel-button-secondary modal-cancel-button"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

