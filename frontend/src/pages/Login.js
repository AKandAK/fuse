import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/apiService';

const Login = () => {
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (credentials) => {
        try {
            const { token } = await authService.login(credentials);
            login(token);
            navigate('/home');
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        }
    };

    return (
        <AuthForm
            title="Login"
            onSubmit={handleSubmit}
            error={error}
            buttonText="Login"
            showSignupLink={true}
        />
    );
};

export default Login; 