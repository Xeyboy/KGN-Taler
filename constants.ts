import { Business, Shop, SystemConfig, Transaction, User } from './types';

// Mock Shops database (Static shops)
export const AVAILABLE_SHOPS: Shop[] = [
  { code: 'KIOSK', name: 'Schulkiosk', category: 'Verpflegung' },
  { code: 'MENSA', name: 'Mensa', category: 'Verpflegung' },
  { code: 'BUECHER', name: 'Schülerbibliothek', category: 'Bildung' },
  { code: 'SPORT', name: 'Sportverleih', category: 'Freizeit' },
  { code: 'KOPIE', name: 'Kopierraum', category: 'Material' },
];

// Initial mock transactions
export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', shopName: 'Sekretariat (Aufladung)', amount: 50, date: new Date(Date.now() - 86400000 * 5).toISOString(), type: 'deposit', category: 'Guthaben' },
  { id: 't2', shopName: 'Mensa', amount: 4.50, date: new Date(Date.now() - 86400000 * 2).toISOString(), type: 'expense', category: 'Verpflegung' },
  { id: 't3', shopName: 'Schulkiosk', amount: 1.20, date: new Date(Date.now() - 86400000 * 1).toISOString(), type: 'expense', category: 'Verpflegung' },
];

// Mock Users
export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    username: 'Max',
    name: 'Max Mustermann',
    balance: 44.30,
    role: 'STUDENT'
  },
  {
    id: 'admin1',
    username: 'admin',
    name: 'Schulleitung (Admin)',
    balance: 0,
    role: 'ADMIN'
  },
  {
    id: 'owner1',
    username: 'chef',
    name: 'Kiosk Besitzer',
    balance: 120.50,
    role: 'BUSINESS_OWNER'
  },
  {
    id: 'emp1',
    username: 'mitarbeiter',
    name: 'Lisa Mitarbeiterin',
    balance: 15.00,
    role: 'EMPLOYEE',
    employerId: 'biz1',
    grossWage: 12.00 // Hourly or per task
  },
  {
    id: 'off1',
    username: 'beamter',
    name: 'Herr Ordnung (Beamter)',
    balance: 85.00,
    role: 'CIVIL_SERVANT'
  }
];

export const INITIAL_BUSINESSES: Business[] = [
  {
    id: 'biz1',
    name: 'Der Coolste Kiosk',
    ownerId: 'owner1',
    balance: 500.00,
    code: 'KIOSK_P', // Private kiosk code
    category: 'Verpflegung'
  }
];

export const INITIAL_CONFIG: SystemConfig = {
  globalTaxRate: 15.0, // 15% tax default
  adminBalance: 1000.00
};