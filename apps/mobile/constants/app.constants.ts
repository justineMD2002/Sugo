/**
 * Application-wide constants
 */

export const APP_CONSTANTS = {
  // Pricing
  SERVICE_FEE: 15,
  BASE_AMOUNT: 50,

  // OTP
  OTP_LENGTH: 6,
  OTP_TIMER_SECONDS: 300, // 5 minutes

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Phone validation
  PHONE_PATTERNS: {
    INTERNATIONAL: /^\+639\d{9}$/,
    LOCAL: /^09\d{9}$/,
  },

  // Rating
  MIN_RATING: 1,
  MAX_RATING: 5,

  // Messages
  MAX_MESSAGE_LENGTH: 1000,

  // Real-time polling intervals (ms)
  REALTIME_POLL_INTERVAL: 5000,

  // Toast duration (ms)
  TOAST_DURATION: 3000,
} as const;

export const COLORS = {
  PRIMARY: '#dc2626',
  PRIMARY_DARK: '#b91c1c',
  BLUE: '#2563eb',
  GRAY_BUTTON: '#4b5563',
  GREEN: '#16a34a',
  PURPLE: '#8b5cf6',
  TEXT: '#111827',
  SUBTITLE: '#6b7280',
  BACKGROUND: '#f9fafb',
  CARD_BG: '#ffffff',
  BORDER: '#e5e7eb',
  ERROR: '#ef4444',
  WARNING: '#f59e0b',
  SUCCESS: '#10b981',
} as const;

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 20,
  XXL: 24,
} as const;
