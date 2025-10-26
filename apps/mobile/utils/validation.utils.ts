import { APP_CONSTANTS } from '@/constants/app.constants';

/**
 * Validation utility functions
 */

export class ValidationUtils {
  /**
   * Validate Philippine phone number
   */
  static isValidPhilippineNumber(phone: string): boolean {
    const cleaned = phone.replace(/[\s-]/g, '');
    return (
      APP_CONSTANTS.PHONE_PATTERNS.INTERNATIONAL.test(cleaned) ||
      APP_CONSTANTS.PHONE_PATTERNS.LOCAL.test(cleaned)
    );
  }

  /**
   * Validate email address
   */
  static isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  /**
   * Validate rating value
   */
  static isValidRating(rating: number): boolean {
    return (
      rating >= APP_CONSTANTS.MIN_RATING &&
      rating <= APP_CONSTANTS.MAX_RATING
    );
  }

  /**
   * Validate password strength
   */
  static isValidPassword(password: string): boolean {
    // At least 8 characters
    return password.length >= 8;
  }

  /**
   * Check if string is empty or whitespace
   */
  static isEmpty(value: string): boolean {
    return !value || value.trim().length === 0;
  }

  /**
   * Validate form fields are not empty
   */
  static areFieldsValid(...fields: string[]): boolean {
    return fields.every((field) => !this.isEmpty(field));
  }
}
