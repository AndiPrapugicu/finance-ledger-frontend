import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';

export interface Alert {
  alertID: number;
  message: string;
  created_at: string;
  is_read: boolean;
  budget: number;
}

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Alert[]>(`${API_BASE_URL}/user/alerts/`);
      setAlerts(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: number) => {
    try {
      await axios.patch(`${API_BASE_URL}/user/alerts/${alertId}/`, { is_read: true });
      setAlerts(prev => prev.filter(alert => alert.alertID !== alertId));
    } catch (err) {
      console.error('Error marking alert as read:', err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  return { alerts, loading, error, markAsRead };
};