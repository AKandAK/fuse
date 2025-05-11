import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';

const AuthRedirect = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Navigate to="/home" replace /> : children;
};

const AuthLayout = ({ children }) => {
    return <ProtectedRoute>{children}</ProtectedRoute>;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public routes */}
                    <Route
                        path="/login"
                        element={
                            <AuthRedirect>
                                <Login />
                            </AuthRedirect>
                        }
                    />
                    <Route
                        path="/signup"
                        element={
                            <AuthRedirect>
                                <Signup />
                            </AuthRedirect>
                        }
                    />
                    
                    {/* Protected routes */}
                    <Route
                        path="/home/*"
                        element={
                            <AuthLayout>
                                <Home />
                            </AuthLayout>
                        }
                    />
                    
                    <Route path="/" element={<Navigate to="/home" replace />} />
                    <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;