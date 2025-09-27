import { AuthProvider } from "@refinedev/core";

const TOKEN_KEY = "refine-auth";
const API_URL = "http://localhost:30000/api";

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(TOKEN_KEY, data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        return {
          success: true,
          redirectTo: "/",
        };
      }

      const errorData = await response.json();
      return {
        success: false,
        error: {
          name: "LoginError",
          message: errorData.message || "Invalid credentials",
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: "LoginError",
          message: "Something went wrong during login",
        },
      };
    }
  },

  logout: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    // Intentar hacer logout en el servidor
    if (token) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
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
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem("user", JSON.stringify(userData));
        return {
          authenticated: true,
        };
      } else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("user");
        return {
          authenticated: false,
          redirectTo: "/login",
        };
      }
    } catch (error) {
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
