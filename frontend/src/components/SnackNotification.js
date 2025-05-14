import React from 'react';
import { Snackbar, Alert } from '@mui/material';

class SnackNotificationManager {
    constructor() {
        this.listeners = new Set();
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify(message, severity = 'error') {
        this.listeners.forEach(listener => listener({ message, severity }));
    }
}

export const errorManager = new SnackNotificationManager();

const SnackNotification = () => {
    const [notification, setNotification] = React.useState(null);

    React.useEffect(() => {
        return errorManager.subscribe(notification => {
            setNotification(notification);
        });
    }, []);

    const handleClose = () => {
        setNotification(null);
    };

    return (
        <Snackbar
            open={!!notification}
            autoHideDuration={4000}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
            <Alert onClose={handleClose} severity={notification?.severity || 'error'} sx={{ width: '100%' }}>
                {notification?.message}
            </Alert>
        </Snackbar>
    );
};

export default SnackNotification; 