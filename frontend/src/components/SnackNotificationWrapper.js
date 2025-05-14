import React from 'react';
import SnackNotification from './SnackNotification';

const SnackNotificationWrapper = ({ children }) => {
    return (
        <>
            {children}
            <SnackNotification />
        </>
    );
};

export default SnackNotificationWrapper; 