import React, { useContext } from 'react';
import { useAlerts } from '../../hooks/useAlerts';
import { ToastContext } from '../../hooks/useToast';
import { Icon } from './Icon';

export const AlertNotification: React.FC = () => {
  const { alerts, markAsRead } = useAlerts();
  const { showToast } = useContext(ToastContext);

  // Show new alerts as toasts
  React.useEffect(() => {
    alerts.forEach(alert => {
      showToast(alert.message, 'info');
      // Automatically mark as read after showing
      markAsRead(alert.alertID);
    });
  }, [alerts]);

  // The component doesn't need to render anything since we're using the toast system
  return null;
};