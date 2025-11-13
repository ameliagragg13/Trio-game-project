import { getCurrentUser } from './auth';

const GAME_STATS_KEY_PREFIX = 'gameStats_';

export interface GameStats {
  memory: number;
  tictactoe: number;
  sudoku: number;
}

/**
 * Gets the user-specific game stats key
 */
function getGameStatsKey(): string | null {
  const user = getCurrentUser();
  if (!user) return null;
  return `${GAME_STATS_KEY_PREFIX}${user.username}`;
}

export function getGameStats(): GameStats {
  const statsKey = getGameStatsKey();
  if (!statsKey) {
    // No user logged in, return default stats
    return { memory: 0, tictactoe: 0, sudoku: 0 };
  }
  
  const statsJson = localStorage.getItem(statsKey);
  if (!statsJson) {
    // User exists but no stats yet, return default
    return { memory: 0, tictactoe: 0, sudoku: 0 };
  }
  try {
    return JSON.parse(statsJson);
  } catch {
    return { memory: 0, tictactoe: 0, sudoku: 0 };
  }
}

export function incrementGameWin(gameName: 'memory' | 'tictactoe' | 'sudoku'): void {
  const statsKey = getGameStatsKey();
  if (!statsKey) {
    // No user logged in, can't save stats
    console.warn('Cannot increment game win: no user logged in');
    return;
  }
  
  const stats = getGameStats();
  stats[gameName] = (stats[gameName] || 0) + 1;
  localStorage.setItem(statsKey, JSON.stringify(stats));
}

export function resetGameStats(): void {
  const statsKey = getGameStatsKey();
  if (!statsKey) {
    // No user logged in, nothing to reset
    return;
  }
  localStorage.removeItem(statsKey);
}

