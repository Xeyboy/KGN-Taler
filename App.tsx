import React, { useState } from 'react';
import { AVAILABLE_SHOPS, INITIAL_TRANSACTIONS, INITIAL_USERS, INITIAL_BUSINESSES, INITIAL_CONFIG } from './constants';
import { AppView, Transaction, User, Business, SystemConfig } from './types';
import { Login } from './components/Login';
import { TransactionList } from './components/TransactionList';
import { GeminiAdvisor } from './components/GeminiAdvisor';
import { AdminDashboard } from './components/AdminDashboard';
import { BusinessDashboard } from './components/BusinessDashboard';
import { 
  Wallet, 
  CreditCard, 
  History, 
  LogOut, 
  Store, 
  CheckCircle,
  AlertCircle,
  X,
  Briefcase
} from 'lucide-react';

const App: React.FC = () => {
  // Global State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [businesses, setBusinesses] = useState<Business[]>(INITIAL_BUSINESSES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(INITIAL_CONFIG);
  
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  
  // Payment State
  const [payAmount, setPayAmount] = useState<string>('');
  const [shopCode, setShopCode] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [paymentMessage, setPaymentMessage] = useState('');

  // --- Auth Handlers ---

  const handleLogin = (username: string, password?: string) => {
    const cleanUsername = username.trim();

    if (password !== '123') {
      alert("Falsches Passwort! Das Passwort lautet 123.");
      return;
    }

    // Match username case-insensitively (e.g. 'Max', 'max', 'admin', etc.)
    const foundUser = users.find(
      u => u.username.toLowerCase() === cleanUsername.toLowerCase()
    );

    if (foundUser) {
      setCurrentUser(foundUser);
      if (foundUser.role === 'ADMIN') {
        setView(AppView.ADMIN_DASHBOARD);
      } else {
        setView(AppView.DASHBOARD);
      }
    } else {
      alert(`Benutzer "${cleanUsername}" nicht gefunden.`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView(AppView.LOGIN);
    setPayAmount('');
    setShopCode('');
  };

  // --- Business Logic ---

  const handleUpdateWage = (employeeId: string, wage: number) => {
    setUsers(users.map(u => u.id === employeeId ? { ...u, grossWage: wage } : u));
  };

  const handlePayWages = (employeeId: string) => {
    if (!currentUser) return;
    const business = businesses.find(b => b.ownerId === currentUser.id);
    const employee = users.find(u => u.id === employeeId);

    if (!business || !employee || !employee.grossWage) return;

    const gross = employee.grossWage;
    const taxRate = employee.individualTaxRate !== undefined ? employee.individualTaxRate : systemConfig.globalTaxRate;
    const taxAmount = gross * (taxRate / 100);
    const netAmount = gross - taxAmount;

    if (business.balance < gross) {
        alert("Nicht genügend Geschäftsguthaben!");
        return;
    }

    // Update Balances
    const updatedBusiness = { ...business, balance: business.balance - gross };
    const updatedEmployee = { ...employee, balance: employee.balance + netAmount };
    const updatedConfig = { ...systemConfig, adminBalance: systemConfig.adminBalance + taxAmount };

    setBusinesses(businesses.map(b => b.id === business.id ? updatedBusiness : b));
    setUsers(users.map(u => u.id === employee.id ? updatedEmployee : u));
    setSystemConfig(updatedConfig);

    // Create Transactions
    const date = new Date().toISOString();
    const wageTx: Transaction = {
        id: `wage-${Date.now()}`,
        shopName: business.name,
        amount: netAmount,
        date: date,
        type: 'deposit',
        category: 'Lohn'
    };
    
    // Add transaction to history
    setTransactions([wageTx, ...transactions]);
    alert(`Lohn ausgezahlt: ${netAmount.toFixed(2)} T (Steuer: ${taxAmount.toFixed(2)} T)`);
  };

  // --- Payment Logic ---

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStatus('idle');

    if (!currentUser) return;

    const amount = parseFloat(payAmount);
    const code = shopCode.toUpperCase().trim();

    // Validations
    if (isNaN(amount) || amount <= 0) {
      setPaymentStatus('error');
      setPaymentMessage('Bitte einen gültigen Betrag eingeben.');
      return;
    }

    // Check against standard shops OR registered businesses
    const standardShop = AVAILABLE_SHOPS.find(s => s.code === code);
    const businessShop = businesses.find(b => b.code === code);
    
    const shopName = standardShop ? standardShop.name : businessShop ? businessShop.name : null;
    const shopCategory = standardShop ? standardShop.category : businessShop ? businessShop.category : 'Allgemein';

    if (!shopName) {
      setPaymentStatus('error');
      setPaymentMessage('Ungültiger Shop-Code.');
      return;
    }

    if (currentUser.balance < amount) {
      setPaymentStatus('error');
      setPaymentMessage('Nicht genügend KGN Taler Guthaben.');
      return;
    }

    // Execute Transaction
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      shopName: shopName,
      amount: amount,
      date: new Date().toISOString(),
      type: 'expense',
      category: shopCategory
    };

    setTransactions([newTransaction, ...transactions]);
    
    // Deduct from User
    const updatedUser = { ...currentUser, balance: currentUser.balance - amount };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));

    // If paid to a business, add to business balance
    if (businessShop) {
        setBusinesses(businesses.map(b => b.id === businessShop.id ? { ...b, balance: b.balance + amount } : b));
    }

    // Reset Form & Show Success
    setPaymentStatus('success');
    setPaymentMessage(`Erfolgreich ${amount.toFixed(2)} an ${shopName} gezahlt!`);
    setPayAmount('');
    setShopCode('');
    
    setTimeout(() => {
        setPaymentStatus('idle');
        setView(AppView.DASHBOARD);
    }, 2500);
  };

  // --- Render Logic ---

  if (!currentUser || view === AppView.LOGIN) {
    return <Login onLogin={handleLogin} />;
  }

  // Admin View
  if (view === AppView.ADMIN_DASHBOARD && currentUser.role === 'ADMIN') {
    return (
        <AdminDashboard 
            users={users}
            businesses={businesses}
            config={systemConfig}
            onUpdateConfig={setSystemConfig}
            onUpdateUser={(updatedUser) => setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u))}
            onLogout={handleLogout}
        />
    );
  }

  // Helper for Business View
  const currentBusiness = currentUser.role === 'BUSINESS_OWNER' 
      ? businesses.find(b => b.ownerId === currentUser.id) 
      : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-emerald-600 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(AppView.DASHBOARD)}>
            <div className="bg-white/20 p-2 rounded-full">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg hidden sm:block">KGN Taler</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-100 text-sm">{currentUser.name}</span>
            <button onClick={handleLogout} className="text-white/80 hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        
        {/* View: DASHBOARD */}
        {view === AppView.DASHBOARD && (
          <>
            {/* Balance Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="absolute right-[-20px] top-[-20px] bg-emerald-50 w-32 h-32 rounded-full z-0"></div>
              <div className="relative z-10">
                <p className="text-gray-500 font-medium mb-1">Mein Guthaben</p>
                <h2 className="text-4xl font-bold text-emerald-600">{currentUser.balance.toFixed(2)} <span className="text-lg text-emerald-400 font-normal">Taler</span></h2>
                <div className="mt-1 inline-block px-2 py-0.5 rounded text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase font-semibold tracking-wider">
                    {currentUser.role === 'CIVIL_SERVANT' ? 'Beamter' : currentUser.role === 'STUDENT' ? 'Schüler' : currentUser.role === 'BUSINESS_OWNER' ? 'Unternehmer' : currentUser.role === 'EMPLOYEE' ? 'Mitarbeiter' : 'Admin'}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setView(AppView.PAYMENT)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl shadow-md transition-all flex flex-col items-center justify-center gap-2"
              >
                <CreditCard className="w-8 h-8" />
                <span className="font-semibold">Bezahlen</span>
              </button>
              <button 
                onClick={() => setView(AppView.HISTORY)}
                className="bg-white hover:bg-gray-50 text-gray-700 p-4 rounded-xl shadow-sm border border-slate-200 transition-all flex flex-col items-center justify-center gap-2"
              >
                <History className="w-8 h-8 text-emerald-600" />
                <span className="font-semibold">Verlauf</span>
              </button>
            </div>

             {/* Business Owner Tab */}
             {currentUser.role === 'BUSINESS_OWNER' && (
                 <button 
                    onClick={() => setView(AppView.BUSINESS_DASHBOARD)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl shadow-md transition-all flex items-center justify-between"
                 >
                     <div className="flex items-center gap-3">
                        <Briefcase className="w-6 h-6" />
                        <span className="font-semibold">Mein Unternehmen verwalten</span>
                     </div>
                     <span className="bg-white/20 px-2 py-1 rounded text-sm">Biz</span>
                 </button>
             )}

             {/* AI Advisor Teaser */}
             <GeminiAdvisor balance={currentUser.balance} transactions={transactions} />

            {/* Recent Transactions Preview */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-700">Letzte Aktivitäten</h3>
                <button onClick={() => setView(AppView.HISTORY)} className="text-emerald-600 text-sm font-medium">Alle ansehen</button>
              </div>
              <TransactionList transactions={transactions} limit={3} />
            </div>
          </>
        )}

        {/* View: BUSINESS DASHBOARD */}
        {view === AppView.BUSINESS_DASHBOARD && currentUser.role === 'BUSINESS_OWNER' && (
            currentBusiness ? (
            <BusinessDashboard 
                user={currentUser}
                business={currentBusiness}
                employees={users.filter(u => u.employerId === currentBusiness.id)}
                globalTaxRate={systemConfig.globalTaxRate}
                onUpdateWage={handleUpdateWage}
                onPayWages={handlePayWages}
                onSwitchView={() => setView(AppView.DASHBOARD)}
            />
            ) : (
                <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-sm border border-red-100 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Kein Unternehmen zugeordnet</h3>
                    <p className="text-gray-500 mb-6">Sie sind als Unternehmer registriert, aber es wurde kein Unternehmen mit Ihrem Konto verknüpft. Bitte wenden Sie sich an den Admin.</p>
                    <button 
                        onClick={() => setView(AppView.DASHBOARD)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                        Zurück zum Dashboard
                    </button>
                </div>
            )
        )}

        {/* View: PAYMENT */}
        {view === AppView.PAYMENT && (
          <div className="max-w-md mx-auto">
             <div className="flex items-center mb-6">
                <button onClick={() => setView(AppView.DASHBOARD)} className="mr-4 text-gray-500 hover:text-gray-800">
                    <X className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-gray-800">Bezahlen</h2>
             </div>

             <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                {paymentStatus === 'success' ? (
                    <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
                        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Zahlung erfolgreich!</h3>
                        <p className="text-gray-500">{paymentMessage}</p>
                    </div>
                ) : (
                    <form onSubmit={handlePayment} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Shop-Code</label>
                            <div className="relative">
                                <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input 
                                    type="text" 
                                    value={shopCode}
                                    onChange={(e) => setShopCode(e.target.value.toUpperCase())}
                                    placeholder="z.B. KIOSK"
                                    className="w-full pl-10 pr-4 py-4 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono text-lg uppercase placeholder:normal-case"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                Verfügbar: {AVAILABLE_SHOPS.map(s => s.code).join(', ')}
                                {businesses.map(b => `, ${b.code}`).join('')}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Betrag (Taler)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">T</span>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    min="0.01"
                                    value={payAmount}
                                    onChange={(e) => setPayAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full pl-10 pr-4 py-4 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-2xl font-bold text-gray-800"
                                />
                            </div>
                        </div>

                        {paymentStatus === 'error' && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {paymentMessage}
                            </div>
                        )}

                        <button 
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
                        >
                            Jetzt bezahlen
                        </button>
                    </form>
                )}
             </div>
             
             {/* Available Balance Hint */}
             <div className="mt-6 text-center">
                <p className="text-gray-500">Verfügbares Guthaben</p>
                <p className="text-xl font-bold text-emerald-600">{currentUser.balance.toFixed(2)} Taler</p>
             </div>
          </div>
        )}

        {/* View: HISTORY */}
        {view === AppView.HISTORY && (
            <div>
                <div className="flex items-center mb-6">
                    <button onClick={() => setView(AppView.DASHBOARD)} className="mr-4 text-gray-500 hover:text-gray-800">
                        <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">Alle Transaktionen</h2>
                </div>
                <TransactionList transactions={transactions} />
            </div>
        )}

      </main>

      {/* Mobile Navigation (Sticky Bottom) - Not for Admin */}
      {currentUser.role !== 'ADMIN' && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-around items-center z-50">
            <button 
                onClick={() => setView(AppView.DASHBOARD)}
                className={`flex flex-col items-center ${view === AppView.DASHBOARD || view === AppView.BUSINESS_DASHBOARD ? 'text-emerald-600' : 'text-gray-400'}`}
            >
                <Wallet className="w-6 h-6" />
                <span className="text-[10px] mt-1 font-medium">Home</span>
            </button>
            <button 
                onClick={() => setView(AppView.PAYMENT)}
                className="flex flex-col items-center -mt-8"
            >
                <div className="bg-emerald-600 text-white p-4 rounded-full shadow-lg shadow-emerald-200">
                    <CreditCard className="w-6 h-6" />
                </div>
            </button>
            <button 
                onClick={() => setView(AppView.HISTORY)}
                className={`flex flex-col items-center ${view === AppView.HISTORY ? 'text-emerald-600' : 'text-gray-400'}`}
            >
                <History className="w-6 h-6" />
                <span className="text-[10px] mt-1 font-medium">Verlauf</span>
            </button>
          </div>
      )}
    </div>
  );
};

export default App;