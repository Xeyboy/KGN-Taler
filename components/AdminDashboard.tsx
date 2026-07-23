import React, { useState } from 'react';
import { Business, User, SystemConfig, UserRole } from '../types';
import { Users, Save, DollarSign, Settings, LogOut } from 'lucide-react';

interface AdminDashboardProps {
  users: User[];
  businesses: Business[];
  config: SystemConfig;
  onUpdateConfig: (newConfig: SystemConfig) => void;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  businesses,
  config,
  onUpdateConfig,
  onUpdateUser,
  onLogout
}) => {
  const [globalTax, setGlobalTax] = useState(config.globalTaxRate);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  // Edit States
  const [editTaxRate, setEditTaxRate] = useState<string>('');
  const [editRole, setEditRole] = useState<UserRole>('STUDENT');
  const [editEmployerId, setEditEmployerId] = useState<string>('');

  const handleSaveGlobalConfig = () => {
    onUpdateConfig({
      ...config,
      globalTaxRate: globalTax
    });
    alert('Globale Steuerrate aktualisiert!');
  };

  const startEditUser = (user: User) => {
    setEditingUserId(user.id);
    setEditTaxRate(user.individualTaxRate?.toString() || '');
    setEditRole(user.role);
    setEditEmployerId(user.employerId || '');
  };

  const saveUserEdit = (user: User) => {
    const rate = editTaxRate === '' ? undefined : parseFloat(editTaxRate);
    
    // Logic: If role is not EMPLOYEE, clear employerId
    const finalEmployerId = editRole === 'EMPLOYEE' ? editEmployerId : undefined;

    onUpdateUser({
      ...user,
      individualTaxRate: rate,
      role: editRole,
      employerId: finalEmployerId
    });
    setEditingUserId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Settings className="w-8 h-8 text-emerald-400" />
              Admin Dashboard
            </h1>
            <p className="text-slate-400">Verwaltung & Steuerübersicht</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="text-sm text-slate-400">Steuer-Topf</p>
                <p className="text-xl font-bold text-emerald-400">{config.adminBalance.toFixed(2)} Taler</p>
            </div>
            <button onClick={onLogout} className="bg-red-500/20 hover:bg-red-500/40 p-2 rounded-lg transition-colors">
              <LogOut className="w-5 h-5 text-red-200" />
            </button>
          </div>
        </div>

        {/* Global Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Globale Steuereinstellungen
          </h2>
          <div className="flex items-end gap-4 max-w-md">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Lohnsteuer / Unternehmenssteuer (%)</label>
              <input 
                type="number" 
                value={globalTax}
                onChange={(e) => setGlobalTax(parseFloat(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <button 
              onClick={handleSaveGlobalConfig}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              Speichern
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Diese Rate gilt für alle Benutzer, sofern nicht individuell überschrieben.</p>
        </div>

        {/* Big Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Benutzerverwaltung
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-sm font-semibold text-gray-600">Name / Login</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Rolle</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Arbeitgeber (für MA)</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Steuer (%)</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => {
                    const effectiveTax = user.individualTaxRate !== undefined ? user.individualTaxRate : config.globalTaxRate;
                    const isBusinessOwner = user.role === 'BUSINESS_OWNER';
                    const business = businesses.find(b => b.ownerId === user.id);
                    const employeeCompany = businesses.find(b => b.id === user.employerId);

                    return (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        {/* Name Column */}
                        <td className="p-4">
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">@{user.username}</div>
                            {isBusinessOwner && business && (
                                <div className="text-xs text-indigo-600 mt-1">Biz: {business.name}</div>
                            )}
                        </td>

                        {/* Role Column */}
                        <td className="p-4">
                            {editingUserId === user.id ? (
                                <select 
                                    value={editRole} 
                                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                                    className="px-2 py-1 border rounded text-sm w-full bg-white"
                                >
                                    <option value="STUDENT">Schüler</option>
                                    <option value="BUSINESS_OWNER">Unternehmer</option>
                                    <option value="EMPLOYEE">Mitarbeiter</option>
                                    <option value="CIVIL_SERVANT">Beamter</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            ) : (
                                <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium 
                                ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 
                                    user.role === 'BUSINESS_OWNER' ? 'bg-indigo-100 text-indigo-700' :
                                    user.role === 'EMPLOYEE' ? 'bg-blue-100 text-blue-700' : 
                                    user.role === 'CIVIL_SERVANT' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                {user.role === 'BUSINESS_OWNER' ? 'Unternehmer' : 
                                 user.role === 'EMPLOYEE' ? 'Mitarbeiter' : 
                                 user.role === 'CIVIL_SERVANT' ? 'Beamter' : user.role}
                                </span>
                            )}
                        </td>

                        {/* Employer Column (Only relevant for Employees) */}
                        <td className="p-4">
                            {editingUserId === user.id ? (
                                editRole === 'EMPLOYEE' ? (
                                    <select 
                                        value={editEmployerId} 
                                        onChange={(e) => setEditEmployerId(e.target.value)}
                                        className="px-2 py-1 border rounded text-sm w-full bg-white"
                                    >
                                        <option value="">- Kein -</option>
                                        {businesses.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className="text-gray-300 text-xs">-</span>
                                )
                            ) : (
                                user.role === 'EMPLOYEE' ? (
                                    employeeCompany ? 
                                    <span className="text-sm text-gray-700 font-medium">{employeeCompany.name}</span> : 
                                    <span className="text-xs text-red-400">Kein Arbeitgeber</span>
                                ) : <span className="text-gray-300">-</span>
                            )}
                        </td>

                        {/* Tax Rate Column */}
                        <td className="p-4">
                            {editingUserId === user.id ? (
                                <input 
                                    type="number" 
                                    value={editTaxRate}
                                    placeholder="Std."
                                    onChange={(e) => setEditTaxRate(e.target.value)}
                                    className="w-16 px-2 py-1 border rounded text-sm"
                                />
                            ) : (
                                <span className={user.individualTaxRate !== undefined ? "text-orange-600 font-bold" : "text-gray-600"}>
                                    {effectiveTax}%
                                </span>
                            )}
                        </td>

                        {/* Actions Column */}
                        <td className="p-4">
                            {user.role !== 'ADMIN' && (
                                editingUserId === user.id ? (
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => saveUserEdit(user)}
                                            className="text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded text-xs"
                                        >
                                            Speichern
                                        </button>
                                        <button 
                                            onClick={() => setEditingUserId(null)}
                                            className="text-gray-600 hover:text-gray-800 text-xs px-2"
                                        >
                                            Abbr.
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => startEditUser(user)}
                                        className="text-blue-600 font-medium text-sm hover:underline"
                                    >
                                        Bearbeiten
                                    </button>
                                )
                            )}
                        </td>
                        </tr>
                    );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
