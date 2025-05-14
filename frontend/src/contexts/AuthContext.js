import React, { createContext, useState, useContext } from 'react';
import config from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem(config.TOKEN_KEY));
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);

    const login = (newToken) => {
        localStorage.setItem(config.TOKEN_KEY, newToken);
        setIsAuthenticated(true);
        setToken(newToken)
    };

    const logout = () => {
        localStorage.removeItem(config.TOKEN_KEY);
        setToken(null)
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 