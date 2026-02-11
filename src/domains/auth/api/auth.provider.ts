import { AuthProvider } from "@refinedev/core";
import { AuthApi } from './auth.api';
import { AuthUtils } from '../utils/auth.utils';
import { LoginCredentials, AuthResult, AuthCheckResult } from '../types/auth.types';
import type { Language } from "../../../shared/contexts/language.context";

const AUTH_PROVIDER_TRANSLATIONS = {
  english: {
    invalidResponse: "Invalid response from server",
    invalidCredentials: "Invalid credentials",
  },
  spanish: {
    invalidResponse: "Respuesta inválida del servidor",
    invalidCredentials: "Credenciales inválidas",
  },
} as const;

const getStoredLanguage = (): Language => {
  if (typeof window === "undefined") return "english";
  const stored = window.localStorage.getItem("app-language");
  return stored === "english" || stored === "spanish" ? stored : "english";
};

export class AuthProviderService implements AuthProvider {
  async login({ email, password }: LoginCredentials): Promise<AuthResult> {
    console.log("🔐 AuthProvider.login() called with:", { email });
    try {
      console.log("📡 Calling AuthApi.login()...");
      const data = await AuthApi.login({ email, password });
      console.log("✅ AuthApi.login() returned:", data);
      
	      if (!data || !data.accessToken || !data.user) {
	        console.error("❌ Invalid response from AuthApi.login():", data);
	        const t = AUTH_PROVIDER_TRANSLATIONS[getStoredLanguage()];
	        return {
	          success: false,
	          error: {
	            name: "LoginError",
	            message: t.invalidResponse,
	          },
	        };
	      }
      
      console.log("💾 Setting token and user...");
      AuthUtils.setToken(data.accessToken);
      AuthUtils.setUser(data.user);
      console.log("✅ Token and user set successfully");
      
      const result = {
        success: true,
        redirectTo: "/",
      };
      console.log("🎉 AuthProvider.login() returning success:", result);
      return result;
	    } catch (error: any) {
	      console.error("❌ AuthProvider.login() error:", error);
	      console.error("❌ Error details:", {
	        message: error.message,
	        response: error.response?.data,
	        status: error.response?.status,
	      });
	      const t = AUTH_PROVIDER_TRANSLATIONS[getStoredLanguage()];
	      
	      const result = {
	        success: false,
	        error: {
	          name: "LoginError",
	          message: error.response?.data?.message || t.invalidCredentials,
	        },
	      };
      console.log("🚫 AuthProvider.login() returning error:", result);
      return result;
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
