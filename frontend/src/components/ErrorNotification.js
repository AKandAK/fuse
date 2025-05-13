import React from 'react';
import { Snackbar, Alert } from '@mui/material';

class ErrorNotificationManager {
    constructor() {
        this.listeners = new Set();
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify(message) {
        this.listeners.forEach(listener => listener(message));
    }
}

export const errorManager = new ErrorNotificationManager();

const ErrorNotification = () => {
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        return errorManager.subscribe(message => {
            setError(message);
        });
    }, []);

    const handleClose = () => {
        setError(null);
    };

    return (
        <Snackbar
            open={!!error}
            autoHideDuration={4000}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
            <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                {error}
            </Alert>
        </Snackbar>
    );
};

export default ErrorNotification; 