import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import SnackNotificationWrapper from './components/SnackNotificationWrapper';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SnackNotificationWrapper>
      <App />
    </SnackNotificationWrapper>
  </React.StrictMode>
);
