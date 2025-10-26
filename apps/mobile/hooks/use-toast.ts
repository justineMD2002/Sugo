import { useState, useCallback } from 'react';
import { ToastType } from '@/types';
import { APP_CONSTANTS } from '@/constants/app.constants';

/**
 * Custom hook for toast notifications
 */

export interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration?: number) => {
      setToast({
        visible: true,
        message,
        type,
      });

      // Auto-hide after duration
      setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, duration || APP_CONSTANTS.TOAST_DURATION);
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    toast,
    showToast,
    hideToast,
  };
};
