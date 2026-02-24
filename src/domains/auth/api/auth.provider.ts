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
    try {
      const data = await AuthApi.login({ email, password });
      
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
      
      AuthUtils.setToken(data.accessToken);
      AuthUtils.setUser(data.user);
      
      const result = {
        success: true,
        redirectTo: "/",
      };
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
      return result;
    }
  }

  async logout(): Promise<AuthResult> {
    const token = AuthUtils.getToken();
    
    if (token) {
      try {
        await AuthApi.logout();
      } catch (error) {
        console.error("❌ Server logout error:", error);
        // Continuar con la limpieza local aunque falle el servidor
      }
    }
    
    // Limpiar autenticación local
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
      console.error("❌ Auth check error:", error);
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
      AuthUtils.clearAuth();
      return {
        logout: true,
      };
    }

    return { error };
  }
}

export const authProvider = new AuthProviderService();
