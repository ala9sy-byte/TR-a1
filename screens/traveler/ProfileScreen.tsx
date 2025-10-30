import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';
import { BLOOD_TYPES, CURRENCIES, HEALTH_STATUS_OPTIONS } from '../../constants';
import { ProfileIcon } from '../../components/icons';

const ProfileScreen: React.FC = () => {
    const { currentUser, updateUser, logout } = useAuth();
    const [user, setUser] = useState<User | null>(currentUser);
    const [message, setMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!user) return;
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && user) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setUser({ ...user, profilePicture: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveChanges = () => {
        if (user) {
            updateUser(user);
            setMessage('تم حفظ التغييرات بنجاح!');
            setTimeout(() => setMessage(''), 3000);
        }
    };
    
    const handlePremiumRequest = () => {
        alert("شكراً لاهتمامك! سيتم التواصل معك من قبل فريقنا قريباً بخصوص الأرقام المميزة.");
    }

    if (!user) return null;

    const tierColor = {
        'Normal': 'text-gray-400',
        'Silver': 'text-gray-300',
        'Gold': 'text-yellow-400',
        'Diamond': 'text-blue-300',
    }[user.tier || 'Normal'];

    return (
        <div className="p-4 space-y-6">
            <div className="flex justify-between items-center">
                 <h1 className="text-2xl font-bold">ملفي الشخصي</h1>
                 <button onClick={logout} className="text-sm text-red-400 hover:text-red-500">تسجيل الخروج</button>
            </div>
           
            <div className="bg-brand-card p-6 rounded-lg text-center">
                 <div className="relative w-24 h-24 mx-auto mb-4 group">
                    {user.profilePicture ? (
                        <img src={user.profilePicture} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-brand-light-blue flex items-center justify-center">
                            <ProfileIcon className="w-16 h-16 text-brand-dark"/>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <label htmlFor="profilePicUpload" className="text-white text-xs text-center cursor-pointer">تغيير الصورة</label>
                         <input type="file" id="profilePicUpload" className="hidden" accept="image/*" onChange={handleProfilePictureChange} />
                    </div>
                </div>
                <h2 className="text-xl font-semibold">{user.fullName}</h2>
                <p className="font-mono text-brand-blue">{user.trNumber}</p>
                <p className={`font-bold ${tierColor}`}>{user.tier || 'Normal'}</p>
            </div>
            
            <div className="bg-brand-card p-6 rounded-lg space-y-4">
                <h3 className="font-semibold border-b border-brand-light-blue pb-2 mb-4">تعديل المعلومات</h3>
                 <div>
                    <label className="block text-sm text-brand-text-dark mb-1">الاسم الكامل</label>
                    <input type="text" name="fullName" value={user.fullName} onChange={handleChange} className="w-full p-2 bg-brand-dark border border-brand-light-blue rounded-md" />
                </div>
                 <div>
                    <label className="block text-sm text-brand-text-dark mb-1">البريد الإلكتروني</label>
                    <input type="email" value={user.email} disabled className="w-full p-2 bg-gray-700 border border-brand-light-blue rounded-md cursor-not-allowed" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm text-brand-text-dark mb-1">تاريخ الميلاد</label>
                        <input type="date" name="dateOfBirth" value={user.dateOfBirth || ''} onChange={handleChange} className="w-full p-2 bg-brand-dark border border-brand-light-blue rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm text-brand-text-dark mb-1">الجنس</label>
                        <select name="gender" value={user.gender || ''} onChange={handleChange} className="w-full p-2 bg-brand-dark border border-brand-light-blue rounded-md">
                            <option value="">اختر...</option>
                            <option value="male">ذكر</option>
                            <option value="female">أنثى</option>
                        </select>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-brand-text-dark mb-1">زمرة الدم</label>
                        <select name="bloodType" value={user.bloodType || ''} onChange={handleChange} className="w-full p-2 bg-brand-dark border border-brand-light-blue rounded-md">
                            <option value="">اختر...</option>
                            {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-brand-text-dark mb-1">الحالة الصحية</label>
                        <select name="healthStatus" value={user.healthStatus || ''} onChange={handleChange} className="w-full p-2 bg-brand-dark border border-brand-light-blue rounded-md">
                            <option value="">اختر...</option>
                             {HEALTH_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                 <div>
                    <label className="block text-sm text-brand-text-dark mb-1">العملة المفضلة</label>
                    <select name="currency" value={user.currency || 'United States Dollar (USD)'} onChange={handleChange} className="w-full p-2 bg-brand-dark border border-brand-light-blue rounded-md">
                         {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-brand-card p-6 rounded-lg space-y-4">
                <h3 className="font-semibold">الترقية</h3>
                <p className="text-sm text-brand-text-dark">هل تريد الحصول على رقم TR مميز؟</p>
                <button onClick={handlePremiumRequest} className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-md">
                    طلب رقم ذهبي
                </button>
            </div>

            {message && <p className="text-green-400 text-center">{message}</p>}

            <button onClick={handleSaveChanges} className="w-full py-3 bg-brand-green hover:bg-green-600 rounded-md text-white font-semibold transition-colors">
                حفظ التغييرات
            </button>
        </div>
    );
};

export default ProfileScreen;