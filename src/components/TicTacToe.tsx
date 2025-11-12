import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { incrementGameWin } from '../utils/gameStats';
import '../styles/tictactoe.css';

// Custom event to notify dashboard of win updates
const GAME_WIN_EVENT = 'gameWinUpdated';

type Player = 'X' | 'O' | null;
type Board = Player[];
type GameMode = 'select' | 'vsFriend' | 'vsComputer';

interface WinLine {
  type: 'row' | 'column' | 'diagonal';
  index: number;
}

export default function TicTacToe() {
  const navigate = useNavigate();
  const [gameMode, setGameMode] = useState<GameMode>('select');
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'draw'>('playing');
  const [winner, setWinner] = useState<Player>(null);
  const [winLine, setWinLine] = useState<WinLine | null>(null);
  const [isComputerThinking, setIsComputerThinking] = useState(false);

  const checkWinner = (board: Board): { winner: Player; winLine: WinLine | null } => {
    const lines = [
      // Rows
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      // Columns
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      // Diagonals
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        let winLine: WinLine;
        if (i < 3) {
          winLine = { type: 'row', index: i };
        } else if (i < 6) {
          winLine = { type: 'column', index: i - 3 };
        } else {
          winLine = { type: 'diagonal', index: i - 6 };
        }
        return { winner: board[a], winLine };
      }
    }

    return { winner: null, winLine: null };
  };

  const checkDraw = (board: Board): boolean => {
    return board.every(cell => cell !== null);
  };

  const getAvailableMoves = (board: Board): number[] => {
    return board.map((cell, index) => cell === null ? index : -1).filter(index => index !== -1);
  };

  const findWinningMove = (board: Board, player: Player): number | null => {
    const availableMoves = getAvailableMoves(board);
    for (const move of availableMoves) {
      const testBoard = [...board];
      testBoard[move] = player;
      const { winner } = checkWinner(testBoard);
      if (winner === player) {
        return move;
      }
    }
    return null;
  };

  const getComputerMove = (board: Board): number => {
    // 1. Check if computer can win
    const winningMove = findWinningMove(board, 'O');
    if (winningMove !== null) return winningMove;

    // 2. Block player from winning
    const blockingMove = findWinningMove(board, 'X');
    if (blockingMove !== null) return blockingMove;

    // 3. Take center if available
    if (board[4] === null) return 4;

    // 4. Take a corner if available
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(index => board[index] === null);
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    // 5. Take any available side
    const sides = [1, 3, 5, 7];
    const availableSides = sides.filter(index => board[index] === null);
    if (availableSides.length > 0) {
      return availableSides[Math.floor(Math.random() * availableSides.length)];
    }

    // Fallback (shouldn't happen)
    const availableMoves = getAvailableMoves(board);
    return availableMoves[0];
  };

  const makeMove = (index: number, player: Player) => {
    const newBoard = [...board];
    newBoard[index] = player;
    setBoard(newBoard);

    // Check for winner
    const { winner: newWinner, winLine: newWinLine } = checkWinner(newBoard);
    if (newWinner) {
      setWinner(newWinner);
      setGameStatus('won');
      setWinLine(newWinLine);
      // Increment win count:
      // - In vs Computer mode: only when player (X) wins
      // - In vs Friend mode: track when either player wins (completed games)
      if (gameMode === 'vsComputer') {
        if (newWinner === 'X') {
          incrementGameWin('tictactoe');
          // Dispatch event to notify dashboard
          window.dispatchEvent(new CustomEvent(GAME_WIN_EVENT, { detail: { game: 'tictactoe' } }));
        }
      } else {
        // In vs Friend mode, track any win as a completed game
        incrementGameWin('tictactoe');
        // Dispatch event to notify dashboard
        window.dispatchEvent(new CustomEvent(GAME_WIN_EVENT, { detail: { game: 'tictactoe' } }));
      }
    } else if (checkDraw(newBoard)) {
      setGameStatus('draw');
    } else {
      // Switch player
      setCurrentPlayer(player === 'X' ? 'O' : 'X');
    }
  };

  const handleCellClick = (index: number) => {
    // Don't allow moves if game is over, cell is filled, or it's computer's turn
    if (gameStatus !== 'playing' || board[index] !== null || isComputerThinking) {
      return;
    }

    // In vs computer mode, only allow X (player) to click
    if (gameMode === 'vsComputer' && currentPlayer !== 'X') {
      return;
    }

    makeMove(index, currentPlayer);
  };

  // Handle computer moves
  useEffect(() => {
    if (gameMode === 'vsComputer' && currentPlayer === 'O' && gameStatus === 'playing' && !isComputerThinking) {
      setIsComputerThinking(true);
      const delay = setTimeout(() => {
        const computerMove = getComputerMove(board);
        makeMove(computerMove, 'O');
        setIsComputerThinking(false);
      }, 500);

      return () => clearTimeout(delay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer, gameMode, gameStatus]);

  const startGame = (mode: 'vsFriend' | 'vsComputer') => {
    setGameMode(mode);
    resetGame();
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setGameStatus('playing');
    setWinner(null);
    setWinLine(null);
    setIsComputerThinking(false);
  };

  const changeMode = () => {
    setGameMode('select');
    resetGame();
  };

  const getCellClass = (index: number): string => {
    let classes = 'tic-cell';
    
    if (winLine) {
      const winningIndices = getWinningIndices(winLine);
      if (winningIndices.includes(index)) {
        classes += ' winning-cell';
      }
    }
    
    return classes;
  };

  const getWinningIndices = (winLine: WinLine): number[] => {
    if (winLine.type === 'row') {
      const start = winLine.index * 3;
      return [start, start + 1, start + 2];
    } else if (winLine.type === 'column') {
      return [winLine.index, winLine.index + 3, winLine.index + 6];
    } else {
      // Diagonal
      return winLine.index === 0 ? [0, 4, 8] : [2, 4, 6];
    }
  };

  const getTurnMessage = () => {
    if (gameMode === 'vsComputer') {
      if (isComputerThinking) {
        return "Computer's Turn...";
      }
      return "Your Turn";
    } else {
      return `Player ${currentPlayer}'s Turn`;
    }
  };

  const getWinMessage = () => {
    if (gameMode === 'vsComputer') {
      if (winner === 'X') {
        return "You Win!";
      } else if (winner === 'O') {
        return "Computer Wins!";
      }
    } else {
      return `Player ${winner} Wins!`;
    }
    return "It's a Draw!";
  };

  // Mode selection screen
  if (gameMode === 'select') {
    return (
      <div className="tic-tac-toe-container">
        <div className="tic-tac-toe-content">
          <h1 className="tic-tac-toe-title">Tic Tac Toe</h1>
          <p className="mode-selection-subtitle">Choose your game mode</p>
          
          <div className="mode-selection">
            <button
              className="mode-card"
              onClick={() => startGame('vsFriend')}
            >
              <div className="mode-icon">👥</div>
              <h3 className="mode-title">Play vs Friend</h3>
              <p className="mode-description">Two players take turns</p>
            </button>
            
            <button
              className="mode-card"
              onClick={() => startGame('vsComputer')}
            >
              <div className="mode-icon">🤖</div>
              <h3 className="mode-title">Play vs Computer</h3>
              <p className="mode-description">Challenge the AI</p>
            </button>
          </div>

          <div className="tic-controls">
            <button className="pixel-button pixel-button-secondary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tic-tac-toe-container">
      <div className="tic-tac-toe-content">
        <h1 className="tic-tac-toe-title">Tic Tac Toe</h1>

        {gameStatus === 'playing' && (
          <div className="current-player">
            <p className="player-turn">{getTurnMessage()}</p>
          </div>
        )}

        {gameStatus === 'won' && winner && (
          <div className="game-message win-message">
            <p>{getWinMessage()}</p>
          </div>
        )}

        {gameStatus === 'draw' && (
          <div className="game-message draw-message">
            <p>It's a Draw!</p>
          </div>
        )}

        <div className={`tic-board ${isComputerThinking ? 'computer-thinking' : ''}`}>
          {board.map((cell, index) => (
            <div
              key={index}
              className={`${getCellClass(index)} ${cell ? 'filled' : 'empty'}`}
              onClick={() => handleCellClick(index)}
            >
              {cell && <span className={`tic-symbol ${cell.toLowerCase()}`}>{cell}</span>}
            </div>
          ))}
        </div>

        <div className="tic-controls">
          <button className="pixel-button pixel-button-primary" onClick={resetGame}>
            Play Again
          </button>
          <button className="pixel-button pixel-button-secondary" onClick={changeMode}>
            Change Mode
          </button>
          <button className="pixel-button pixel-button-secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
