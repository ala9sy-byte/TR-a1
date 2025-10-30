
import { User, Trip, HealthRecord, Document, Luggage } from '../types';

class Database {
    private users: User[] = [];
    private trips: Trip[] = [];
    private healthRecords: HealthRecord[] = [];
    private documents: Document[] = [];
    private luggage: Luggage[] = [];

    constructor() {
        this.load();
    }

    private load() {
        this.users = JSON.parse(localStorage.getItem('tranum_users') || '[]');
        this.trips = JSON.parse(localStorage.getItem('tranum_trips') || '[]');
        this.healthRecords = JSON.parse(localStorage.getItem('tranum_healthRecords') || '[]');
        this.documents = JSON.parse(localStorage.getItem('tranum_documents') || '[]');
        this.luggage = JSON.parse(localStorage.getItem('tranum_luggage') || '[]');
    }

    private save() {
        localStorage.setItem('tranum_users', JSON.stringify(this.users));
        localStorage.setItem('tranum_trips', JSON.stringify(this.trips));
        localStorage.setItem('tranum_healthRecords', JSON.stringify(this.healthRecords));
        localStorage.setItem('tranum_documents', JSON.stringify(this.documents));
        localStorage.setItem('tranum_luggage', JSON.stringify(this.luggage));
    }
    
    private generateId = () => Math.random().toString(36).substr(2, 9);
    private generateTrNumber = () => `TR${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    initialize() {
        if (this.users.length === 0) {
            // Seed Admin User
            this.users.push({
                id: this.generateId(),
                fullName: 'Admin User',
                email: 'ala1@gmail.com',
                passwordHash: '@@@123@@@', // In a real app, this would be hashed
                role: 'admin',
                status: 'active',
            });
            // Seed Traveler User
            const travelerId = this.generateId();
            this.users.push({
                id: travelerId,
                fullName: 'علاء أحمد',
                email: 'ala@gmail.com',
                passwordHash: '@@@123@@@',
                role: 'traveler',
                trNumber: this.generateTrNumber(),
                status: 'active',
                tier: 'Gold',
                currency: 'United Arab Emirates Dirham (AED)',
                bloodType: 'A+',
            });

            this.save();
        }
    }

    // User Management
    loginUser(email: string, passwordHash: string): User | null {
        const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === passwordHash);
        return user || null;
    }

    registerUser(fullName: string, email: string, passwordHash: string, role: 'traveler' | 'admin' = 'traveler'): User | null {
        if (this.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            return null; // User already exists
        }
        const newUser: User = {
            id: this.generateId(),
            fullName,
            email,
            passwordHash,
            role,
            status: 'active',
            trNumber: role === 'traveler' ? this.generateTrNumber() : undefined,
            tier: 'Normal'
        };
        this.users.push(newUser);
        this.save();
        return newUser;
    }

    updateUser(updatedUser: User): boolean {
        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index > -1) {
            this.users[index] = updatedUser;
            this.save();
            return true;
        }
        return false;
    }
    
    deleteUser(userId: string): void {
        this.users = this.users.filter(u => u.id !== userId);
        // Also delete all associated data
        this.trips = this.trips.filter(t => t.userId !== userId);
        this.healthRecords = this.healthRecords.filter(h => h.userId !== userId);
        this.documents = this.documents.filter(d => d.userId !== userId);
        this.luggage = this.luggage.filter(l => l.userId !== userId);
        this.save();
    }

    getAllUsers = () => this.users;

    // Trip Management
    getTrips = (userId: string) => this.trips.filter(t => t.userId === userId);
    getAllTrips = () => this.trips;
    addTrip = (tripData: Omit<Trip, 'id'>) => { this.trips.push({ ...tripData, id: this.generateId() }); this.save(); };
    updateTrip = (updatedTrip: Trip) => { const i = this.trips.findIndex(t => t.id === updatedTrip.id); if (i > -1) { this.trips[i] = updatedTrip; this.save(); }};
    deleteTrip = (tripId: string) => { this.trips = this.trips.filter(t => t.id !== tripId); this.save(); };
    
    // Health Record Management
    getHealthRecords = (userId: string) => this.healthRecords.filter(h => h.userId === userId);
    addHealthRecord = (recordData: Omit<HealthRecord, 'id'>) => { this.healthRecords.push({ ...recordData, id: this.generateId() }); this.save(); };
    updateHealthRecord = (updatedRecord: HealthRecord) => { const i = this.healthRecords.findIndex(h => h.id === updatedRecord.id); if (i > -1) { this.healthRecords[i] = updatedRecord; this.save(); }};
    deleteHealthRecord = (recordId: string) => { this.healthRecords = this.healthRecords.filter(h => h.id !== recordId); this.save(); };

    // Document Management
    getDocuments = (userId: string) => this.documents.filter(d => d.userId === userId);
    addDocument = (docData: Omit<Document, 'id'>) => { this.documents.push({ ...docData, id: this.generateId() }); this.save(); };
    updateDocument = (updatedDoc: Document) => { const i = this.documents.findIndex(d => d.id === updatedDoc.id); if (i > -1) { this.documents[i] = updatedDoc; this.save(); }};
    deleteDocument = (docId: string) => { this.documents = this.documents.filter(d => d.id !== docId); this.save(); };

    // Luggage Management
    getLuggage = (userId: string) => this.luggage.filter(l => l.userId === userId);
    addLuggage = (luggageData: Omit<Luggage, 'id'>) => { this.luggage.push({ ...luggageData, id: this.generateId() }); this.save(); };
    updateLuggage = (updatedLuggage: Luggage) => { const i = this.luggage.findIndex(l => l.id === updatedLuggage.id); if (i > -1) { this.luggage[i] = updatedLuggage; this.save(); }};
    deleteLuggage = (luggageId: string) => { this.luggage = this.luggage.filter(l => l.id !== luggageId); this.save(); };
}

export const db = new Database();
export const initializeData = () => db.initialize();
