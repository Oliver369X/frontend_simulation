import React, { useState, useEffect } from 'react';
import { 
  Snackbar, Alert, AlertTitle,
  IconButton 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AppNotification } from '../types';

interface NotificationSystemProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onDismiss
}) => {
  const [queue, setQueue] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (notifications.length > 0) {
      setQueue(prev => [...prev, ...notifications]);
    }
  }, [notifications]);

  const handleClose = (id: string) => {
    setQueue(prev => prev.filter(n => n.id !== id));
    onDismiss(id);
  };

  return (
    <>
      {queue.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={6000}
          onClose={() => handleClose(notification.id)}
          anchorOrigin={{ 
            vertical: 'top', 
            horizontal: 'right' 
          }}
          style={{ top: `${index * 80}px` }}
        >
          <Alert severity={notification.type} onClose={() => handleClose(notification.id)}>
            <AlertTitle>{notification.title}</AlertTitle>
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
}; 