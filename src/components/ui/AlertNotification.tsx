import React, { useContext } from 'react';
import { useAlerts } from '../../hooks/useAlerts';
import { ToastContext } from '../../hooks/useToast';


export const AlertNotification: React.FC = () => {
  const { alerts, markAsRead } = useAlerts();
  const toastContext = useContext(ToastContext);

  // Show new alerts as toasts
  React.useEffect(() => {
    if (toastContext) {
      alerts.forEach(alert => {
        toastContext.showToast(alert.message, 'info');
        // Automatically mark as read after showing
        markAsRead(alert.alertID);
      });
    }
  }, [alerts]);

  // The component doesn't need to render anything since we're using the toast system
  return null;
};