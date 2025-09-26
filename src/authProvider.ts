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
        const response = await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          console.warn("Server logout failed, but continuing with local cleanup");
        }
      } catch (error) {
        console.error("Logout error:", error);
        // Continuar con la limpieza local aunque falle el servidor
      }
    }
    
    // Limpiar todos los datos de autenticación
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("user");
    sessionStorage.clear();
    
    // Limpiar cualquier cache de la aplicación
    if (typeof window !== 'undefined' && window.caches) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    return {
      success: true,
      redirectTo: "/login",
    };
  },

  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    // Si no hay token, no hacer petición
    if (!token) {
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }

    // Verificar si el token está expirado antes de hacer la petición
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (tokenPayload.exp && tokenPayload.exp < currentTime) {
        // Token expirado, limpiar localStorage
        console.log("Token expired, clearing authentication");
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("user");
        return {
          authenticated: false,
          redirectTo: "/login",
        };
      }
    } catch (error) {
      // Token inválido, limpiar localStorage
      console.log("Invalid token format, clearing authentication");
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("user");
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }

    // Token válido, verificar con el servidor
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const user = await response.json();
        localStorage.setItem("user", JSON.stringify(user));
        return {
          authenticated: true,
        };
      } else {
        // Token inválido en el servidor, limpiar localStorage
        console.log("Server rejected token, clearing authentication");
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("user");
        return {
          authenticated: false,
          redirectTo: "/login",
        };
      }
    } catch (error) {
      console.error("Auth check error:", error);
      // Error de red, mantener el token pero marcar como no autenticado
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
      return JSON.parse(user);
    }
    return null;
  },

  onError: async (error) => {
    console.error(error);
    if (error.status === 401) {
      // Limpiar autenticación en caso de error 401
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("user");
      return {
        logout: true,
      };
    }

    return { error };
  },
};
