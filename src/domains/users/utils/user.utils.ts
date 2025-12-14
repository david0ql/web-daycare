import { User, UserRole } from '../types/user.types';

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

  static getRoleDisplayName(roleName: string): string {
    switch (roleName) {
      case "administrator":
        return "Administrator";
      case "educator":
        return "Educator";
      case "parent":
        return "Parent";
      case "staff":
        return "Staff";
      default:
        return roleName;
    }
  }

  static isActiveUser(user: User): boolean {
    return user.isActive;
  }

  static getLastLoginDisplay(lastLogin?: string): string {
    if (!lastLogin) return "Nunca";
    
    const date = new Date(lastLogin);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Hace menos de 1 hora";
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    
    return date.toLocaleDateString();
  }

  static formatPhoneNumber(phone?: string): string {
    if (!phone) return "No especificado";
    return phone;
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push("La contraseña debe tener al menos 8 caracteres");
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("La contraseña debe contener al menos una letra mayúscula");
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push("La contraseña debe contener al menos una letra minúscula");
    }
    
    if (!/\d/.test(password)) {
      errors.push("La contraseña debe contener al menos un número");
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
