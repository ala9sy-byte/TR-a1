
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SecurityIcon } from '../components/icons';

interface LoginScreenProps {
    onSwitchToRegister: () => void;
    onSwitchToAdminRegister: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSwitchToRegister, onSwitchToAdminRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loginType, setLoginType] = useState<'traveler' | 'admin'>('traveler');
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const user = await login(email, password);
            if (!user) {
                setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
            } else if (user.role !== loginType) {
                setError(`هذا الحساب ليس حساب ${loginType === 'traveler' ? 'مسافر' : 'مدير'}.`);
            }
        } catch (err) {
            setError('فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.');
        }
    };
    
    const TabButton: React.FC<{ type: 'traveler' | 'admin'; label: string; }> = ({ type, label }) => (
        <button
            type="button"
            onClick={() => { setLoginType(type); setError(''); }}
            className={`w-1/2 py-2 text-sm font-medium focus:outline-none ${loginType === type ? 'border-b-2 border-brand-blue text-white' : 'text-brand-text-dark'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-brand-dark">
             <div className="text-center mb-8">
                <SecurityIcon className="w-16 h-16 text-brand-blue mx-auto mb-4"/>
                <h1 className="text-4xl font-bold text-white">TRANUM</h1>
                <p className="text-brand-text-dark">رفيق سفرك الآمن والذكي</p>
            </div>

            <div className="w-full max-w-sm p-8 bg-brand-card rounded-lg shadow-lg">
                <div className="flex mb-6 border-b border-brand-light-blue">
                    <TabButton type="traveler" label="المسافر" />
                    <TabButton type="admin" label="المدير" />
                </div>
                
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-brand-text-dark mb-2">البريد الإلكتروني</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-brand-dark border border-brand-light-blue rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                            placeholder="example@email.com"
                            required
                        />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-brand-text-dark mb-2">كلمة المرور</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                             className="w-full px-3 py-2 bg-brand-dark border border-brand-light-blue rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                            placeholder="********"
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        className="w-full py-3 bg-brand-blue hover:bg-blue-700 rounded-md text-white font-semibold transition-colors"
                    >
                        تسجيل الدخول
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-brand-text-dark">
                    {loginType === 'traveler' ? (
                        <>
                            ليس لديك حساب؟{' '}
                            <button onClick={onSwitchToRegister} className="font-semibold text-brand-blue hover:underline">
                                تسجيل جديد
                            </button>
                        </>
                    ) : (
                         <>
                            <button onClick={onSwitchToAdminRegister} className="font-semibold text-brand-blue hover:underline">
                                تسجيل حساب مدير جديد
                            </button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
};

export default LoginScreen;
