import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { incrementGameWin } from '../utils/gameStats';
import '../styles/memory.css';

// Import all the pixel art icons
import smileIcon from '../assets/smile-pixel.png';
import frownIcon from '../assets/frown-pixel.png';
import heartIcon from '../assets/heart-pixel.png';
import goldfishIcon from '../assets/goldfish-pixel.png';
import cactusIcon from '../assets/cactus-pixel.png';
import toothIcon from '../assets/tooth-pixel.png';
import flowerIcon from '../assets/flower-pixel.png';
import hatIcon from '../assets/hat-pixel.png';

interface Card {
  id: number;
  icon: string;
  iconName: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const icons = [
  { icon: smileIcon, name: 'smile' },
  { icon: frownIcon, name: 'frown' },
  { icon: heartIcon, name: 'heart' },
  { icon: goldfishIcon, name: 'goldfish' },
  { icon: cactusIcon, name: 'cactus' },
  { icon: toothIcon, name: 'tooth' },
  { icon: flowerIcon, name: 'flower' },
  { icon: hatIcon, name: 'hat' },
];

export default function MemoryMatching() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Initialize game
  useEffect(() => {
    startNewGame();
  }, []);

  // Timer
  useEffect(() => {
    if (gameWon) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, gameWon]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startNewGame = () => {
    // Create pairs of cards
    const cardPairs: Card[] = [];
    icons.forEach((iconData, index) => {
      // Add two cards for each icon
      cardPairs.push({
        id: index * 2,
        icon: iconData.icon,
        iconName: iconData.name,
        isFlipped: false,
        isMatched: false,
      });
      cardPairs.push({
        id: index * 2 + 1,
        icon: iconData.icon,
        iconName: iconData.name,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle the cards
    const shuffledCards = shuffleArray(cardPairs);
    setCards(shuffledCards);
    setMatchedPairs(0);
    setMoves(0);
    setIsChecking(false);
    setGameWon(false);
    setStartTime(Date.now());
    setElapsedTime(0);
  };

  const handleCardClick = (index: number) => {
    // Don't allow clicks if checking or 2 cards are already flipped
    if (isChecking) return;
    
    setCards(prevCards => {
      const card = prevCards[index];
      
      // Don't allow clicks on already flipped or matched cards
      if (card.isFlipped || card.isMatched) {
        return prevCards;
      }

      // Count how many cards are currently flipped
      const currentlyFlipped = prevCards.filter(c => c.isFlipped && !c.isMatched).length;
      if (currentlyFlipped >= 2) {
        return prevCards;
      }

      // Update the clicked card to flipped
      const updatedCards = prevCards.map((c, i) =>
        i === index ? { ...c, isFlipped: true } : c
      );

      // Check how many flipped cards we have now
      const flippedCount = updatedCards.filter(c => c.isFlipped && !c.isMatched).length;

      // If 2 cards are now flipped, check for match
      if (flippedCount === 2) {
        setIsChecking(true);
        setMoves(prev => prev + 1);

        const flippedIndices: number[] = [];
        updatedCards.forEach((c, i) => {
          if (c.isFlipped && !c.isMatched) {
            flippedIndices.push(i);
          }
        });

        const [firstIndex, secondIndex] = flippedIndices;
        const firstCard = updatedCards[firstIndex];
        const secondCard = updatedCards[secondIndex];

        if (firstCard.iconName === secondCard.iconName) {
          // Match found!
          setTimeout(() => {
            setCards(prevCards =>
              prevCards.map((c, i) =>
                i === firstIndex || i === secondIndex
                  ? { ...c, isMatched: true, isFlipped: true }
                  : c
              )
            );
            setMatchedPairs(prev => prev + 1);
            setIsChecking(false);
          }, 500);
        } else {
          // No match - flip back after 1 second
          setTimeout(() => {
            setCards(prevCards =>
              prevCards.map((c, i) =>
                i === firstIndex || i === secondIndex
                  ? { ...c, isFlipped: false }
                  : c
              )
            );
            setIsChecking(false);
          }, 1000);
        }
      }

      return updatedCards;
    });
  };

  // Check for win condition - all 16 cards should be matched (8 pairs)
  useEffect(() => {
    const allMatched = cards.length > 0 && cards.every(card => card.isMatched);
    if (allMatched && cards.length === 16 && !gameWon) {
      setGameWon(true);
      incrementGameWin('memory');
    }
  }, [cards, gameWon]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="memory-game-container">
      <div className="memory-game-content">
        <div className="memory-game-header">
          <h1 className="memory-game-title">Matching Manor</h1>
          <div className="memory-game-stats">
            <div className="stat-item">
              <span className="stat-label">Moves:</span>
              <span className="stat-value">{moves}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Time:</span>
              <span className="stat-value">{formatTime(elapsedTime)}</span>
            </div>
          </div>
        </div>

        {!gameWon ? (
          <>
            <div className="memory-grid">
              {cards.map((card, index) => (
                <div
                  key={card.id}
                  className={`memory-card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
                  onClick={() => handleCardClick(index)}
                >
                  <div className="memory-card-inner">
                    <div className="memory-card-front">
                      <div className={`card-background ${index % 2 === 0 ? 'blue-purple' : 'pink-purple'}`}></div>
                    </div>
                    <div className="memory-card-back">
                      <img src={card.icon} alt={card.iconName} className="memory-icon" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="memory-game-controls">
              <button className="pixel-button pixel-button-secondary" onClick={startNewGame}>
                New Game
              </button>
              <button className="pixel-button pixel-button-secondary" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </button>
            </div>
          </>
        ) : (
          <div className="memory-win-screen">
            <h2 className="win-title">Congratulations!</h2>
            <p className="win-message">You matched all pairs!</p>
            <div className="win-stats">
              <p>Moves: {moves}</p>
              <p>Time: {formatTime(elapsedTime)}</p>
            </div>
            <div className="win-buttons">
              <button className="pixel-button pixel-button-primary" onClick={startNewGame}>
                Play Again
              </button>
              <button className="pixel-button pixel-button-secondary" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

