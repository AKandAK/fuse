import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { authService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

const Signup = () => {
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth();

    const handleSubmit = async (credentials) => {
        try {
            localStorage.removeItem(config.TOKEN_KEY);
            logout()
            await authService.signup(credentials);
            navigate('/login');
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
        />
    );
};

export default Signup; 