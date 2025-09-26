export class ValidationUtils {
  static validateEmail(email: string): { isValid: boolean; error?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      return { isValid: false, error: "El email es requerido" };
    }
    
    if (!emailRegex.test(email)) {
      return { isValid: false, error: "El formato del email no es válido" };
    }
    
    return { isValid: true };
  }

  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!password) {
      errors.push("La contraseña es requerida");
      return { isValid: false, errors };
    }
    
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

  static validatePhone(phone: string): { isValid: boolean; error?: string } {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    
    if (!phone) {
      return { isValid: false, error: "El teléfono es requerido" };
    }
    
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return { isValid: false, error: "El formato del teléfono no es válido" };
    }
    
    return { isValid: true };
  }

  static validateRequired(value: any, fieldName: string): { isValid: boolean; error?: string } {
    if (value === null || value === undefined || value === '') {
      return { isValid: false, error: `${fieldName} es requerido` };
    }
    
    return { isValid: true };
  }

  static validateMinLength(value: string, minLength: number, fieldName: string): { isValid: boolean; error?: string } {
    if (!value || value.length < minLength) {
      return { isValid: false, error: `${fieldName} debe tener al menos ${minLength} caracteres` };
    }
    
    return { isValid: true };
  }

  static validateMaxLength(value: string, maxLength: number, fieldName: string): { isValid: boolean; error?: string } {
    if (value && value.length > maxLength) {
      return { isValid: false, error: `${fieldName} no puede tener más de ${maxLength} caracteres` };
    }
    
    return { isValid: true };
  }

  static validateNumber(value: any, fieldName: string): { isValid: boolean; error?: string } {
    if (value === null || value === undefined || value === '') {
      return { isValid: false, error: `${fieldName} es requerido` };
    }
    
    const num = Number(value);
    if (isNaN(num)) {
      return { isValid: false, error: `${fieldName} debe ser un número válido` };
    }
    
    return { isValid: true };
  }

  static validateMinValue(value: number, minValue: number, fieldName: string): { isValid: boolean; error?: string } {
    if (value < minValue) {
      return { isValid: false, error: `${fieldName} debe ser mayor o igual a ${minValue}` };
    }
    
    return { isValid: true };
  }

  static validateMaxValue(value: number, maxValue: number, fieldName: string): { isValid: boolean; error?: string } {
    if (value > maxValue) {
      return { isValid: false, error: `${fieldName} debe ser menor o igual a ${maxValue}` };
    }
    
    return { isValid: true };
  }

  static validateDate(date: string, fieldName: string): { isValid: boolean; error?: string } {
    if (!date) {
      return { isValid: false, error: `${fieldName} es requerido` };
    }
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return { isValid: false, error: `${fieldName} debe ser una fecha válida` };
    }
    
    return { isValid: true };
  }

  static validateFutureDate(date: string, fieldName: string): { isValid: boolean; error?: string } {
    const dateValidation = this.validateDate(date, fieldName);
    if (!dateValidation.isValid) {
      return dateValidation;
    }
    
    const dateObj = new Date(date);
    const now = new Date();
    
    if (dateObj <= now) {
      return { isValid: false, error: `${fieldName} debe ser una fecha futura` };
    }
    
    return { isValid: true };
  }

  static validatePastDate(date: string, fieldName: string): { isValid: boolean; error?: string } {
    const dateValidation = this.validateDate(date, fieldName);
    if (!dateValidation.isValid) {
      return dateValidation;
    }
    
    const dateObj = new Date(date);
    const now = new Date();
    
    if (dateObj >= now) {
      return { isValid: false, error: `${fieldName} debe ser una fecha pasada` };
    }
    
    return { isValid: true };
  }

  static validateUrl(url: string, fieldName: string): { isValid: boolean; error?: string } {
    if (!url) {
      return { isValid: false, error: `${fieldName} es requerido` };
    }
    
    try {
      new URL(url);
      return { isValid: true };
    } catch {
      return { isValid: false, error: `${fieldName} debe ser una URL válida` };
    }
  }
}
