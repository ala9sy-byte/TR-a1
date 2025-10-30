import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/db';
import { HealthRecord } from '../../types';
import Modal from '../../components/Modal';
import { EditIcon, DeleteIcon, HealthIcon } from '../../components/icons';

const HealthScreen: React.FC = () => {
    const { currentUser } = useAuth();
    const [records, setRecords] = useState<HealthRecord[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
    const [recordData, setRecordData] = useState<Omit<HealthRecord, 'id' | 'userId'>>({
        name: '',
        details: '',
        doctor: '',
        date: '',
        file: '',
    });
    const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);

    const loadRecords = useCallback(() => {
        if (currentUser) {
            setRecords(db.getHealthRecords(currentUser.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
    }, [currentUser]);

    useEffect(() => {
        loadRecords();
    }, [loadRecords]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setRecordData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setRecordData(prev => ({ ...prev, file: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleViewFile = (base64String: string | undefined) => {
        if (!base64String) return;
        try {
            const byteCharacters = atob(base64String.split(',')[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(blob);
            window.open(fileURL, '_blank');
        } catch (error) {
            console.error("Failed to open file:", error);
            alert("لا يمكن فتح الملف. قد يكون تالفًا.");
        }
    };

    const handleSave = () => {
        if (currentUser) {
            if (editingRecord) {
                db.updateHealthRecord({ ...editingRecord, ...recordData });
            } else {
                db.addHealthRecord({ ...recordData, userId: currentUser.id });
            }
            loadRecords();
            closeModal();
        }
    };

    const confirmDelete = () => {
        if (deletingRecordId) {
            db.deleteHealthRecord(deletingRecordId);
            loadRecords();
            setDeletingRecordId(null);
        }
    };

    const openAddModal = () => {
        setEditingRecord(null);
        setRecordData({
            name: '',
            details: '',
            doctor: '',
            date: new Date().toISOString().split('T')[0],
            file: '',
        });
        setIsModalOpen(true);
    };

    const openEditModal = (record: HealthRecord) => {
        setEditingRecord(record);
        setRecordData({
            name: record.name,
            details: record.details,
            doctor: record.doctor,
            date: record.date,
            file: record.file,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRecord(null);
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">السجل الصحي</h1>
                <button onClick={openAddModal} className="bg-brand-blue text-white font-bold py-2 px-4 rounded">
                    + إضافة سجل
                </button>
            </div>

            {records.length === 0 ? (
                <div className="text-center py-10">
                    <HealthIcon className="w-16 h-16 mx-auto text-brand-text-dark" />
                    <p className="mt-4 text-brand-text-dark">لا توجد سجلات صحية.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {records.map(record => (
                        <div key={record.id} className="bg-brand-card p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-semibold">{record.name}</h3>
                                    <p className="text-sm text-brand-text-dark">
                                        {new Date(record.date).toLocaleDateString()} {record.doctor && `- د. ${record.doctor}`}
                                    </p>
                                    <p className="mt-2 whitespace-pre-wrap">{record.details}</p>
                                    {record.file && (
                                        <button onClick={() => handleViewFile(record.file)} className="text-brand-blue text-sm hover:underline mt-2">
                                            عرض الملف
                                        </button>
                                    )}
                                </div>
                                <div className="flex space-x-2 rtl:space-x-reverse">
                                    <button onClick={() => openEditModal(record)} className="text-gray-400 hover:text-white"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => setDeletingRecordId(record.id)} className="text-gray-400 hover:text-red-500"><DeleteIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingRecord ? 'تعديل السجل الصحي' : 'إضافة سجل صحي جديد'}>
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                    <div>
                        <label className="block text-sm">اسم السجل (e.g., فحص روتيني)</label>
                        <input type="text" name="name" value={recordData.name} onChange={handleInputChange} className="w-full p-2 bg-brand-dark border border-brand-light-blue rounded-md" required />
                    </div>
                     <div>
                        <label className="block text-sm">التفاصيل</label>
                        <textarea name="details" value={recordData.details} onChange={handleInputChange} rows={4} className="w-full p-2 bg-brand-dark border border-brand-light-blue rounded-md" required />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm">الطبيب (اختياري)</label>
                            <input type="text" name="doctor" value={recordData.doctor} onChange={handleInputChange} className="w-full p-2 bg-brand-dark border border-brand-light-blue rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm">التاريخ</label>
                            <input type="date" name="date" value={recordData.date} onChange={handleInputChange} className="w-full p-2 bg-brand-dark border border-brand-light-blue rounded-md" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm mb-1">ارفع الملف (PDF)</label>
                        <input type="file" name="file" onChange={handleFileChange} accept="application/pdf" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-blue file:text-white hover:file:bg-blue-700"/>
                    </div>
                    <div className="flex justify-end pt-4 space-x-2 rtl:space-x-reverse">
                        <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-600 rounded-md">إلغاء</button>
                        <button type="submit" className="px-4 py-2 bg-brand-blue rounded-md">حفظ</button>
                    </div>
                </form>
            </Modal>
            
            <Modal isOpen={!!deletingRecordId} onClose={() => setDeletingRecordId(null)} title="تأكيد الحذف">
                <p>هل أنت متأكد من حذف هذا السجل الصحي؟</p>
                <div className="flex justify-end mt-4 space-x-2 rtl:space-x-reverse">
                    <button onClick={() => setDeletingRecordId(null)} className="py-2 px-4 rounded-md bg-gray-600 hover:bg-gray-700">إلغاء</button>
                    <button onClick={confirmDelete} className="py-2 px-4 rounded-md bg-red-600 hover:bg-red-700">حذف</button>
                </div>
            </Modal>
        </div>
    );
};

export default HealthScreen;