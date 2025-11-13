import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { incrementGameWin } from '../utils/gameStats';
import { getSudoku } from 'sudoku-gen';
import '../styles/sudoku.css';

type Difficulty = 'easy' | 'medium' | 'hard';
type CellValue = number | null;

interface Cell {
  value: CellValue;
  isPrefilled: boolean;
  isInvalid: boolean;
  isMistake?: boolean;
}

const DIFFICULTY_CLUES = {
  easy: 40,
  medium: 30,
  hard: 25,
};

export default function Sudoku() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [board, setBoard] = useState<Cell[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [showValidation, setShowValidation] = useState<boolean>(false);
  const [checkMessage, setCheckMessage] = useState<string>('');
  const [showSolutionModal, setShowSolutionModal] = useState<boolean>(false);
  const [solutionRevealed, setSolutionRevealed] = useState<boolean>(false);
  const [mistakes, setMistakes] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [mistakeCell, setMistakeCell] = useState<{ row: number; col: number } | null>(null);

  // Timer
  useEffect(() => {
    if (isSolved || gameOver) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isSolved, gameOver]);


  // Validate a complete Sudoku solution (mandatory check)
  const isValidSolution = (grid: number[][]): boolean => {
    // Check all rows
    for (let row = 0; row < 9; row++) {
      const rowSet = new Set(grid[row]);
      if (rowSet.size !== 9 || rowSet.has(0)) {
        console.log(`Row ${row} invalid:`, grid[row]);
        return false;
      }
    }

    // Check all columns
    for (let col = 0; col < 9; col++) {
      const colSet = new Set<number>();
      for (let row = 0; row < 9; row++) {
        colSet.add(grid[row][col]);
      }
      if (colSet.size !== 9 || colSet.has(0)) {
        console.log(`Column ${col} invalid`);
        return false;
      }
    }

    // Check all 3x3 boxes
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const boxSet = new Set<number>();
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            boxSet.add(grid[boxRow * 3 + i][boxCol * 3 + j]);
          }
        }
        if (boxSet.size !== 9 || boxSet.has(0)) {
          console.log(`Box (${boxRow}, ${boxCol}) invalid`);
          return false;
        }
      }
    }

    return true;
  };

  // Convert string format (81 chars, '.' for empty) to 9x9 number array
  const stringToGrid = (puzzleString: string): number[][] => {
    const grid: number[][] = [];
    for (let i = 0; i < 9; i++) {
      const row: number[] = [];
      for (let j = 0; j < 9; j++) {
        const char = puzzleString[i * 9 + j];
        // Convert '.' or '-' to 0 for empty cells
        // Convert '1'-'9' to actual numbers
        if (char === '.' || char === '-' || !char) {
          row.push(0);
        } else {
          const num = parseInt(char, 10);
          // Ensure it's a valid number 1-9
          if (isNaN(num) || num < 1 || num > 9) {
            console.warn(`Invalid character at position ${i * 9 + j}: "${char}"`);
            row.push(0);
          } else {
            row.push(num);
          }
        }
      }
      grid.push(row);
    }
    return grid;
  };

  // Hardcoded valid Sudoku puzzles as fallback
  const FALLBACK_PUZZLES = [
    {
      puzzle: '4.....8.5.3..........7......2.....6.....8.4......1.......6.3.7.5..2.....1.4......',
      solution: '417369825632158947958724316825437169791586432346912758289643571573291684164875293'
    },
    {
      puzzle: '52...6.........7.13...........4..8..6......5...........418.........3..2...87.....',
      solution: '527316489896542731314987562172453896689271354953648217241795683765834129438129675'
    },
    {
      puzzle: '6.....8.3.4.7.................5.4.7.3..2.....1.6.......2.....5.....8.6......1....',
      solution: '617459823248736915539128467982564371374291586156873294823647159791385642465912738'
    },
    {
      puzzle: '48.3............71.2.......7.5....6....2..8.............1.76...3.....4......5....',
      solution: '487312695593684271261597384735129648914268537826475913152746839379851462648937125'
    },
    {
      puzzle: '....14....3....2...7..........9...3.6.1.............8.2.....1.4....5.6.....7.8...',
      solution: '672143859341895267859672143214957638795368412638421795186534972423789516957216384'
    }
  ];

  // Generate new puzzle
  const generatePuzzle = useCallback((diff: Difficulty) => {
    let puzzleGrid: number[][] = [];
    let solutionGrid: number[][] = [];
    let useFallback = false;

    try {
      // Try to generate puzzle using sudoku-gen package
      console.log('=== GENERATING PUZZLE ===');
      const { puzzle, solution } = getSudoku(diff);
      
      // IMMEDIATE DEBUG LOGGING
      console.log('Raw puzzle string:', puzzle);
      console.log('Raw solution string:', solution);
      console.log('Puzzle length:', puzzle.length, 'Expected: 81');
      console.log('Solution length:', solution.length, 'Expected: 81');
      
      // Convert both strings to 9x9 number grids
      puzzleGrid = stringToGrid(puzzle);
      solutionGrid = stringToGrid(solution);
      
      // DEBUG LOGGING
      console.log('Converted puzzle grid (first row):', puzzleGrid[0]);
      console.log('Converted solution grid (first row):', solutionGrid[0]);
      console.log('First puzzle cell:', puzzleGrid[0][0], typeof puzzleGrid[0][0]);
      console.log('First solution cell:', solutionGrid[0][0], typeof solutionGrid[0][0]);
      
      // IMMEDIATE VALIDATION: Check if solution is valid BEFORE using it
      console.log('=== VALIDATING SOLUTION ===');
      const isValid = isValidSolution(solutionGrid);
      console.log('Solution validation result:', isValid ? '✅ VALID' : '❌ INVALID');
      
      if (!isValid) {
        console.error('❌ Generated solution FAILED validation!');
        console.error('Solution grid:', solutionGrid);
        
        // Try retry once
        console.log('Attempting retry...');
        const retryData = getSudoku(diff);
        const retrySolutionGrid = stringToGrid(retryData.solution);
        const retryIsValid = isValidSolution(retrySolutionGrid);
        console.log('Retry validation result:', retryIsValid ? '✅ VALID' : '❌ INVALID');
        
        if (!retryIsValid) {
          console.error('❌ Retry also failed validation! Using fallback puzzle.');
          useFallback = true;
        } else {
          console.log('✅ Retry solution is valid, using retry');
          puzzleGrid = stringToGrid(retryData.puzzle);
          solutionGrid = retrySolutionGrid;
        }
      } else {
        console.log('✅ Generated solution is VALID, using generated puzzle');
      }
    } catch (error) {
      console.error('Error generating puzzle:', error);
      useFallback = true;
    }

    // Use fallback if generation failed or validation failed
    if (useFallback) {
      console.log('=== USING FALLBACK PUZZLE ===');
      const fallback = FALLBACK_PUZZLES[Math.floor(Math.random() * FALLBACK_PUZZLES.length)];
      puzzleGrid = stringToGrid(fallback.puzzle);
      solutionGrid = stringToGrid(fallback.solution);
      
      // Validate fallback too
      const fallbackValid = isValidSolution(solutionGrid);
      console.log('Fallback validation result:', fallbackValid ? '✅ VALID' : '❌ INVALID');
      if (!fallbackValid) {
        console.error('FALLBACK PUZZLE IS ALSO INVALID! This should not happen.');
      }
    }

    // Final validation check
    console.log('=== FINAL VALIDATION ===');
    const finalValid = isValidSolution(solutionGrid);
    console.log('Final solution validation:', finalValid ? '✅ VALID' : '❌ INVALID');
    
    if (!finalValid) {
      console.error('CRITICAL: Cannot proceed with invalid solution!');
      throw new Error('All puzzle generation methods failed');
    }

    // Set the validated solution
    setSolution(solutionGrid);
    
    // Convert puzzle grid to Cell grid
    const puzzleCells: Cell[][] = [];
    for (let i = 0; i < 9; i++) {
      const row: Cell[] = [];
      for (let j = 0; j < 9; j++) {
        const numValue = puzzleGrid[i][j];
        // 0 means empty, 1-9 means filled
        const value = numValue === 0 ? null : numValue;
        row.push({
          value: value,
          isPrefilled: value !== null,
          isInvalid: false,
          isMistake: false,
        });
      }
      puzzleCells.push(row);
    }
    
    // Count actual clues
    const actualClues = puzzleCells.flat().filter(cell => cell.isPrefilled).length;
    console.log(`✅ Puzzle ready with ${actualClues} clues (difficulty: ${diff})`);
    console.log('=== PUZZLE GENERATION COMPLETE ===');
    
    setBoard(puzzleCells);
    setSelectedCell(null);
    setIsSolved(false);
    setShowValidation(false);
    setCheckMessage('');
    setSolutionRevealed(false);
    setMistakes(0);
    setGameOver(false);
    setMistakeCell(null);
    setStartTime(Date.now());
    setElapsedTime(0);
  }, []);

  // Initialize puzzle on mount
  useEffect(() => {
    generatePuzzle(difficulty);
  }, [difficulty, generatePuzzle]);

  // Validate a board and return updated board with invalid flags
  const validateBoardState = useCallback((boardToValidate: Cell[][]): Cell[][] => {
    const newBoard = boardToValidate.map(row => row.map(cell => ({ ...cell, isInvalid: false }))); // Keep isMistake flag

    // Check rows, columns, and boxes - validate ALL cells (including pre-filled)
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const cell = newBoard[row][col];
        if (!cell.value) continue; // Skip empty cells

        // Check row - ensure each number 1-9 appears only once
        for (let c = 0; c < 9; c++) {
          if (c !== col && newBoard[row][c].value === cell.value && newBoard[row][c].value !== null) {
            console.log(`Row validation failed: Duplicate ${cell.value} at row ${row}, cols ${col} and ${c}`);
            newBoard[row][col].isInvalid = true;
            newBoard[row][c].isInvalid = true;
          }
        }

        // Check column - ensure each number 1-9 appears only once
        for (let r = 0; r < 9; r++) {
          if (r !== row && newBoard[r][col].value === cell.value && newBoard[r][col].value !== null) {
            console.log(`Column validation failed: Duplicate ${cell.value} at col ${col}, rows ${row} and ${r}`);
            newBoard[row][col].isInvalid = true;
            newBoard[r][col].isInvalid = true;
          }
        }

        // Check 3x3 box - ensure each number 1-9 appears only once
        const boxRowStart = Math.floor(row / 3) * 3;
        const boxColStart = Math.floor(col / 3) * 3;
        for (let r = boxRowStart; r < boxRowStart + 3; r++) {
          for (let c = boxColStart; c < boxColStart + 3; c++) {
            if ((r !== row || c !== col) && newBoard[r][c].value === cell.value && newBoard[r][c].value !== null) {
              console.log(`Box validation failed: Duplicate ${cell.value} in box at (${row},${col}) and (${r},${c})`);
              newBoard[row][col].isInvalid = true;
              newBoard[r][c].isInvalid = true;
            }
          }
        }
      }
    }

    // Additional validation: Check if each row, column, and box has all numbers 1-9
    for (let i = 0; i < 9; i++) {
      // Check row i
      const rowValues = newBoard[i].map(cell => cell.value).filter(v => v !== null) as number[];
      const rowSet = new Set(rowValues);
      if (rowValues.length !== rowSet.size) {
        console.log(`Row ${i} has duplicates:`, rowValues);
      }

      // Check column i
      const colValues = newBoard.map(row => row[i].value).filter(v => v !== null) as number[];
      const colSet = new Set(colValues);
      if (colValues.length !== colSet.size) {
        console.log(`Column ${i} has duplicates:`, colValues);
      }

      // Check box i (0-8)
      const boxRow = Math.floor(i / 3) * 3;
      const boxCol = (i % 3) * 3;
      const boxValues: number[] = [];
      for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
          if (newBoard[r][c].value !== null) {
            boxValues.push(newBoard[r][c].value!);
          }
        }
      }
      const boxSet = new Set(boxValues);
      if (boxValues.length !== boxSet.size) {
        console.log(`Box ${i} (row ${boxRow}, col ${boxCol}) has duplicates:`, boxValues);
      }
    }

    return newBoard;
  }, []);

  // Validate board and update state
  const validateBoard = useCallback(() => {
    const validatedBoard = validateBoardState(board);
    setBoard(validatedBoard);
    setShowValidation(true);
  }, [board, validateBoardState]);

  // Show solution confirmation modal
  const handleCheckSolution = () => {
    setShowSolutionModal(true);
  };

  // Reveal the solution - completely replace board with solution
  const revealSolution = () => {
    if (solution.length === 0) return;

    // Create a completely fresh board state from the solution
    // Replace EVERY cell with the solution value, clearing all user input
    const revealedBoard: Cell[][] = solution.map((row, rowIndex) =>
      row.map((value, colIndex) => {
        // Check if this cell was originally pre-filled
        const wasPrefilled = board[rowIndex]?.[colIndex]?.isPrefilled || false;
        
        return {
          value: value, // Use solution value for ALL cells
          isPrefilled: wasPrefilled, // Preserve original pre-filled status
          isInvalid: false, // Clear all invalid flags
          isMistake: false, // Clear all mistake flags
        };
      })
    );

    setBoard(revealedBoard);
    setSolutionRevealed(true);
    setShowSolutionModal(false);
    setSelectedCell(null);
    setShowValidation(false);
  };

  // Auto-check for win when puzzle is completed correctly
  useEffect(() => {
    if (solutionRevealed || isSolved || board.length === 0 || solution.length === 0) return;

    // Check if all cells are filled
    const allFilled = board.every(row => row.every(cell => cell.value !== null));
    if (!allFilled) return;

    // Check if solution matches
    const userSolution = board.map(row => row.map(cell => cell.value!));
    const isCorrect = userSolution.every((row, r) =>
      row.every((val, c) => val === solution[r][c])
    );

    // Check if there are no invalid cells
    const hasInvalid = board.some(row => row.some(cell => cell.isInvalid));
    
    if (isCorrect && !hasInvalid) {
      setIsSolved(true);
      incrementGameWin('sudoku');
      window.dispatchEvent(new CustomEvent('gameWinUpdated', { detail: { game: 'sudoku' } }));
    }
  }, [board, solution, solutionRevealed, isSolved]);

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (board[row][col].isPrefilled || solutionRevealed || gameOver) return;
    setSelectedCell({ row, col });
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!selectedCell || isSolved || gameOver) return;

      const { row, col } = selectedCell;
      if (board[row][col].isPrefilled || solutionRevealed) return;

      if (e.key >= '1' && e.key <= '9') {
        const value = parseInt(e.key);
        
        // Check if the value matches the solution
        const isCorrect = solution.length > 0 && solution[row][col] === value;
        
        if (!isCorrect) {
          // Mistake detected
          const newMistakes = mistakes + 1;
          setMistakes(newMistakes);
          setMistakeCell({ row, col });
          
          // Clear mistake cell highlight after animation
          setTimeout(() => {
            setMistakeCell(null);
          }, 1000);
          
          // Show mistake message
          setCheckMessage('Incorrect!');
          setTimeout(() => setCheckMessage(''), 2000);
          
          // Mark the cell as a mistake but keep the number
          const newBoard = board.map((r, rIdx) =>
            r.map((c, cIdx) => {
              if (rIdx === row && cIdx === col) {
                return { ...c, value, isInvalid: false, isMistake: true };
              }
              return c;
            })
          );
          setBoard(newBoard);
          
          // Check if game over
          if (newMistakes >= 3) {
            setGameOver(true);
            setSelectedCell(null);
            return;
          }
        } else {
          // Correct number entered - clear any mistake flag
          const newBoard = board.map((r, rIdx) =>
            r.map((c, cIdx) => {
              if (rIdx === row && cIdx === col) {
                return { ...c, value, isInvalid: false, isMistake: false };
              }
              return c;
            })
          );
          setBoard(newBoard);
          // Validate after state update
          setTimeout(() => {
            setBoard(prevBoard => validateBoardState(prevBoard));
          }, 10);
        }
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        const newBoard = board.map((r, rIdx) =>
          r.map((c, cIdx) => {
            if (rIdx === row && cIdx === col) {
              return { ...c, value: null, isInvalid: false, isMistake: false };
            }
            return c;
          })
        );
        setBoard(newBoard);
        // Re-validate after clearing
        setTimeout(() => {
          setBoard(prevBoard => validateBoardState(prevBoard));
        }, 10);
      } else if (e.key.startsWith('Arrow')) {
        let newRow = row;
        let newCol = col;

        if (e.key === 'ArrowUp') newRow = Math.max(0, row - 1);
        if (e.key === 'ArrowDown') newRow = Math.min(8, row + 1);
        if (e.key === 'ArrowLeft') newCol = Math.max(0, col - 1);
        if (e.key === 'ArrowRight') newCol = Math.min(8, col + 1);

        setSelectedCell({ row: newRow, col: newCol });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedCell, board, isSolved, solutionRevealed, gameOver, mistakes, solution, validateBoardState]);


  // Clear user inputs
  const clearBoard = () => {
    if (solutionRevealed || gameOver) return; // Don't allow clearing when solution is revealed or game over
    const newBoard = board.map(row =>
      row.map(cell => {
        if (cell.isPrefilled) {
          return cell;
        }
        return { ...cell, value: null, isInvalid: false, isMistake: false };
      })
    );
    setBoard(newBoard);
    setSelectedCell(null);
    setShowValidation(false);
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSolutionModal) {
        setShowSolutionModal(false);
      }
    };

    if (showSolutionModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showSolutionModal]);

  // Change difficulty
  const handleDifficultyChange = (diff: Difficulty) => {
    setDifficulty(diff);
    setMistakes(0);
    setGameOver(false);
    setMistakeCell(null);
    generatePuzzle(diff);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCellClass = (row: number, col: number): string => {
    const cell = board[row][col];
    let classes = 'sudoku-cell';

    if (cell.isPrefilled) {
      classes += ' prefilled';
    }

    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      classes += ' selected';
    }

    if (cell.isInvalid) {
      classes += ' invalid';
    }

    // Add mistake highlight
    if (mistakeCell && mistakeCell.row === row && mistakeCell.col === col) {
      classes += ' mistake-flash';
    }

    // Add border classes for 3x3 boxes
    if (row % 3 === 0) classes += ' top-box-border';
    if (col % 3 === 0) classes += ' left-box-border';

    return classes;
  };

  const getMistakeCounterColor = (): string => {
    if (mistakes === 0) return 'green';
    if (mistakes < 3) return 'yellow';
    return 'red';
  };

  return (
    <div className="sudoku-container">
      <div className="sudoku-content">
        <div className="sudoku-header">
          <h1 className="sudoku-title">Sudoku</h1>
          <div className="sudoku-stats">
            <div className="stat-item">
              <span className="stat-label">Mistakes:</span>
              <span className={`stat-value mistakes-${getMistakeCounterColor()}`}>
                {mistakes}/3
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Time:</span>
              <span className="stat-value">{formatTime(elapsedTime)}</span>
            </div>
          </div>
        </div>

        <div className="difficulty-selection">
          <button
            className={`difficulty-button ${difficulty === 'easy' ? 'active' : ''}`}
            onClick={() => handleDifficultyChange('easy')}
          >
            Easy
          </button>
          <button
            className={`difficulty-button ${difficulty === 'medium' ? 'active' : ''}`}
            onClick={() => handleDifficultyChange('medium')}
          >
            Medium
          </button>
          <button
            className={`difficulty-button ${difficulty === 'hard' ? 'active' : ''}`}
            onClick={() => handleDifficultyChange('hard')}
          >
            Hard
          </button>
        </div>

        {isSolved && (
          <div className="sudoku-win-message">
            <h2>Puzzle Solved!</h2>
            <p>Time: {formatTime(elapsedTime)}</p>
          </div>
        )}

        {solutionRevealed && !isSolved && (
          <div className="sudoku-revealed-message">
            <p>Solution revealed! Start a new game to play again.</p>
          </div>
        )}

        {checkMessage && !isSolved && !solutionRevealed && (
          <div className="sudoku-check-message">
            <p>{checkMessage}</p>
          </div>
        )}

        {board.length > 0 && (
          <div className={`sudoku-board ${solutionRevealed || gameOver ? 'disabled' : ''}`}>
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="sudoku-row">
                {row.map((cell, colIndex) => (
                  <div
                    key={colIndex}
                    className={getCellClass(rowIndex, colIndex)}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell.value !== null && (
                      <span className={
                        cell.isPrefilled 
                          ? 'prefilled-number' 
                          : cell.isMistake 
                            ? 'user-number mistake-number' 
                            : 'user-number'
                      }>
                        {cell.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="sudoku-controls">
          <button className="pixel-button pixel-button-primary" onClick={() => generatePuzzle(difficulty)}>
            New Game
          </button>
          <button 
            className="pixel-button pixel-button-secondary" 
            onClick={handleCheckSolution}
            disabled={gameOver}
          >
            {solutionRevealed ? 'Solution Revealed' : 'Check Solution'}
          </button>
          <button 
            className="pixel-button pixel-button-secondary" 
            onClick={clearBoard}
            disabled={gameOver}
          >
            Clear Board
          </button>
          <button className="pixel-button pixel-button-secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Solution Confirmation Modal */}
      {showSolutionModal && (
        <div className="modal-backdrop" onClick={() => setShowSolutionModal(false)}>
          <div className="modal-content sudoku-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={() => setShowSolutionModal(false)}>×</button>
            <h2 className="modal-title">Reveal Solution?</h2>
            <p className="modal-description">
              Are you sure you want to see the solution? This will reveal all answers.
            </p>
            <div className="modal-buttons">
              <button 
                className="pixel-button pixel-button-primary modal-start-button"
                onClick={revealSolution}
              >
                Yes, Show Solution
              </button>
              <button 
                className="pixel-button pixel-button-secondary modal-cancel-button"
                onClick={() => setShowSolutionModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameOver && (
        <div className="modal-backdrop">
          <div className="modal-content sudoku-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Game Over!</h2>
            <p className="modal-description">
              You've made 3 mistakes. Would you like to see the solution or start a new game?
            </p>
            <div className="modal-buttons">
              <button 
                className="pixel-button pixel-button-primary modal-start-button"
                onClick={() => {
                  revealSolution();
                  setGameOver(false);
                }}
              >
                Show Solution
              </button>
              <button 
                className="pixel-button pixel-button-secondary modal-cancel-button"
                onClick={() => {
                  generatePuzzle(difficulty);
                  setGameOver(false);
                }}
              >
                New Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

