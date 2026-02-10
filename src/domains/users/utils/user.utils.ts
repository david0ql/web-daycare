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
    if (!lastLogin) return "Never";

    const date = new Date(lastLogin);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Less than 1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return date.toLocaleDateString();
  }

  static formatPhoneNumber(phone?: string): string {
    if (!phone) return "Not specified";
    return phone;
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
