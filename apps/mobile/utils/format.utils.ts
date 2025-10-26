/**
 * Formatting utility functions
 */

export class FormatUtils {
  /**
   * Format currency (PHP)
   */
  static formatCurrency(amount: number): string {
    return `₱${amount.toFixed(2)}`;
  }

  /**
   * Format phone number to display format
   */
  static formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');

    // Format as +63 9XX XXX XXXX
    if (cleaned.startsWith('63')) {
      const formatted = cleaned.slice(2);
      return `+63 ${formatted.slice(0, 3)} ${formatted.slice(3, 6)} ${formatted.slice(6)}`;
    }

    // Format as 09XX XXX XXXX
    if (cleaned.startsWith('09')) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }

    return phone;
  }

  /**
   * Format date to readable string
   */
  static formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Format time to readable string
   */
  static formatTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  /**
   * Format date and time
   */
  static formatDateTime(date: string | Date): string {
    return `${this.formatDate(date)} ${this.formatTime(date)}`;
  }

  /**
   * Get relative time (e.g., "2 hours ago")
   */
  static getRelativeTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return this.formatDate(d);
  }

  /**
   * Truncate text with ellipsis
   */
  static truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
  }

  /**
   * Capitalize first letter
   */
  static capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /**
   * Convert to title case
   */
  static toTitleCase(text: string): string {
    return text
      .split(' ')
      .map((word) => this.capitalize(word.toLowerCase()))
      .join(' ');
  }
}
