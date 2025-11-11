import type { User } from '../types/auth';

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';

/**
 * Retrieves all users from localStorage
 */
function getUsers(): User[] {
  const usersJson = localStorage.getItem(USERS_KEY);
  if (!usersJson) return [];
  try {
    return JSON.parse(usersJson);
  } catch {
    return [];
  }
}

/**
 * Saves users array to localStorage
 */
function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/**
 * Signs up a new user
 * @returns true if successful, false if username already exists
 */
export function signUp(username: string, password: string): boolean {
  const users = getUsers();
  
  // Check if username already exists
  if (users.some(user => user.username === username)) {
    return false;
  }
  
  // Add new user
  const newUser: User = { username, password };
  users.push(newUser);
  saveUsers(users);
  
  return true;
}

/**
 * Logs in a user
 * @returns User object if valid, null if invalid
 */
export function login(username: string, password: string): User | null {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    // Store current user
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  }
  
  return null;
}

/**
 * Logs out the current user
 */
export function logout(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

/**
 * Gets the current logged-in user
 * @returns User object or null if not logged in
 */
export function getCurrentUser(): User | null {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

/**
 * Checks if a user is currently authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

