import '../styles/dashboard.css';

interface GameCardProps {
  title: string;
  description: string;
  gameName: string;
  winCount: number;
  onClick: () => void;
}

export default function GameCard({ title, description, gameName, winCount, onClick }: GameCardProps) {
  return (
    <div 
      className="game-card"
      onClick={onClick}
    >
      <div className="game-card-header">
        <h3 className="game-card-title">{title}</h3>
        {winCount > 0 && (
          <div className="game-card-wins">
            <span className="wins-label">Wins:</span>
            <span className="wins-count">{winCount}</span>
          </div>
        )}
      </div>
      <p className="game-card-description">{description}</p>
    </div>
  );
}

