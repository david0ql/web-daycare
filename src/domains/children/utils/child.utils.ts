import { Child } from "../types/child.types";
import type { Language } from "../../../shared/contexts/language.context";

export class ChildUtils {
  /**
   * Get full name of the child
   */
  static getFullName(child: Child): string {
    return `${child.firstName} ${child.lastName}`;
  }

  /**
   * Get initials of the child
   */
  static getInitials(child: Child): string {
    return `${child.firstName.charAt(0)}${child.lastName.charAt(0)}`.toUpperCase();
  }

  /**
   * Parse a date-only string (YYYY-MM-DD) as local date to avoid timezone shifting.
   * new Date("2026-02-17") is interpreted as UTC midnight and can show the previous day in local time.
   */
  static parseDateOnly(isoDateStr: string): Date {
    const parts = isoDateStr.split("-").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) {
      return new Date(isoDateStr);
    }
    const [y, m, d] = parts;
    return new Date(y, m - 1, d);
  }

  /**
   * Calculate age in years and months
   */
  static calculateAge(birthDate: string): { years: number; months: number } {
    const birth = ChildUtils.parseDateOnly(birthDate);
    const today = new Date();
    
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    return { years, months };
  }

  /**
   * Get age display string
   */
  static getAgeDisplay(birthDate: string, language: Language = "english"): string {
    const { years, months } = this.calculateAge(birthDate);
    
    if (years > 0) {
      return language === "spanish" ? `${years}a ${months}m` : `${years}y ${months}m`;
    }
    return language === "spanish" ? `${months} meses` : `${months} months`;
  }

  /**
   * Format birth date for display (parses YYYY-MM-DD as local date to avoid timezone shift)
   */
  static formatBirthDate(birthDate: string, language: Language = "english"): string {
    return ChildUtils.parseDateOnly(birthDate).toLocaleDateString(language === "spanish" ? "es-CO" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  /**
   * Get status color for payment alert
   */
  static getPaymentAlertColor(hasPaymentAlert: boolean): string {
    return hasPaymentAlert ? "red" : "green";
  }

  /**
   * Get status text for payment alert
   */
  static getPaymentAlertText(hasPaymentAlert: boolean, language: Language = "english"): string {
    if (language === "spanish") {
      return hasPaymentAlert ? "Alerta de pago" : "Al día";
    }
    return hasPaymentAlert ? "Payment Alert" : "Up to Date";
  }

  /**
   * Get status color for active status
   */
  static getActiveStatusColor(isActive: boolean): string {
    return isActive ? "green" : "red";
  }

  /**
   * Get status text for active status
   */
  static getActiveStatusText(isActive: boolean, language: Language = "english"): string {
    if (language === "spanish") {
      return isActive ? "Activo" : "Inactivo";
    }
    return isActive ? "Active" : "Inactive";
  }

  /**
   * Format address for display
   */
  static formatAddress(address?: string, language: Language = "english"): string {
    if (!address) return language === "spanish" ? "No especificado" : "Not specified";
    return address.length > 50 ? `${address.substring(0, 50)}...` : address;
  }

  /**
   * Format birth city for display
   */
  static formatBirthCity(birthCity?: string, language: Language = "english"): string {
    return birthCity || (language === "spanish" ? "No especificado" : "Not specified");
  }
}
