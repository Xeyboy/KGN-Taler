export type UserRole = 'STUDENT' | 'BUSINESS_OWNER' | 'ADMIN' | 'EMPLOYEE' | 'CIVIL_SERVANT';

export interface Transaction {
  id: string;
  shopName: string;
  amount: number;
  date: string; // ISO String
  type: 'expense' | 'deposit' | 'wage' | 'tax';
  category?: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  balance: number;
  role: UserRole;
  // For Employees
  employerId?: string;
  grossWage?: number; // The wage set by the business owner
  individualTaxRate?: number; // Optional override by admin
}

export interface Business {
  id: string;
  name: string;
  ownerId: string;
  balance: number;
  code: string; // The shop code used for payments
  category: string;
}

export interface Shop {
  code: string;
  name: string;
  category: string;
}

export enum AppView {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  PAYMENT = 'PAYMENT',
  HISTORY = 'HISTORY',
  AI_INSIGHTS = 'AI_INSIGHTS',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  BUSINESS_DASHBOARD = 'BUSINESS_DASHBOARD'
}

export interface SystemConfig {
  globalTaxRate: number; // Percentage (e.g., 10 for 10%)
  adminBalance: number; // Tax collected
}