import { User } from '../types/auth.types';

export class AuthUtils {
  private static readonly TOKEN_KEY = 'refine-auth';
  private static readonly USER_KEY = 'user';

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static getUser(): User | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  static removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  static clearAuth(): void {
    this.removeToken();
    this.removeUser();
    
    // Limpiar sessionStorage
    sessionStorage.clear();
    
    // Limpiar cualquier cache de la aplicación
    if (typeof window !== 'undefined' && window.caches) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return tokenPayload.exp && tokenPayload.exp < currentTime;
    } catch {
      return true;
    }
  }

  static getUserRole(): string | null {
    const user = this.getUser();
    return user?.role?.name || null;
  }
}
