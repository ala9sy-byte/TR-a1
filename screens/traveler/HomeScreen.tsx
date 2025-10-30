import React, { useState, useEffect } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/db';
import { GoogleGenAI } from "@google/genai";
import { ProfileIcon } from '../../components/icons';

const StatCard: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div className="bg-brand-card p-4 rounded-lg text-center">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-brand-text-dark">{label}</p>
    </div>
);

const SmartAssistant: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const askGemini = async () => {
        if (!prompt) return;
        setIsLoading(true);
        setError('');
        setResponse('');
        try {
            if (!process.env.API_KEY) {
                // This is a mock response for environments without an API key
                setResponse("بالتأكيد! أفضل الأماكن لزيارة باريس تشمل برج إيفل، ومتحف اللوفر، وكاتدرائية نوتردام. رحلة سعيدة!");
                return;
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `As a travel assistant, answer this user question concisely: "${prompt}"`,
            });
            setResponse(result.text);
        } catch (e) {
            console.error(e);
            setError('عذرًا، حدث خطأ أثناء الاتصال بالمساعد الذكي.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-brand-card p-4 rounded-lg mt-6">
            <h3 className="font-semibold text-lg mb-2">مساعدك الذكي</h3>
            <p className="text-sm text-brand-text-dark mb-4">اسأل عن وجهتك، نصائح السفر، أو أي شيء آخر...</p>
            <div className="flex space-x-2 rtl:space-x-reverse">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && askGemini()}
                    placeholder="مثال: أفضل الأماكن للزيارة في باريس؟"
                    className="flex-grow p-2 bg-brand-dark border border-brand-light-blue rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
                <button
                    onClick={askGemini}
                    disabled={isLoading}
                    className="px-6 py-2 bg-brand-blue hover:bg-blue-700 rounded-md text-white font-semibold transition-colors disabled:bg-gray-500"
                >
                    {isLoading ? '...' : 'اسأل'}
                </button>
            </div>
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
            {response && <div className="mt-4 p-3 bg-brand-dark rounded-md text-sm whitespace-pre-wrap">{response}</div>}
        </div>
    );
};

const UserStatus: React.FC = () => {
    const { currentUser } = useAuth();
    if (!currentUser) return null;

    let statusText = currentUser.gender === 'female' ? 'امرأة' : 'رجل';
    if (currentUser.dateOfBirth) {
        const age = new Date().getFullYear() - new Date(currentUser.dateOfBirth).getFullYear();
        if (age >= 65) {
            statusText = 'مسن';
        }
    }

    const isPersonOfDetermination = currentUser.healthStatus === 'من أصحاب الهمم';

    return (
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-brand-text-dark mt-1">
            <span>{statusText}</span>
            {isPersonOfDetermination && (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v5a1 1 0 001 1h4a1 1 0 100-2H11V5z" clipRule="evenodd" />
                    <path d="M9 3a1 1 0 012 0v1h1a1 1 0 110 2H9.5a1 1 0 00-1 1v2.286A2.25 2.25 0 0110 12a2.25 2.25 0 012.25 2.25c0 .5-.16 1.05-.5 1.5H14a1 1 0 110 2h-1.55a3.752 3.752 0 01-5.9 0H5a1 1 0 110-2h1.5a2.25 2.25 0 100-4.5H8V8a1 1 0 011-1V5a1 1 0 01-1-1H6a1 1 0 110-2h2a1 1 0 011 1z" />
                 </svg>
            )}
        </div>
    );
}


const HomeScreen: React.FC = () => {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({ trips: 0, health: 0, documents: 0 });

    useEffect(() => {
        if (currentUser?.id) {
            const documents = db.getDocuments(currentUser.id);
            const activeDocs = documents.filter(d => new Date(d.expiryDate) >= new Date());
            setStats({
                trips: db.getTrips(currentUser.id).length,
                health: db.getHealthRecords(currentUser.id).length,
                documents: activeDocs.length,
            });
        }
    }, [currentUser]);

    if (!currentUser) return null;

    return (
        <div className="p-4">
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                     <div className="w-16 h-16 rounded-full bg-brand-light-blue flex items-center justify-center overflow-hidden">
                        {currentUser.profilePicture ? (
                            <img src={currentUser.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <ProfileIcon className="w-10 h-10 text-brand-dark"/>
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{currentUser.fullName}</h1>
                        <p className="text-brand-blue font-mono">{currentUser.trNumber}</p>
                        <UserStatus />
                    </div>
                </div>
                <div className="bg-brand-card p-2 rounded-lg">
                    {currentUser.trNumber && <QRCode value={currentUser.trNumber} size={70} bgColor="#142745" fgColor="#FFFFFF" />}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <StatCard label="إجمالي السفرات" value={stats.trips} />
                <StatCard label="السجلات الصحية" value={stats.health} />
                <StatCard label="الوثائق النشطة" value={stats.documents} />
            </div>

            <SmartAssistant />
        </div>
    );
};

export default HomeScreen;