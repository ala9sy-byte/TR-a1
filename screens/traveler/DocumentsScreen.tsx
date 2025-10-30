import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/db';
import { Document } from '../../types';
import Modal from '../../components/Modal';
import { EditIcon, DeleteIcon, DocumentsIcon } from '../../components/icons';

const DocumentsScreen: React.FC = () => {
    const { currentUser } = useAuth();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState<Document | null>(null);
    const [docData, setDocData] = useState<Omit<Document, 'id' | 'userId'>>({
        name: '',
        issuingCountry: '',
        documentNumber: '',
        issueDate: '',
        expiryDate: '',
        file: '',
    });
    const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

    const loadDocuments = useCallback(() => {
        if (currentUser) {
            setDocuments(db.getDocuments(currentUser.id).sort((a, b) => new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime()));
        }
    }, [currentUser]);

    useEffect(() => {
        loadDocuments();
    }, [loadDocuments]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDocData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setDocData(prev => ({ ...prev, file: reader.result as string }));
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
            if (editingDoc) {
                db.updateDocument({ ...editingDoc, ...docData });
            } else {
                db.addDocument({ ...docData, userId: currentUser.id });
            }
            loadDocuments();
            closeModal();
        }
    };

    const confirmDelete = () => {
        if (deletingDocId) {
            db.deleteDocument(deletingDocId);
            loadDocuments();
            setDeletingDocId(null);
        }
    };

    const openAddModal = () => {
        setEditingDoc(null);
        setDocData({
            name: '',
            issuingCountry: '',
            documentNumber: '',
            issueDate: '',
            expiryDate: '',
            file: '',
        });
        setIsModalOpen(true);
    };

    const openEditModal = (doc: Document) => {
        setEditingDoc(doc);
        setDocData({
            name: doc.name,
            issuingCountry: doc.issuingCountry,
            documentNumber: doc.documentNumber,
            issueDate: doc.issueDate,
            expiryDate: doc.expiryDate,
            file: doc.file,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingDoc(null);
    };

    const getStatus = (expiryDate: string) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return { text: 'منتهية الصلاحية', color: 'text-red-400' };
        if (diffDays <= 30) return { text: `تنتهي خلال ${diffDays} يوم`, color: 'text-yellow-400' };
        return { text: 'سارية', color: 'text-green-400' };
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">الوثائق الرسمية</h1>
                <button onClick={openAddModal} className="bg-brand-blue text-white font-bold py-2 px-4 rounded">
                    + إضافة وثيقة
                </button>
            </div>

            {documents.length === 0 ? (
                <div className="text-center py-10">
                    <DocumentsIcon className="w-16 h-16 mx-auto text-brand-text-dark" />
                    <p className="mt-4 text-brand-text-dark">لا توجد وثائق مضافة.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {documents.map(doc => {
                        const status = getStatus(doc.expiryDate);
                        return (
                            <div key={doc.id} className="bg-brand-card p-4 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-semibold">{doc.name}</h3>
                                        <p className="text-sm text-brand-text-dark">{doc.issuingCountry} - <span className="font-mono">{doc.documentNumber}</span></p>
                                        <p className={`text-sm mt-2 font-semibold ${status.color}`}>
                                            {status.text} (تنتهي في: {new Date(doc.expiryDate).toLocaleDateString()})
                                        </p>
                                         {doc.file && (
                                            <button onClick={() => handleViewFile(doc.file)} className="text-brand-blue text-sm hover:underline mt-2">
                                                عرض الوثيقة
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex space-x-2 rtl:space-x-reverse">
                                        <button onClick={() => openEditModal(doc)} className="text-gray-400 hover:text-white"><EditIcon className="w-5 h-5"/></button>
                                        <button onClick={() => setDeletingDocId(doc.id)} className="text-gray-400 hover:text-red-500"><DeleteIcon className="w-5 h-5"/></button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingDoc ? 'تعديل وثيقة' : 'إضافة وثيقة جديدة'}>
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                     <div>
                        <label className="block text-sm">اسم الوثيقة (e.g., جواز سفر)</label>
                        <input type="text" name="name" value={docData.name} onChange={handleInputChange} className="w-full p-2 bg-brand-dark border border-brand-light-blue rounded-md" required />
                    </div>
                     <div>
                        <label className="block text-sm">رقم الوثيقة</label>
                        <input type="text" name="documentNumber" value={docData.documentNumber} onChange={handleInputChange} className="w-full p-2 bg-brand-dark border border-brand-light-blue rounded-md" required />
                    </div>
                     <div>
                        <label className="block text-sm">بلد الإصدار</label>
                        <input type="text" name="issuingCountry" value={docData.issuingCountry} onChange={handleInputChange} className="w-full p-2 bg-brand-dark border border-brand-light-blue rounded-md" required />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm">تاريخ الإصدار</label>
                            <input type="date" name="issueDate" value={docData.issueDate} onChange={handleInputChange} className="w-full p-2 bg-brand-dark border border-brand-light-blue rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-sm">تاريخ الانتهاء</label>
                            <input type="date" name="expiryDate" value={docData.expiryDate} onChange={handleInputChange} className="w-full p-2 bg-brand-dark border border-brand-light-blue rounded-md" required />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm mb-1">ارفع الوثيقة (PDF)</label>
                        <input type="file" name="file" onChange={handleFileChange} accept="application/pdf" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-blue file:text-white hover:file:bg-blue-700"/>
                    </div>
                    <div className="flex justify-end pt-4 space-x-2 rtl:space-x-reverse">
                        <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-600 rounded-md">إلغاء</button>
                        <button type="submit" className="px-4 py-2 bg-brand-blue rounded-md">حفظ</button>
                    </div>
                </form>
            </Modal>
            
            <Modal isOpen={!!deletingDocId} onClose={() => setDeletingDocId(null)} title="تأكيد الحذف">
                <p>هل أنت متأكد من حذف هذه الوثيقة؟</p>
                <div className="flex justify-end mt-4 space-x-2 rtl:space-x-reverse">
                    <button onClick={() => setDeletingDocId(null)} className="py-2 px-4 rounded-md bg-gray-600 hover:bg-gray-700">إلغاء</button>
                    <button onClick={confirmDelete} className="py-2 px-4 rounded-md bg-red-600 hover:bg-red-700">حذف</button>
                </div>
            </Modal>
        </div>
    );
};

export default DocumentsScreen;