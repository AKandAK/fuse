import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { authService } from '../services/apiService';

const Signup = () => {
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (credentials) => {
        try {
            await authService.signup(credentials);
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
        />
    );
};

export default Signup; 