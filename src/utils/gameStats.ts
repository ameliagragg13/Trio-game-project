const API_BASE_URL = 'http://localhost:3000/api';

export interface GameStats {
  memory: number;
  tictactoe: number;
  sudoku: number;
}

/**
 * Gets the authentication token from localStorage
 */
function getToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * Gets game stats from the API
 */
export async function getGameStats(): Promise<GameStats> {
  const token = getToken();
  if (!token) {
    // No user logged in, return default stats
    return { memory: 0, tictactoe: 0, sudoku: 0 };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/games/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      return { memory: 0, tictactoe: 0, sudoku: 0 };
    }

    const stats = await response.json();
    return stats;
  } catch {
    return { memory: 0, tictactoe: 0, sudoku: 0 };
  }
}

/**
 * Increments the win count for a specific game
 */
export async function incrementGameWin(gameName: 'memory' | 'tictactoe' | 'sudoku'): Promise<void> {
  const token = getToken();
  if (!token) {
    console.warn('Cannot increment game win: no user logged in');
    return;
  }

  try {
    await fetch(`${API_BASE_URL}/games/stats/increment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ gameName })
    });
  } catch (error) {
    console.error('Failed to increment game win:', error);
  }
}

/**
 * Resets all game stats for the current user
 */
export async function resetGameStats(): Promise<void> {
  const token = getToken();
  if (!token) {
    return;
  }

  try {
    await fetch(`${API_BASE_URL}/games/stats/reset`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Failed to reset game stats:', error);
  }
}
