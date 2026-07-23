import React from 'react';
import { Transaction } from '../types';
import { ArrowDownLeft, ArrowUpRight, ShoppingBag } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  limit?: number;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, limit }) => {
  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-20" />
        <p>Keine Transaktionen gefunden.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayTransactions.map((tx) => (
        <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              tx.type === 'deposit' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
            }`}>
              {tx.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">{tx.shopName}</h4>
              <p className="text-xs text-gray-500">
                {new Date(tx.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div className={`font-bold ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-gray-800'}`}>
            {tx.type === 'expense' ? '-' : '+'}{tx.amount.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
};