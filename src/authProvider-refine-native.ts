import { AuthProvider } from "@refinedev/core";
import { axiosInstance } from "./shared";

const TOKEN_KEY = "refine-auth";

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const response = await axiosInstance.post("/auth/login", { email, password });
      const data = response.data;
      
      localStorage.setItem(TOKEN_KEY, data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      
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
  },

  logout: async () => {
    // Intentar hacer logout en el servidor
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
    
    // Limpiar datos de autenticación
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("user");
    
    return {
      success: true,
      redirectTo: "/login",
    };
  },

  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (!token) {
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }

    // Verificar si el token está expirado
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (tokenPayload.exp && tokenPayload.exp < currentTime) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("user");
        return {
          authenticated: false,
          redirectTo: "/login",
        };
      }
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("user");
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }

    // Si tenemos un usuario en localStorage y el token es válido, no hacer petición al servidor
    const user = localStorage.getItem("user");
    if (user) {
      return {
        authenticated: true,
      };
    }

    // Solo verificar con el servidor si no tenemos datos de usuario
    try {
      const response = await axiosInstance.get("/auth/profile");
      const userData = response.data;
      localStorage.setItem("user", JSON.stringify(userData));
      return {
        authenticated: true,
      };
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("user");
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }
  },

  getPermissions: async () => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      return userData.role?.name || null;
    }
    return null;
  },

  getIdentity: async () => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      return userData;
    }
    return null;
  },

  onError: async (error) => {
    if (error.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("user");
      return {
        logout: true,
      };
    }

    return { error };
  },
};
