import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/db';
import { Trip } from '../../types';
import Modal from '../../components/Modal';
import { EditIcon, DeleteIcon, TripsIcon } from '../../components/icons';
import { CURRENCIES } from '../../constants';
import { convertCurrency, getCurrencyCode } from '../../utils/currencyConverter';

const TripsScreen: React.FC = () => {
    const { currentUser } = useAuth();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
    const [tripData, setTripData] = useState<Omit<Trip, 'id' | 'userId'>>({
        from: '',
        to: '',
        startDate: '',
        endDate: '',
        ticketPrice: 0,
        currency: currentUser?.currency || 'United States Dollar (USD)',
        ticketFile: '',
        boardingPassFile: '',
        hotelFile: '',
    });
    const [deletingTripId, setDeletingTripId] = useState<string | null>(null);

    const loadTrips = useCallback(() => {
        if (currentUser) {
            setTrips(db.getTrips(currentUser.id).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
        }
    }, [currentUser]);

    useEffect(() => {
        loadTrips();
    }, [loadTrips]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setTripData(prev => ({ ...prev, [name]: name === 'ticketPrice' ? parseFloat(value) || 0 : value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTripData(prev => ({ ...prev, [name]: reader.result as string }));
            };
            reader.readAsDataURL(files[0]);
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
            if (editingTrip) {
                db.updateTrip({ ...editingTrip, ...tripData });
            } else {
                db.addTrip({ ...tripData, userId: currentUser.id });
            }
            loadTrips();
            closeModal();
        }
    };

    const confirmDelete = () => {
        if (deletingTripId) {
            db.deleteTrip(deletingTripId);
            loadTrips();
            setDeletingTripId(null);
        }
    };

    const openAddModal = () => {
        setEditingTrip(null);
        setTripData({
            from: '',
            to: '',
            startDate: '',
            endDate: '',
            ticketPrice: 0,
            currency: currentUser?.currency || 'United States Dollar (USD)',
            ticketFile: '',
            boardingPassFile: '',
            hotelFile: '',
        });
        setIsModalOpen(true);
    };

    const openEditModal = (trip: Trip) => {
        setEditingTrip(trip);
        setTripData({
            from: trip.from,
            to: trip.to,
            startDate: trip.startDate,
            endDate: trip.endDate,
            ticketPrice: trip.ticketPrice,
            currency: trip.currency,
            ticketFile: trip.ticketFile,
            boardingPassFile: trip.boardingPassFile,
            hotelFile: trip.hotelFile,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTrip(null);
    };
    
    const totalSpent = trips.reduce((acc, trip) => {
        const userCurrency = currentUser?.currency || 'United States Dollar (USD)';
        const userCurrencyCode = getCurrencyCode(userCurrency);
        const tripCurrencyCode = getCurrencyCode(trip.currency);
        if (userCurrencyCode && tripCurrencyCode) {
            const convertedPrice = convertCurrency(trip.ticketPrice, tripCurrencyCode, userCurrencyCode);
            return acc + (convertedPrice || 0);
        }
        return acc;
    }, 0);

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">رحلاتي</h1>
                <button onClick={openAddModal} className="bg-brand-blue text-white font-bold py-2 px-4 rounded">
                    + إضافة رحلة
                </button>
            </div>
             <div className="bg-brand-card p-4 rounded-lg mb-6 text-center">
                <p className="text-brand-text-dark">إجمالي الإنفاق على التذاكر</p>
                <p className="text-2xl font-bold">{totalSpent.toFixed(2)} <span className="text-base font-normal">{getCurrencyCode(currentUser?.currency || '')}</span></p>
            </div>

            {trips.length === 0 ? (
                <div className="text-center py-10">
                    <TripsIcon className="w-16 h-16 mx-auto text-brand-text-dark" />
                    <p className="mt-4 text-brand-text-dark">لم تقم بإضافة أي رحلات بعد.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {trips.map(trip => (
                        <div key={trip.id} className="bg-brand-card p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-semibold">{trip.from} ← {trip.to}</h3>
                                    <p className="text-sm text-brand-text-dark">
                                        {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                                    </p>
                                    <p className="font-semibold text-brand-green mt-2">{trip.ticketPrice} {getCurrencyCode(trip.currency)}</p>
                                </div>
                                <div className="flex space-x-2 rtl:space-x-reverse">
                                    <button onClick={() => openEditModal(trip)} className="text-gray-400 hover:text-white"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => setDeletingTripId(trip.id)} className="text-gray-400 hover:text-red-500"><DeleteIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                             {(trip.ticketFile || trip.boardingPassFile || trip.hotelFile) && (
                                <div className="border-t border-brand-light-blue mt-3 pt-3 flex space-x-4 rtl:space-x-reverse text-sm">
                                    {trip.ticketFile && <button onClick={() => handleViewFile(trip.ticketFile)} className="text-brand-blue hover:underline">عرض التذكرة</button>}
                                    {trip.boardingPassFile && <button onClick={() => handleViewFile(trip.boardingPassFile)} className="text-brand-blue hover:underline">عرض بطاقة الصعود</button>}
                                    {trip.hotelFile && <button onClick={() => handleViewFile(trip.hotelFile)} className="text-brand-blue hover:underline">عرض حجز الفندق</button>}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingTrip ? 'تعديل الرحلة' : 'إضافة رحلة جديدة'}>
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm">من</label>
                             <input type="text" name="from" value={tripData.from} onChange={handleInputChange} className="w-full p-2 bg-brand-dark border border-brand-light-blue rounded-md" required />
                        </div>
                        <div>
                             <label className="block text-sm">إلى</label>
                             <input type="text" name="to" value={tripData.to} onChange={handleInputChange} className="w-full p-2 bg-brand-dark border border-brand-light-blue rounded-md" required />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm">تاريخ البدء</label>
                             <input type="date" name="startDate" value={tripData.startDate} onChange={handleInputChange} className="w-full p-2 bg-brand-dark border border-brand-light-blue rounded-md" required />
                        </div>
                        <div>
                             <label className="block text-sm">تاريخ الانتهاء</label>
                             <input type="date" name="endDate" value={tripData.endDate} onChange={handleInputChange} className="w-full p-2 bg-brand-dark border border-brand-light-blue rounded-md" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm">سعر التذكرة</label>
                             <input type="number" name="ticketPrice" value={tripData.ticketPrice} onChange={handleInputChange} className="w-full p-2 bg-brand-dark border border-brand-light-blue rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-sm">العملة</label>
                             <select name="currency" value={tripData.currency} onChange={handleInputChange} className="w-full p-2 bg-brand-dark border border-brand-light-blue rounded-md">
                                 {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                         <div>
                            <label className="block text-sm mb-1">ارفع ملف التذكرة (PDF)</label>
                            <input type="file" name="ticketFile" onChange={handleFileChange} accept="application/pdf" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-blue file:text-white hover:file:bg-blue-700"/>
                        </div>
                        <div>
                            <label className="block text-sm mb-1">ارفع ملف بوردينغ باس (PDF)</label>
                            <input type="file" name="boardingPassFile" onChange={handleFileChange} accept="application/pdf" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-blue file:text-white hover:file:bg-blue-700"/>
                        </div>
                        <div>
                            <label className="block text-sm mb-1">ارفع ملف الحجز الفندقي (PDF)</label>
                            <input type="file" name="hotelFile" onChange={handleFileChange} accept="application/pdf" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-blue file:text-white hover:file:bg-blue-700"/>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 space-x-2 rtl:space-x-reverse">
                         <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-600 rounded-md">إلغاء</button>
                         <button type="submit" className="px-4 py-2 bg-brand-blue rounded-md">حفظ</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={!!deletingTripId} onClose={() => setDeletingTripId(null)} title="تأكيد الحذف">
                <p>هل أنت متأكد من حذف هذه الرحلة؟</p>
                <div className="flex justify-end mt-4 space-x-2 rtl:space-x-reverse">
                    <button onClick={() => setDeletingTripId(null)} className="py-2 px-4 rounded-md bg-gray-600 hover:bg-gray-700">إلغاء</button>
                    <button onClick={confirmDelete} className="py-2 px-4 rounded-md bg-red-600 hover:bg-red-700">حذف</button>
                </div>
            </Modal>
        </div>
    );
};

export default TripsScreen;