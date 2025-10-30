
import React, { useState } from 'react';
import { View } from '../types';
import BottomNav from '../components/BottomNav';
import HomeScreen from './traveler/HomeScreen';
import TripsScreen from './traveler/TripsScreen';
import HealthScreen from './traveler/HealthScreen';
import DocumentsScreen from './traveler/DocumentsScreen';
import LuggageScreen from './traveler/LuggageScreen';
import ProfileScreen from './traveler/ProfileScreen';

const TravelerDashboard: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>(View.Home);

    const renderContent = () => {
        switch (currentView) {
            case View.Home:
                return <HomeScreen />;
            case View.Trips:
                return <TripsScreen />;
            case View.Health:
                return <HealthScreen />;
            case View.Documents:
                return <DocumentsScreen />;
            case View.Luggage:
                return <LuggageScreen />;
            case View.Profile:
                return <ProfileScreen />;
            default:
                return <HomeScreen />;
        }
    };

    return (
        <div className="pb-20">
            {renderContent()}
            <BottomNav currentView={currentView} setView={setCurrentView} />
        </div>
    );
};

export default TravelerDashboard;
   