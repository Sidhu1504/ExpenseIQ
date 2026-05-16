"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Receipt, PlusCircle, TrendingDown, TrendingUp, Scale, Download, Filter, ShieldAlert, CheckCircle2 } from "lucide-react";
import { ScanModal, AddModal } from "@/components/Modals";
import SidebarLayout from "@/components/SidebarLayout";

export default function Dashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [timeFilter, setTimeFilter] = useState("monthly"); // Default to monthly

  // Budget States
  const [budgetLimit, setBudgetLimit] = useState("");
  const [budgetCycle, setBudgetCycle] = useState("monthly");
  const [activeBudget, setActiveBudget] = useState<{ limit: number, cycle: string } | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("expense_jwt") : null;

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const res = await fetch(`${apiUrl}/transactions`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
      
      // Load saved budget from local storage for demo purposes
      const savedBudget = localStorage.getItem("expense_budget");
      if (savedBudget) {
        setActiveBudget(JSON.parse(savedBudget));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) { router.push("/"); return; }
    setIsAuthenticated(true);
    fetchData();
  }, [router, token, fetchData]);

  // Filter Engine Logic
  const filteredTransactions = transactions.filter(tx => {
    if (timeFilter === 'all') return true;
    
    const txDate = new Date(tx.date);
    const now = new Date();
    
    if (timeFilter === 'daily') return txDate.toDateString() === now.toDateString();
    if (timeFilter === 'weekly') {
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return txDate >= lastWeek;
    }
    if (timeFilter === 'monthly') return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    if (timeFilter === 'yearly') return txDate.getFullYear() === now.getFullYear();
    return true;
  });

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const netBalance = totalIncome - totalExpense;

  const groupedData = filteredTransactions.reduce((acc: any, tx: any) => {
    const dateStr = new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!acc[dateStr]) acc[dateStr] = { name: dateStr, income: 0, expense: 0 };
    if (tx.type === 'income') acc[dateStr].income += parseFloat(tx.amount);
    if (tx.type === 'expense') acc[dateStr].expense += parseFloat(tx.amount);
    return acc;
  }, {});
  
  const chartData = Object.values(groupedData).slice(0, 14).reverse();

  const handleExportCSV = () => {
    const headers = "Date,Time,Reason/Merchant,Type,Amount (INR),Notes\n";
    const rows = filteredTransactions.map(tx => {
      const d = new Date(tx.date);
      const dateString = d.toLocaleDateString();
      const timeString = d.toLocaleTimeString();
      const notes = tx.notes ? tx.notes.replace(/,/g, " ") : ""; 
      return `"${dateString}","${timeString}","${tx.merchant_name || 'System Entry'}","${tx.type.toUpperCase()}","${tx.amount}","${notes}"`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ExpenseIQ_Ledger_${timeFilter.toUpperCase()}_${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetLimit) return;
    const newBudget = { limit: parseFloat(budgetLimit), cycle: budgetCycle };
    setActiveBudget(newBudget);
    localStorage.setItem("expense_budget", JSON.stringify(newBudget));
    setBudgetLimit("");
  };

  if (!isAuthenticated || loading) return <div className="min-h-screen bg-[#070a13] text-gray-500 font-mono flex items-center justify-center">Loading Enterprise Datastreams...</div>;

  // Calculate Budget Health
  let budgetPercentage = 0;
  if (activeBudget && timeFilter === activeBudget.cycle) {
    budgetPercentage = Math.min((totalExpense / activeBudget.limit) * 100, 100);
  }

  return (
    <SidebarLayout>
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-white">Overview Workspace</h2>
          <p className="text-xs text-gray-400 mt-1">Real-time ledger tracking for Income and Expenditure.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-gray-900 border border-white/[0.06] rounded-lg p-1">
            <Filter size={14} className="text-gray-500 ml-2 mr-1" />
            {['daily', 'weekly', 'monthly', 'yearly', 'all'].map(span => (
              <button key={span} onClick={() => setTimeFilter(span)} className={`px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider rounded-md transition-colors ${timeFilter === span ? 'bg-blue-600/20 text-blue-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'}`}>
                {span}
              </button>
            ))}
          </div>
          <button onClick={handleExportCSV} className="flex items-center gap-2 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] uppercase tracking-wider px-4 py-2 rounded-lg transition-colors">
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-white/[0.06] rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><Scale size={18} /></div>
          <div>
            <p className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-1">Net Balance ({timeFilter})</p>
            <p className={`text-xl font-heading font-bold ${netBalance >= 0 ? 'text-white' : 'text-red-400'}`}>₹{netBalance.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-gray-900 border border-white/[0.06] rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"><TrendingUp size={18} /></div>
          <div>
            <p className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-1">Total Inflow ({timeFilter})</p>
            <p className="text-xl font-heading font-bold text-emerald-400">₹{totalIncome.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-gray-900 border border-white/[0.06] rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500"><TrendingDown size={18} /></div>
          <div>
            <p className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-1">Total Outflow ({timeFilter})</p>
            <p className="text-xl font-heading font-bold text-red-400">₹{totalExpense.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Module A: Dual Analytics Engine */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-gray-900 border border-white/[0.06] rounded-xl p-6">
            <h3 className="font-heading text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Cash Flow Analytics Matrix ({timeFilter.toUpperCase()})</h3>
            <div className="h-64 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                    <XAxis dataKey="name" stroke="#6B7280" fontSize={11} />
                    <YAxis stroke="#6B7280" fontSize={11} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#090D16', borderColor: '#1F2937', borderRadius: '8px' }} itemStyle={{ fontSize: '12px', fontFamily: 'monospace' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconType="circle" />
                    <Bar dataKey="income" name="Income (+)" fill="#10B981" radius={[2, 2, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="expense" name="Expense (-)" fill="#EF4444" radius={[2, 2, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-600 font-mono text-xs">No ledger telemetry for this time span...</div>
              )}
            </div>
          </div>

          {/* Budget Governance Panel */}
          <div className="bg-gray-900 border border-white/[0.06] rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2"><ShieldAlert size={14} className="text-purple-500" /> Budget Governance</h3>
              {activeBudget && <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded font-mono uppercase border border-blue-500/20">{activeBudget.cycle} Limit: ₹{activeBudget.limit}</span>}
            </div>

            {activeBudget && timeFilter === activeBudget.cycle ? (
               <div className="space-y-2">
                 <div className="flex justify-between text-xs font-mono">
                   <span className="text-gray-400">Current Spend</span>
                   <span className={budgetPercentage >= 90 ? 'text-red-400' : 'text-emerald-400'}>{budgetPercentage.toFixed(1)}% Used</span>
                 </div>
                 <div className="w-full h-2 bg-gray-950 rounded-full overflow-hidden border border-white/[0.04]">
                   <div className={`h-full transition-all duration-1000 ${budgetPercentage >= 90 ? 'bg-red-500' : budgetPercentage >= 75 ? 'bg-yellow-500' : 'bg-emerald-500'}`} style={{ width: `${budgetPercentage}%` }}></div>
                 </div>
                 {budgetPercentage >= 90 && <p className="text-[10px] text-red-400 font-sans mt-2 flex items-center gap-1"><ShieldAlert size={12}/> Critical Alert: You are nearing your set expenditure limits.</p>}
               </div>
            ) : (
               <form onSubmit={handleSaveBudget} className="flex flex-col sm:flex-row gap-3">
                 <select value={budgetCycle} onChange={(e) => setBudgetCycle(e.target.value)} className="bg-gray-950 border border-white/[0.08] rounded-lg p-2 text-white text-xs font-mono focus:outline-none focus:border-purple-500">
                   <option value="daily">Daily Limit</option>
                   <option value="weekly">Weekly Limit</option>
                   <option value="monthly">Monthly Limit</option>
                   <option value="yearly">Yearly Limit</option>
                 </select>
                 <input type="number" required value={budgetLimit} onChange={(e) => setBudgetLimit(e.target.value)} className="flex-1 bg-gray-950 border border-white/[0.08] rounded-lg p-2 text-white text-xs font-mono focus:outline-none focus:border-purple-500" placeholder="Target Max Expenditure (INR)" />
                 <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs px-4 py-2 rounded-lg transition shrink-0">Engage Policy</button>
               </form>
            )}
          </div>
        </div>

        {/* Module B: Detailed Transaction Register */}
        <div className="bg-gray-900 border border-white/[0.06] rounded-xl p-6 flex flex-col h-[35rem]">
          <h3 className="font-heading text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Filtered Ledger Entries</h3>
          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center p-3 bg-gray-950 border border-white/[0.04] rounded-lg text-xs hover:border-white/[0.1] transition-colors">
                <div className="flex gap-3 items-center">
                  <div className={`w-1 h-8 rounded-full ${tx.type === 'expense' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                  <div>
                    <p className="font-medium text-gray-200 text-[13px]">{tx.merchant_name || 'System Entry'}</p>
                    <p className="text-[10px] text-gray-500 font-mono flex gap-2">
                      <span>{new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      {tx.notes && <span className="truncate max-w-[80px] opacity-70" title={tx.notes}>| {tx.notes}</span>}
                    </p>
                  </div>
                </div>
                <span className={`font-mono font-bold text-sm ${tx.type === 'expense' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {tx.type === 'expense' ? '-' : '+'}₹{parseFloat(tx.amount).toFixed(2)}
                </span>
              </div>
            ))}
            {filteredTransactions.length === 0 && <div className="text-gray-600 text-center text-xs font-mono pt-10">No records found for this period.</div>}
          </div>
          <div className="pt-4 grid grid-cols-2 gap-2 mt-2 border-t border-white/[0.04]">
            <button onClick={() => setIsScanOpen(true)} className="bg-gray-800 hover:bg-gray-700 text-white font-mono text-xs py-2 rounded-lg flex items-center justify-center gap-1 transition"><Receipt size={14}/> OCR Scan</button>
            <button onClick={() => setIsAddOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs py-2 rounded-lg flex items-center justify-center gap-1 transition"><PlusCircle size={14}/> Add Entry</button>
          </div>
        </div>

      </div>

      <ScanModal isOpen={isScanOpen} onClose={() => setIsScanOpen(false)} onSuccess={fetchData} />
      <AddModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSuccess={fetchData} />
    </SidebarLayout>
  );
}
