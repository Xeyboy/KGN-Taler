import React, { useEffect, useState } from 'react';
import { Transaction } from '../types';
import { getFinancialAdvice } from '../services/geminiService';
import { Sparkles, RefreshCw } from 'lucide-react';

interface GeminiAdvisorProps {
  balance: number;
  transactions: Transaction[];
}

export const GeminiAdvisor: React.FC<GeminiAdvisorProps> = ({ balance, transactions }) => {
  const [advice, setAdvice] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);

  const fetchAdvice = async () => {
    setLoading(true);
    const result = await getFinancialAdvice(balance, transactions);
    setAdvice(result);
    setLoading(false);
    setLoaded(true);
  };

  // Auto-load on mount if not loaded
  useEffect(() => {
    if (!loaded && transactions.length > 0) {
      fetchAdvice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        {/* Decorational Circle */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <h3 className="font-bold text-lg">Finanz-Check (KI)</h3>
        </div>
        <button 
          onClick={fetchAdvice} 
          disabled={loading}
          className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="relative z-10 min-h-[60px]">
        {loading ? (
          <p className="text-indigo-100 animate-pulse">Analysiere deine KGN Taler Ausgaben...</p>
        ) : (
          <div className="prose prose-invert prose-sm">
             <p className="text-indigo-50 leading-relaxed whitespace-pre-wrap">{advice}</p>
          </div>
        )}
      </div>
    </div>
  );
};