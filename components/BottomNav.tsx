
import React from 'react';
import { View } from '../types';
import { HomeIcon, TripsIcon, HealthIcon, DocumentsIcon, LuggageIcon, ProfileIcon } from './icons';

interface BottomNavProps {
    currentView: View;
    setView: (view: View) => void;
}

const NavItem: React.FC<{
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon: Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs ${isActive ? 'text-brand-blue' : 'text-brand-text-dark'}`}
    >
        <Icon className="w-6 h-6 mb-1" />
        <span>{label}</span>
    </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
    const navItems = [
        { view: View.Home, icon: HomeIcon, label: 'الرئيسية' },
        { view: View.Trips, icon: TripsIcon, label: 'السفرات' },
        { view: View.Health, icon: HealthIcon, label: 'الصحة' },
        { view: View.Documents, icon: DocumentsIcon, label: 'الوثائق' },
        { view: View.Luggage, icon: LuggageIcon, label: 'الأمتعة' },
        { view: View.Profile, icon: ProfileIcon, label: 'ملفي' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-brand-card shadow-lg z-50">
            <div className="flex justify-around max-w-lg mx-auto">
                {navItems.map((item) => (
                    <NavItem
                        key={item.view}
                        icon={item.icon}
                        label={item.label}
                        isActive={currentView === item.view}
                        onClick={() => setView(item.view)}
                    />
                ))}
            </div>
        </div>
    );
};

export default BottomNav;
   