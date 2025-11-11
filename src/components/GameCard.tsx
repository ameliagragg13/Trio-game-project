import '../styles/dashboard.css';

interface GameCardProps {
  title: string;
  description: string;
  gameName: string;
  onClick: () => void;
}

export default function GameCard({ title, description, gameName, onClick }: GameCardProps) {
  return (
    <div 
      className="game-card"
      onClick={onClick}
    >
      <h3 className="game-card-title">{title}</h3>
      <p className="game-card-description">{description}</p>
    </div>
  );
}

