import React from 'react';
import ErrorNotification from './ErrorNotification';

const ErrorNotificationWrapper = ({ children }) => {
    return (
        <>
            {children}
            <ErrorNotification />
        </>
    );
};

export default ErrorNotificationWrapper; 