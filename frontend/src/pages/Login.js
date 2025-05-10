import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axios';

const Login = () => {
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (credentials) => {
        try {
            const response = await axiosInstance.post('/user/login', credentials);
            login(response.data.token);
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
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