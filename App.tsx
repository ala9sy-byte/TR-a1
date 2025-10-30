
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import AdminRegisterScreen from './screens/AdminRegisterScreen';
import TravelerDashboard from './screens/TravelerDashboard';
import AdminDashboard from './screens/AdminDashboard';
import { db } from './services/db';

const AppContent: React.FC = () => {
    const { currentUser } = useAuth();
    const [authView, setAuthView] = useState<'login' | 'register' | 'admin_register'>('login');

    useEffect(() => {
        // Initialize the database with seed data if it's empty
        db.initialize();
    }, []);

    if (!currentUser) {
        switch (authView) {
            case 'register':
                return <RegisterScreen onSwitchToLogin={() => setAuthView('login')} />;
            case 'admin_register':
                return <AdminRegisterScreen onSwitchToLogin={() => setAuthView('login')} />;
            case 'login':
            default:
                return <LoginScreen onSwitchToRegister={() => setAuthView('register')} onSwitchToAdminRegister={() => setAuthView('admin_register')} />;
        }
    }

    if (currentUser.role === 'admin') {
        return <AdminDashboard />;
    }

    return <TravelerDashboard />;
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <div className="bg-brand-dark min-h-screen text-brand-text-light font-sans">
                <AppContent />
            </div>
        </AuthProvider>
    );
};

export default App;
