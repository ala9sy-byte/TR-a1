
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/db';
import { Luggage } from '../../types';
import Modal from '../../components/Modal';
import { EditIcon, DeleteIcon, LuggageIcon } from '../../components/icons';

const LuggageScreen: React.FC = () => {
    const { currentUser } = useAuth();
    const [luggage, setLuggage] = useState<Luggage[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [trackingCode, setTrackingCode] = useState('');
    const [editingLuggage, setEditingLuggage] = useState<Luggage | null>(null);
    const [deletingLuggageId, setDeletingLuggageId] = useState<string | null>(null);

    const loadLuggage = useCallback(() => {
        if(currentUser) {
            setLuggage(db.getLuggage(currentUser.id));
        }
    }, [currentUser]);

    useEffect(() => {
        loadLuggage();
    }, [loadLuggage]);

    const handleSave = () => {
        if(currentUser && trackingCode) {
            if (editingLuggage) {
                db.updateLuggage({ ...editingLuggage, trackingCode });
            } else {
                db.addLuggage({ trackingCode, userId: currentUser.id });
            }
            loadLuggage();
            setIsModalOpen(false);
            setTrackingCode('');
            setEditingLuggage(null);
        }
    };
    
    const confirmDelete = () => {
        if(deletingLuggageId) {
            db.deleteLuggage(deletingLuggageId);
            loadLuggage();
            setDeletingLuggageId(null);
        }
    };

    const openAddModal = () => {
        setEditingLuggage(null);
        setTrackingCode('');
        setIsModalOpen(true);
    };

    const openEditModal = (item: Luggage) => {
        setEditingLuggage(item);
        setTrackingCode(item.trackingCode);
        setIsModalOpen(true);
    };


    return (
        <div className="p-4">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">قائمة الأمتعة</h1>
                <button onClick={openAddModal} className="bg-brand-blue text-white font-bold py-2 px-4 rounded">
                    + إضافة حقيبة
                </button>
            </div>
            
            {luggage.length === 0 ? (
                <div className="text-center py-10">
                    <LuggageIcon className="w-16 h-16 mx-auto text-brand-text-dark" />
                    <p className="mt-4 text-brand-text-dark">لا توجد حقائب مضافة.</p>
                    <p className="text-sm text-gray-500">أضف حقيبة لبدء تتبعها.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {luggage.map(item => (
                        <div key={item.id} className="bg-brand-card p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="text-brand-text-dark">كود التتبع</p>
                                <p className="font-mono text-lg">{item.trackingCode}</p>
                            </div>
                            <div className="flex space-x-2 rtl:space-x-reverse">
                                <button onClick={() => alert('ميزة التتبع المباشر قادمة قريباً!')} className="text-gray-400 hover:text-white">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                <button onClick={() => openEditModal(item)} className="text-gray-400 hover:text-white"><EditIcon className="w-5 h-5"/></button>
                                <button onClick={() => setDeletingLuggageId(item.id)} className="text-gray-400 hover:text-red-500"><DeleteIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingLuggage ? 'تعديل حقيبة' : 'إضافة حقيبة سفر'}>
                <div className="space-y-4">
                    <label className="block">كود تتبع الحقيبة</label>
                    <input 
                        type="text" 
                        value={trackingCode} 
                        onChange={e => setTrackingCode(e.target.value)}
                        className="w-full p-2 bg-brand-dark border border-brand-light-blue rounded-md"
                    />
                    <div className="flex justify-end pt-4 space-x-2 rtl:space-x-reverse">
                         <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-600 rounded-md">إلغاء</button>
                         <button onClick={handleSave} className="px-4 py-2 bg-brand-blue rounded-md">حفظ</button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={!!deletingLuggageId} onClose={() => setDeletingLuggageId(null)} title="تأكيد الحذف">
                <p>هل أنت متأكد من حذف هذه الحقيبة؟</p>
                <div className="flex justify-end mt-4 space-x-2 rtl:space-x-reverse">
                    <button onClick={() => setDeletingLuggageId(null)} className="py-2 px-4 rounded-md bg-gray-600 hover:bg-gray-700">إلغاء</button>
                    <button onClick={confirmDelete} className="py-2 px-4 rounded-md bg-red-600 hover:bg-red-700">حذف</button>
                </div>
            </Modal>
        </div>
    );
};

export default LuggageScreen;
