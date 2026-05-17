"use client";
import { useEffect, useState, useCallback } from "react";
import SidebarLayout from "@/components/SidebarLayout";
import { Users, PlusCircle, CheckCircle2, Clock } from "lucide-react";

export default function SplitWorkspace() {
  const [splits, setSplits] = useState<any[]>([]);
  const [friendName, setFriendName] = useState("");
  const [desc, setDesc] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  
  const fetchSplits = useCallback(async () => {
    const token = localStorage.getItem("expense_jwt");
    if (!token) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    try {
      const res = await fetch(`${apiUrl}/features/splits`, { headers: { "Authorization": `Bearer ${token}` } });
      const data = await res.json();
      setSplits(data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchSplits(); }, [fetchSplits]);

  const handleAddSplit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendName || !desc || !totalAmount) return;
    const amountOwed = parseFloat(totalAmount) / 2; // Simple 50/50 split for now

    try {
      const token = localStorage.getItem("expense_jwt");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      await fetch(`${apiUrl}/features/splits`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ friend_name: friendName, description: desc, total_amount: parseFloat(totalAmount), amount_owed: amountOwed }),
      });
      setFriendName(""); setDesc(""); setTotalAmount("");
      fetchSplits();
    } catch (err) { console.error(err); }
  };

  const handleSettle = async (id: number) => {
    try {
      const token = localStorage.getItem("expense_jwt");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      await fetch(`${apiUrl}/features/splits/${id}/settle`, { method: "PUT", headers: { "Authorization": `Bearer ${token}` }});
      fetchSplits();
    } catch (err) { console.error(err); }
  };

  const totalOwedToYou = splits.filter(s => s.status === 'pending').reduce((sum, s) => sum + parseFloat(s.amount_owed), 0);

  return (
    <SidebarLayout>
      <div className="border-b border-white/[0.06] pb-4 mb-6 flex justify-between items-end">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">Split Accounts Matrix</h2>
          <p className="text-xs text-gray-400 mt-1">Track shared bills and pending reimbursements from peers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module A: Split Creation Form */}
        <div className="bg-gray-900 border border-white/[0.06] rounded-xl p-6 h-fit">
          <h3 className="font-heading text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2"><PlusCircle size={16} className="text-blue-500" /> Generate New Split</h3>
          <form onSubmit={handleAddSplit} className="space-y-4">
            <div><label className="text-[10px] font-mono text-gray-400">FRIEND/NODE NAME</label><input type="text" required value={friendName} onChange={(e)=>setFriendName(e.target.value)} className="w-full bg-gray-950 border border-white/[0.06] rounded-lg p-2.5 text-white text-xs mt-1 focus:border-blue-500 outline-none" placeholder="e.g. John Doe" /></div>
            <div><label className="text-[10px] font-mono text-gray-400">REASON</label><input type="text" required value={desc} onChange={(e)=>setDesc(e.target.value)} className="w-full bg-gray-950 border border-white/[0.06] rounded-lg p-2.5 text-white text-xs mt-1 focus:border-blue-500 outline-none" placeholder="e.g. Dinner at Zomato" /></div>
            <div><label className="text-[10px] font-mono text-gray-400">TOTAL BILL AMOUNT (INR)</label><input type="number" required value={totalAmount} onChange={(e)=>setTotalAmount(e.target.value)} className="w-full bg-gray-950 border border-white/[0.06] rounded-lg p-2.5 text-white text-xs mt-1 font-mono focus:border-blue-500 outline-none" placeholder="0.00" /></div>
            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex justify-between items-center text-xs">
              <span className="text-blue-400 font-mono">They will owe you (50%):</span>
              <span className="text-white font-bold">₹{totalAmount ? (parseFloat(totalAmount)/2).toFixed(2) : "0.00"}</span>
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold py-2.5 rounded-lg transition mt-2">Log Split Request</button>
          </form>
        </div>

        {/* Module B: Outstanding Balances */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 flex justify-between items-center">
            <div>
              <p className="text-emerald-400 font-mono text-xs uppercase tracking-wider mb-1">Total Pending Capital to Recover</p>
              <h2 className="text-3xl font-heading font-bold text-white">₹{totalOwedToYou.toFixed(2)}</h2>
            </div>
            <Users size={40} className="text-emerald-500 opacity-50" />
          </div>

          <div className="bg-gray-900 border border-white/[0.06] rounded-xl p-6 flex flex-col h-[28rem]">
            <h3 className="font-heading text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Active Ledger History</h3>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
              {splits.map((split) => (
                <div key={split.id} className={`flex justify-between items-center p-4 bg-gray-950 border rounded-xl text-xs transition-colors ${split.status === 'pending' ? 'border-white/[0.08] hover:border-blue-500/50' : 'border-emerald-500/20 opacity-60'}`}>
                  <div className="flex gap-4 items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${split.status === 'pending' ? 'bg-blue-600/20 text-blue-400' : 'bg-emerald-600/20 text-emerald-400'}`}>
                      {split.friend_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-200 text-sm">{split.friend_name} owes you <span className="text-white font-bold">₹{parseFloat(split.amount_owed).toFixed(2)}</span></p>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">{split.description} • Total Bill: ₹{parseFloat(split.total_amount).toFixed(2)}</p>
                    </div>
                  </div>
                  {split.status === 'pending' ? (
                    <button onClick={() => handleSettle(split.id)} className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-lg font-mono flex items-center gap-2 transition">
                      <CheckCircle2 size={14} /> Settle
                    </button>
                  ) : (
                    <span className="flex items-center gap-1.5 text-emerald-500 font-mono"><CheckCircle2 size={14} /> Settled</span>
                  )}
                </div>
              ))}
              {splits.length === 0 && <div className="text-gray-600 text-center font-mono py-10">No active splits registered.</div>}
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
