import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import axiosInstance from '../utils/axios';

const Signup = () => {
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (credentials) => {
        try {
            await axiosInstance.post('/user/create', credentials);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed. Please try again.');
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