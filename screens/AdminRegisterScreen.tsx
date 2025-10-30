
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/db';
import { ADMIN_SECRET_CODE } from '../constants';
import { SecurityIcon } from '../components/icons';

interface AdminRegisterScreenProps {
    onSwitchToLogin: () => void;
}

const AdminRegisterScreen: React.FC<AdminRegisterScreenProps> = ({ onSwitchToLogin }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [secretCode, setSecretCode] = useState('');
    const [error, setError] = useState('');
    
    const { login } = useAuth();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('كلمتا المرور غير متطابقتين');
            return;
        }
        if (secretCode !== ADMIN_SECRET_CODE) {
            setError('رمز المدير السري غير صحيح');
            return;
        }

        try {
            const newUser = db.registerUser(fullName, email, password, 'admin');
            if (newUser) {
                // auto-login after successful registration
                await login(email, password);
            } else {
                 setError('هذا البريد الإلكتروني مسجل بالفعل');
            }
        } catch (err) {
            setError('فشل التسجيل. يرجى المحاولة مرة أخرى.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-brand-dark">
            <div className="text-center mb-8">
                <SecurityIcon className="w-16 h-16 text-brand-blue mx-auto mb-4"/>
                <h1 className="text-4xl font-bold text-white">TRANUM</h1>
                <p className="text-brand-text-dark">إنشاء حساب مدير جديد</p>
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
                    <div>
                         <label className="block text-sm font-medium text-brand-text-dark mb-2">رمز المدير السري</label>
                        <input type="password" value={secretCode} onChange={(e) => setSecretCode(e.target.value)} className="w-full px-3 py-2 bg-brand-dark border border-brand-light-blue rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button type="submit" className="w-full py-3 bg-orange-600 hover:bg-orange-700 rounded-md text-white font-semibold transition-colors">
                        تسجيل كمدير
                    </button>
                </form>

                 <p className="mt-6 text-center text-sm text-brand-text-dark">
                    <button onClick={onSwitchToLogin} className="font-semibold text-brand-blue hover:underline">
                       العودة لتسجيل الدخول
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AdminRegisterScreen;
