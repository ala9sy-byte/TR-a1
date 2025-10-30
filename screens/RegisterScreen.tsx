
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SecurityIcon } from '../components/icons';

interface RegisterScreenProps {
    onSwitchToLogin: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onSwitchToLogin }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [trNumber, setTrNumber] = useState('');

    const { register } = useAuth();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('كلمتا المرور غير متطابقتين');
            return;
        }

        try {
            const newUser = await register(fullName, email, password);
            if (newUser && newUser.trNumber) {
                setSuccessMessage(`تم التسجيل بنجاح! رقمك الخاص هو:`);
                setTrNumber(newUser.trNumber);
            } else {
                 setError('هذا البريد الإلكتروني مسجل بالفعل');
            }
        } catch (err) {
            setError('فشل التسجيل. يرجى المحاولة مرة أخرى.');
        }
    };

    if (successMessage) {
        return (
             <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-brand-dark text-center">
                 <div className="w-full max-w-sm p-8 bg-brand-card rounded-lg shadow-lg">
                    <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">{successMessage}</h2>
                    <div className="bg-brand-dark text-brand-blue font-mono text-lg py-2 px-4 rounded border border-brand-blue my-4">
                        {trNumber}
                    </div>
                    <button onClick={onSwitchToLogin} className="w-full py-3 bg-brand-blue hover:bg-blue-700 rounded-md text-white font-semibold transition-colors">
                        الانتقال إلى تسجيل الدخول
                    </button>
                 </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-brand-dark">
            <div className="text-center mb-8">
                <SecurityIcon className="w-16 h-16 text-brand-blue mx-auto mb-4"/>
                <h1 className="text-4xl font-bold text-white">TRANUM</h1>
                <p className="text-brand-text-dark">إنشاء حساب مسافر جديد</p>
            </div>

            <div className="w-full max-w-sm p-8 bg-brand-card rounded-lg shadow-lg">
                <form onSubmit={handleRegister} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-brand-text-dark mb-2">الاسم الكامل</label>
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-2 bg-brand-dark border border-brand-light-blue rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-text-dark mb-2">البريد الإلكتروني</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 bg-brand-dark border border-brand-light-blue rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-brand-text-dark mb-2">كلمة المرور</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 bg-brand-dark border border-brand-light-blue rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                    </div>
                     <div>
                         <label className="block text-sm font-medium text-brand-text-dark mb-2">تأكيد كلمة المرور</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 bg-brand-dark border border-brand-light-blue rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button type="submit" className="w-full py-3 bg-brand-blue hover:bg-blue-700 rounded-md text-white font-semibold transition-colors">
                        تسجيل
                    </button>
                </form>

                 <p className="mt-6 text-center text-sm text-brand-text-dark">
                    لديك حساب بالفعل؟{' '}
                    <button onClick={onSwitchToLogin} className="font-semibold text-brand-blue hover:underline">
                       تسجيل الدخول
                    </button>
                </p>
            </div>
        </div>
    );
};

export default RegisterScreen;
