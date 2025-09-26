import * as moment from 'moment';
import { Child } from '../types/child.types';

export class ChildUtils {
  static getFullName(child: Child): string {
    return `${child.firstName} ${child.lastName}`.trim();
  }

  static getInitials(child: Child): string {
    const firstName = child.firstName?.charAt(0) || '';
    const lastName = child.lastName?.charAt(0) || '';
    return `${firstName}${lastName}`.toUpperCase();
  }

  static calculateAge(birthDate: string): string {
    const birth = moment(birthDate);
    const now = moment();
    const years = now.diff(birth, "years");
    const months = now.diff(birth, "months") % 12;
    
    if (years > 0) {
      return `${years}a ${months}m`;
    }
    return `${months} meses`;
  }

  static getAgeInMonths(birthDate: string): number {
    const birth = moment(birthDate);
    const now = moment();
    return now.diff(birth, "months");
  }

  static getAgeInYears(birthDate: string): number {
    const birth = moment(birthDate);
    const now = moment();
    return now.diff(birth, "years");
  }

  static formatBirthDate(birthDate: string): string {
    return moment(birthDate).format('DD/MM/YYYY');
  }

  static getBirthdayStatus(birthDate: string): { isToday: boolean; daysUntil: number } {
    const birth = moment(birthDate);
    const now = moment();
    const thisYearBirthday = moment(birth).year(now.year());
    
    if (thisYearBirthday.isSame(now, 'day')) {
      return { isToday: true, daysUntil: 0 };
    }
    
    if (thisYearBirthday.isBefore(now)) {
      const nextYearBirthday = moment(birth).year(now.year() + 1);
      return { isToday: false, daysUntil: nextYearBirthday.diff(now, 'days') };
    }
    
    return { isToday: false, daysUntil: thisYearBirthday.diff(now, 'days') };
  }

  static isActiveChild(child: Child): boolean {
    return child.isActive;
  }

  static hasPaymentAlert(child: Child): boolean {
    return child.hasPaymentAlert;
  }

  static getParentDisplayName(child: Child): string {
    if (!child.parent) return "No asignado";
    return `${child.parent.firstName} ${child.parent.lastName}`;
  }

  static getCategoryDisplayName(child: Child): string {
    if (!child.category) return "Sin categoría";
    return child.category.name;
  }

  static formatAddress(address?: string): string {
    if (!address) return "No especificada";
    return address;
  }

  static formatBirthCity(birthCity?: string): string {
    if (!birthCity) return "No especificada";
    return birthCity;
  }

  static validateBirthDate(birthDate: string): { isValid: boolean; error?: string } {
    const birth = moment(birthDate);
    const now = moment();
    
    if (birth.isAfter(now)) {
      return { isValid: false, error: "La fecha de nacimiento no puede ser futura" };
    }
    
    const ageInYears = now.diff(birth, 'years');
    if (ageInYears > 18) {
      return { isValid: false, error: "La edad no puede ser mayor a 18 años" };
    }
    
    return { isValid: true };
  }

  static getStatusColor(child: Child): string {
    if (!child.isActive) return "red";
    if (child.hasPaymentAlert) return "orange";
    return "green";
  }

  static getStatusText(child: Child): string {
    if (!child.isActive) return "Inactivo";
    if (child.hasPaymentAlert) return "Alerta de Pago";
    return "Activo";
  }
}
