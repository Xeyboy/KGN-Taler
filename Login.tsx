import React, { useState } from 'react';
import { LogIn, Wallet } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, password?: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('Max');
  const [password, setPassword] = useState('123'); 
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length > 0 && password.length > 0) {
      onLogin(username, password);
    } else {
      setError('Bitte Benutzernamen und Passwort eingeben.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-emerald-600 p-8 text-center">
          <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">KGN Taler Wallet</h1>
          <p className="text-emerald-100 mt-2">Dein Schul-Guthaben im Blick</p>
        </div>
        
        <div className="p-8">
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
            <p className="font-semibold mb-1">Anmeldedaten:</p>
            <p>Benutzername: <code className="bg-emerald-100 px-1 py-0.5 rounded font-bold">Max</code></p>
            <p>Passwort: <code className="bg-emerald-100 px-1 py-0.5 rounded font-bold">123</code></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Benutzername</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="z.B. Max"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="123"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Anmelden
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-gray-400">
            © 2024 KGN Taler System
          </div>
        </div>
      </div>
    </div>
  );
};