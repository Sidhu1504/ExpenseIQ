"use client";
import { useEffect, useState, useCallback } from "react";
import SidebarLayout from "@/components/SidebarLayout";
import { CalendarClock, PlusCircle, RefreshCw } from "lucide-react";
import { AddSubModal } from "@/components/Modals";

export default function Subscriptions() {
  const [subs, setSubs] = useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Wrap fetch in useCallback so we can pass it safely
  const fetchSubs = useCallback(async () => {
    const token = localStorage.getItem("expense_jwt");
    if (!token) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    try {
      const res = await fetch(`${apiUrl}/features/subscriptions`, { headers: { "Authorization": `Bearer ${token}` } });
      const data = await res.json();
      setSubs(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchSubs();
  }, [fetchSubs]);

  return (
    <SidebarLayout>
      <div className="border-b border-white/[0.06] pb-4 mb-6 flex justify-between items-end">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">Recurring Engine</h2>
          <p className="text-xs text-gray-400 mt-1">Automated background deduction pipelines.</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs py-2 px-4 rounded-lg flex gap-2 transition">
          <PlusCircle size={14}/> Add Schedule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subs.length > 0 ? subs.map((sub, i) => (
          <div key={i} className="bg-gray-900 border border-white/[0.06] rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center"><RefreshCw size={18} /></div>
              <span className="text-[10px] uppercase font-mono tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">Active</span>
            </div>
            <h3 className="font-heading font-bold text-lg text-gray-200">{sub.name}</h3>
            <p className="text-2xl font-bold text-white mt-2">₹{parseFloat(sub.amount).toFixed(2)} <span className="text-xs text-gray-500 font-sans font-normal">/ {sub.cycle}</span></p>
            <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-2 text-xs text-gray-400 font-mono">
              <CalendarClock size={14} className="text-purple-400" /> Next execution: {new Date(sub.next_date).toLocaleDateString()}
            </div>
          </div>
        )) : (
          <div className="col-span-full text-center text-gray-500 font-mono text-xs py-10">No recurring subscriptions detected in the ledger.</div>
        )}
      </div>

      <AddSubModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSuccess={() => { setIsAddOpen(false); fetchSubs(); }} />
    </SidebarLayout>
  );
}
