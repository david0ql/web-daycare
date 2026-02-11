import { User, UserRole } from '../types/user.types';
import type { Language } from '../../../shared/contexts/language.context';

export class UserUtils {
  static getFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`.trim();
  }

  static getInitials(user: User): string {
    const firstName = user.firstName?.charAt(0) || '';
    const lastName = user.lastName?.charAt(0) || '';
    return `${firstName}${lastName}`.toUpperCase();
  }

  static getRoleColor(roleName: string): string {
    switch (roleName) {
      case "administrator":
        return "red";
      case "educator":
        return "blue";
      case "parent":
        return "green";
      case "staff":
        return "orange";
      default:
        return "default";
    }
  }

  static getRoleDisplayName(roleName: string, language: Language = "english"): string {
    switch (roleName) {
      case "administrator":
        return language === "spanish" ? "Administrador" : "Administrator";
      case "educator":
        return language === "spanish" ? "Educador" : "Educator";
      case "parent":
        return language === "spanish" ? "Padre/Madre" : "Parent";
      case "staff":
        return language === "spanish" ? "Personal" : "Staff";
      default:
        return roleName;
    }
  }

  static isActiveUser(user: User): boolean {
    return user.isActive;
  }

  static getLastLoginDisplay(lastLogin?: string, language: Language = "english"): string {
    const t = {
      english: {
        never: "Never",
        lessThan1Hour: "Less than 1 hour ago",
        hoursAgo: "hours ago",
        daysAgo: "days ago",
      },
      spanish: {
        never: "Nunca",
        lessThan1Hour: "Hace menos de 1 hora",
        hoursAgo: "horas",
        daysAgo: "días",
      },
    } as const;

    if (!lastLogin) return t[language].never;

    const date = new Date(lastLogin);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return t[language].lessThan1Hour;
    if (diffInHours < 24) return `${diffInHours} ${t[language].hoursAgo}`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ${t[language].daysAgo}`;

    return date.toLocaleDateString();
  }

  static formatPhoneNumber(phone?: string, language: Language = "english"): string {
    if (!phone) return language === "spanish" ? "No especificado" : "Not specified";
    return phone;
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(
    password: string,
    language: Language = "english",
  ): { isValid: boolean; errors: string[] } {
    const t = {
      english: {
        min: "Password must be at least 8 characters",
        uppercase: "Password must contain at least one uppercase letter",
        lowercase: "Password must contain at least one lowercase letter",
        number: "Password must contain at least one number",
      },
      spanish: {
        min: "La contraseña debe tener al menos 8 caracteres",
        uppercase: "La contraseña debe contener al menos una letra mayúscula",
        lowercase: "La contraseña debe contener al menos una letra minúscula",
        number: "La contraseña debe contener al menos un número",
      },
    } as const;
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push(t[language].min);
    }

    if (!/[A-Z]/.test(password)) {
      errors.push(t[language].uppercase);
    }

    if (!/[a-z]/.test(password)) {
      errors.push(t[language].lowercase);
    }

    if (!/\d/.test(password)) {
      errors.push(t[language].number);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
