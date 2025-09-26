import { AuthProvider } from "@refinedev/core";
import { AuthApi } from './auth.api';
import { AuthUtils } from '../utils/auth.utils';
import { LoginCredentials, AuthResult, AuthCheckResult } from '../types/auth.types';

export class AuthProviderService implements AuthProvider {
  async login({ email, password }: LoginCredentials): Promise<AuthResult> {
    try {
      const data = await AuthApi.login({ email, password });
      
      AuthUtils.setToken(data.accessToken);
      AuthUtils.setUser(data.user);
      
      return {
        success: true,
        redirectTo: "/",
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          name: "LoginError",
          message: error.response?.data?.message || "Invalid credentials",
        },
      };
    }
  }

  async logout(): Promise<AuthResult> {
    const token = AuthUtils.getToken();
    
    if (token) {
      try {
        await AuthApi.logout();
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    
    AuthUtils.clearAuth();
    
    return {
      success: true,
      redirectTo: "/login",
    };
  }

  async check(): Promise<AuthCheckResult> {
    const token = AuthUtils.getToken();
    
    if (!token) {
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }

    if (AuthUtils.isTokenExpired(token)) {
      AuthUtils.clearAuth();
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }

    try {
      const user = await AuthApi.getProfile();
      AuthUtils.setUser(user);
      
      return {
        authenticated: true,
      };
    } catch (error) {
      console.error("Auth check error:", error);
      AuthUtils.clearAuth();
      
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }
  }

  async getPermissions(): Promise<string | null> {
    return AuthUtils.getUserRole();
  }

  async getIdentity(): Promise<any> {
    return AuthUtils.getUser();
  }

  async onError(error: any): Promise<any> {
    console.error(error);
    
    if (error.status === 401) {
      return {
        logout: true,
      };
    }

    return { error };
  }
}

export const authProvider = new AuthProviderService();
