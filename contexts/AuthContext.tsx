
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { db } from '../services/db';

interface AuthContextType {
    currentUser: User | null;
    login: (email: string, passwordHash: string) => Promise<User | null>;
    logout: () => void;
    register: (fullName: string, email: string, passwordHash: string) => Promise<User | null>;
    updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, []);

    const login = async (email: string, passwordHash: string): Promise<User | null> => {
        const user = db.loginUser(email, passwordHash);
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            setCurrentUser(user);
        }
        return user;
    };

    const logout = () => {
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
    };

    const register = async (fullName: string, email: string, passwordHash: string): Promise<User | null> => {
        const newUser = db.registerUser(fullName, email, passwordHash);
        if (newUser) {
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            setCurrentUser(newUser);
        }
        return newUser;
    };

    const updateUser = (updatedUser: User) => {
        const success = db.updateUser(updatedUser);
        if (success) {
            setCurrentUser(updatedUser);
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, register, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
   