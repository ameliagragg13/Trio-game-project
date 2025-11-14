import type { User } from '../types/auth';

const API_BASE_URL = 'http://localhost:3000/api';
const TOKEN_KEY = 'token';

// Store token in localStorage
function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Signs up a new user
 * @returns true if successful, false if username already exists
 */
export async function signUp(username: string, password: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    
    // CRITICAL: Save token to localStorage BEFORE returning
    if (data.token) {
      setToken(data.token);
    } else {
      console.error('No token received from signup response');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Signup error:', error);
    return false;
  }
}

/**
 * Logs in a user
 * @returns User object if valid, null if invalid
 */
export async function login(username: string, password: string): Promise<User | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    // CRITICAL: Save token to localStorage BEFORE returning
    if (data.token) {
      setToken(data.token);
    } else {
      console.error('No token received from login response');
      return null;
    }
    
    return { username: data.user.username, password: '' }; // Don't store password
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

/**
 * Logs out the current user
 */
export function logout(): void {
  // CRITICAL: Clear token from localStorage
  removeToken();
}

/**
 * Gets the current logged-in user
 * @returns User object or null if not logged in
 */
export async function getCurrentUser(): Promise<User | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      removeToken();
      return null;
    }

    const data = await response.json();
    return { username: data.user.username, password: '' };
  } catch {
    removeToken();
    return null;
  }
}

/**
 * Checks if a user is currently authenticated
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}
