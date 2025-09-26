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
    console.log("🚪 AuthProvider.logout() called");
    const token = AuthUtils.getToken();
    console.log("🔑 Token exists for logout:", !!token);
    
    if (token) {
      try {
        console.log("🌐 Calling server logout...");
        await AuthApi.logout();
        console.log("✅ Server logout successful");
      } catch (error) {
        console.error("❌ Server logout error:", error);
        // Continuar con la limpieza local aunque falle el servidor
      }
    }
    
    // Limpiar autenticación local
    console.log("🧹 Clearing local authentication...");
    AuthUtils.clearAuth();
    console.log("✅ Local authentication cleared");
    
    return {
      success: true,
      redirectTo: "/login",
    };
  }

  async check(): Promise<AuthCheckResult> {
    console.log("🔍 AuthProvider.check() called");
    const token = AuthUtils.getToken();
    console.log("🔑 Token found:", !!token);
    
    if (!token) {
      console.log("❌ No token found, redirecting to login");
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }

    if (AuthUtils.isTokenExpired(token)) {
      console.log("⏰ Token expired, clearing authentication");
      AuthUtils.clearAuth();
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }

    try {
      console.log("🌐 Checking token with server...");
      const user = await AuthApi.getProfile();
      AuthUtils.setUser(user);
      console.log("✅ Authentication check successful");
      
      return {
        authenticated: true,
      };
    } catch (error) {
      console.error("❌ Auth check error:", error);
      console.log("🚫 Server rejected token, clearing authentication");
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
    console.error("Auth error:", error);
    
    if (error.status === 401) {
      console.log("401 error detected, clearing authentication");
      AuthUtils.clearAuth();
      return {
        logout: true,
      };
    }

    return { error };
  }
}

export const authProvider = new AuthProviderService();
