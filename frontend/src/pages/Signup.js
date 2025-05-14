import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { authService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import { errorManager } from '../components/SnackNotification';

const Signup = () => {
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleSubmit = async (credentials) => {
        try {
            logout()
            await authService.signup(credentials);
            errorManager.notify("Sign up Sucess", 'info');
            navigate('/home');
        } catch (err) {
            setError(err.message || 'Signup failed. Please try again.');
        }
    };

    return (
        <AuthForm
            title="Sign Up"
            onSubmit={handleSubmit}
            error={error}
            buttonText="Sign Up"
            showLoginLink={true}
        />
    );
};

export default Signup; 