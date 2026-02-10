import { Child } from "../types/child.types";

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
   * Calculate age in years and months
   */
  static calculateAge(birthDate: string): { years: number; months: number } {
    const birth = new Date(birthDate);
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
  static getAgeDisplay(birthDate: string): string {
    const { years, months } = this.calculateAge(birthDate);
    
    if (years > 0) {
      return `${years}y ${months}m`;
    }
    return `${months} months`;
  }

  /**
   * Format birth date for display
   */
  static formatBirthDate(birthDate: string): string {
    return new Date(birthDate).toLocaleDateString("en-US", {
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
  static getPaymentAlertText(hasPaymentAlert: boolean): string {
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
  static getActiveStatusText(isActive: boolean): string {
    return isActive ? "Active" : "Inactive";
  }

  /**
   * Format address for display
   */
  static formatAddress(address?: string): string {
    if (!address) return "Not specified";
    return address.length > 50 ? `${address.substring(0, 50)}...` : address;
  }

  /**
   * Format birth city for display
   */
  static formatBirthCity(birthCity?: string): string {
    return birthCity || "Not specified";
  }
}