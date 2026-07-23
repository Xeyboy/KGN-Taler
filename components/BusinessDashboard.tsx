import React, { useState } from 'react';
import { Business, User } from '../types';
import { Briefcase, Wallet, Users, DollarSign } from 'lucide-react';

interface BusinessDashboardProps {
  user: User;
  business: Business;
  employees: User[];
  globalTaxRate: number;
  onUpdateWage: (employeeId: string, wage: number) => void;
  onPayWages: (employeeId: string) => void;
  onSwitchView: () => void;
}

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({
  user,
  business,
  employees,
  globalTaxRate,
  onUpdateWage,
  onPayWages,
}) => {
  const [editingWageId, setEditingWageId] = useState<string | null>(null);
  const [tempWage, setTempWage] = useState('');

  const saveWage = (employeeId: string) => {
    const wage = parseFloat(tempWage);
    if (!isNaN(wage)) {
      onUpdateWage(employeeId, wage);
    }
    setEditingWageId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Dual Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-medium text-sm mb-1 flex items-center gap-1">
              <Wallet className="w-4 h-4" /> Privatkonto
            </p>
            <h2 className="text-2xl font-bold text-gray-800">{user.balance.toFixed(2)} T</h2>
          </div>
        </div>

        {/* Business */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-sm text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-[-10px] bottom-[-10px] text-slate-700/50">
            <Briefcase className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <p className="text-slate-400 font-medium text-sm mb-1 flex items-center gap-1">
              <Briefcase className="w-4 h-4" /> Geschäftskonto: {business.name}
            </p>
            <h2 className="text-2xl font-bold text-white">{business.balance.toFixed(2)} T</h2>
            <p className="text-xs text-slate-400 mt-1">Shop Code: {business.code}</p>
          </div>
        </div>
      </div>

      {/* Employee Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Mitarbeiter ({employees.length})
          </h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
            Verwaltung nur durch Admin
          </span>
        </div>

        {/* Employee List */}
        <div className="divide-y divide-gray-100">
          {employees.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Keine Mitarbeiter zugewiesen.</div>
          ) : (
            employees.map(emp => {
                const taxRate = emp.individualTaxRate !== undefined ? emp.individualTaxRate : globalTaxRate;
                const wage = emp.grossWage || 0;
                const tax = wage * (taxRate / 100);
                const net = wage - tax;

                return (
                    <div key={emp.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50">
                    <div>
                        <div className="font-bold text-gray-800">{emp.name}</div>
                        <div className="text-sm text-gray-500">@{emp.username}</div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-xs text-gray-500">Lohn (Brutto)</div>
                            {editingWageId === emp.id ? (
                                <div className="flex items-center gap-1">
                                    <input 
                                        type="number" 
                                        value={tempWage}
                                        onChange={(e) => setTempWage(e.target.value)}
                                        className="w-20 border rounded px-1 py-0.5"
                                    />
                                    <button onClick={() => saveWage(emp.id)} className="text-green-600">✔</button>
                                </div>
                            ) : (
                                <div 
                                    onClick={() => { setEditingWageId(emp.id); setTempWage(wage.toString()); }}
                                    className="font-mono font-medium cursor-pointer hover:text-indigo-600 border-b border-dotted border-gray-400"
                                >
                                    {wage.toFixed(2)} T
                                </div>
                            )}
                        </div>

                        <div className="text-right hidden sm:block">
                            <div className="text-xs text-gray-500">Steuer ({taxRate}%)</div>
                            <div className="text-red-400 text-sm">-{tax.toFixed(2)} T</div>
                        </div>

                        <div className="text-right hidden sm:block">
                            <div className="text-xs text-gray-500">Netto</div>
                            <div className="text-emerald-600 font-bold">{net.toFixed(2)} T</div>
                        </div>

                        <button 
                            onClick={() => onPayWages(emp.id)}
                            disabled={wage <= 0 || business.balance < wage}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"
                        >
                            <DollarSign className="w-4 h-4" />
                            Auszahlen
                        </button>
                    </div>
                    </div>
                );
            })
          )}
        </div>
      </div>

    </div>
  );
};
