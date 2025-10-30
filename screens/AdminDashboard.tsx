
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { BLOOD_TYPES, CURRENCIES, HEALTH_STATUS_OPTIONS } from '../constants';

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-brand-card p-4 rounded-lg flex items-center">
        <div className="p-3 mr-4 text-brand-blue bg-brand-light-blue rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm text-brand-text-dark">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);


const AdminDashboard: React.FC = () => {
    const { logout } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);

    const loadUsers = useCallback(() => {
        const allUsers = db.getAllUsers().filter(u => u.role === 'traveler');
        setUsers(allUsers);
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleStatusChange = (userId: string, status: 'active' | 'banned' | 'locked') => {
        const user = users.find(u => u.id === userId);
        if(user) {
            const updatedUser = {...user, status};
            db.updateUser(updatedUser);
            loadUsers();
        }
    };
    
    const confirmDeleteUser = () => {
        if (deletingUser) {
            db.deleteUser(deletingUser.id);
            loadUsers();
            setDeletingUser(null);
        }
    }

    const handleUpdateUser = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(editingUser){
            db.updateUser(editingUser);
            loadUsers();
            setEditingUser(null);
        }
    }

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.trNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalTravelers = users.length;
    const totalTrips = db.getAllTrips().length;
    
    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">لوحة تحكم المدير</h1>
                <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                    تسجيل الخروج
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                 <StatCard title="إجمالي المسافرين" value={totalTravelers} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                <StatCard title="إجمالي الرحلات" value={totalTrips} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>} />
                <StatCard title="الحسابات الذهبية" value={users.filter(u=>u.tier === 'Gold').length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>} />
                <StatCard title="الحسابات الماسية" value={users.filter(u=>u.tier === 'Diamond').length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11l7-7 7 7M5 19l7-7 7 7" /></svg>} />
            </div>

            <div className="bg-brand-card p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">قائمة المسافرين</h2>
                <input
                    type="text"
                    placeholder="ابحث بالاسم, TR, أو الإيميل..."
                    className="w-full p-2 mb-4 bg-brand-dark border border-brand-light-blue rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-brand-dark">
                            <tr>
                                <th scope="col" className="px-6 py-3">الاسم</th>
                                <th scope="col" className="px-6 py-3">رقم TR</th>
                                <th scope="col" className="px-6 py-3">البريد الإلكتروني</th>
                                <th scope="col" className="px-6 py-3">الحالة</th>
                                <th scope="col" className="px-6 py-3">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="border-b border-brand-light-blue hover:bg-brand-dark">
                                    <td className="px-6 py-4 text-white">{user.fullName}</td>
                                    <td className="px-6 py-4">{user.trNumber}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <select 
                                            value={user.status} 
                                            onChange={(e) => handleStatusChange(user.id, e.target.value as 'active' | 'banned' | 'locked')}
                                            className="bg-brand-dark border-brand-light-blue rounded p-1"
                                        >
                                            <option value="active">نشط</option>
                                            <option value="banned">محظور</option>
                                            <option value="locked">مقفل</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 flex space-x-2">
                                        <button onClick={() => setEditingUser(user)} className="text-blue-400 hover:text-blue-600">تعديل</button>
                                        <button onClick={() => setDeletingUser(user)} className="text-red-400 hover:text-red-600">حذف</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="تعديل المسافر">
                {editingUser && (
                    <form onSubmit={handleUpdateUser}>
                       <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                           <div>
                                <label className="block text-sm font-medium text-brand-text-dark mb-1">الاسم الكامل</label>
                                <input type="text" value={editingUser.fullName} onChange={e => setEditingUser({...editingUser, fullName: e.target.value})} className="w-full p-2 bg-brand-dark border border-brand-light-blue rounded-md"/>
                           </div>
                           <div>
                                <label className="block text-sm font-medium text-brand-text-dark mb-1">رقم TR</label>
                                <input type="text" value={editingUser.trNumber} onChange={e => setEditingUser({...editingUser, trNumber: e.target.value})} className="w-full p-2 bg-brand-dark border border-brand-light-blue rounded-md"/>
                           </div>
                           <div>
                                <label className="block text-sm font-medium text-brand-text-dark mb-1">البريد الإلكتروني</label>
                                <input type="email" value={editingUser.email} disabled className="w-full p-2 bg-gray-600 border border-brand-light-blue rounded-md"/>
                           </div>
                           <div>
                                <label className="block text-sm text-brand-text-dark mb-1">الفئة</label>
                                <select value={editingUser.tier || 'Normal'} onChange={e => setEditingUser({...editingUser, tier: e.target.value as any})} className="w-full p-2 bg-brand-dark border border-brand-light-blue rounded-md">
                                    <option value="Normal">عادي</option>
                                    <option value="Silver">فضي</option>
                                    <option value="Gold">ذهبي</option>
                                    <option value="Diamond">ماسي</option>
                                </select>
                           </div>
                       </div>
                       <div className="mt-6 flex justify-end space-x-2">
                           <button type="button" onClick={() => setEditingUser(null)} className="py-2 px-4 rounded-md bg-gray-600 hover:bg-gray-700">إلغاء</button>
                           <button type="submit" className="py-2 px-4 rounded-md bg-brand-blue hover:bg-blue-700">حفظ التغييرات</button>
                       </div>
                    </form>
                )}
            </Modal>

            <Modal isOpen={!!deletingUser} onClose={() => setDeletingUser(null)} title="تأكيد الحذف">
                {deletingUser && (
                    <div>
                        <p>هل أنت متأكد من أنك تريد حذف المسافر <span className="font-bold">{deletingUser.fullName}</span> بشكل دائم؟</p>
                        <p className="text-sm text-red-400 mt-2">لا يمكن التراجع عن هذا الإجراء.</p>
                        <div className="mt-6 flex justify-end space-x-2 rtl:space-x-reverse">
                            <button onClick={() => setDeletingUser(null)} className="py-2 px-4 rounded-md bg-gray-600 hover:bg-gray-700">إلغاء</button>
                            <button onClick={confirmDeleteUser} className="py-2 px-4 rounded-md bg-red-600 hover:bg-red-700">حذف</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminDashboard;
