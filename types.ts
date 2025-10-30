
export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: 'traveler' | 'admin';
  trNumber?: string;
  profilePicture?: string;
  status?: 'active' | 'banned' | 'locked';
  tier?: 'Normal' | 'Silver' | 'Gold' | 'Diamond';
  currency?: string;
  healthStatus?: string;
  bloodType?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
}

export interface Trip {
  id: string;
  userId: string;
  from: string;
  to: string;
  startDate: string;
  endDate: string;
  ticketPrice: number;
  currency: string;
  ticketFile?: string;
  boardingPassFile?: string;
  hotelFile?: string;
}

export interface HealthRecord {
    id: string;
    userId: string;
    name: string;
    details: string;
    doctor?: string;
    file?: string;
    date: string;
}

export interface Document {
    id: string;
    userId: string;
    name: string;
    issuingCountry: string;
    documentNumber: string;
    issueDate: string;
    expiryDate: string;
    file?: string;
}

export interface Luggage {
    id: string;
    userId: string;
    trackingCode: string;
}

export enum View {
    Home = 'home',
    Trips = 'trips',
    Health = 'health',
    Documents = 'documents',
    Luggage = 'luggage',
    Profile = 'profile'
}
