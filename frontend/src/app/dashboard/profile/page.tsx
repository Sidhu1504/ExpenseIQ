"use client";

import { useEffect, useState } from "react";
import SidebarLayout from "@/components/SidebarLayout";
import { User, Mail, ShieldCheck, Activity, ArrowUpRight, ArrowDownRight, Database } from "lucide-react";

export default function ProfileWorkspace() {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("expense_jwt");
    if (!token) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    fetch(`${apiUrl}/features/profile`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setProfileData(data);
      setLoading(false);
    })
    .catch(err => console.error(err));
  }, []);

  if (loading) return <SidebarLayout><div className="text-gray-500 font-mono">Decrypting profile matrix...</div></SidebarLayout>;

  return (
    <SidebarLayout>
      <div className="border-b border-white/[0.06] pb-4 mb-6">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-white">Operator Identity</h2>
        <p className="text-xs text-gray-400 mt-1">Secure ledger profile and lifetime income/expense statistics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-gray-900 border border-white/[0.06] rounded-xl p-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 p-1 shadow-lg shadow-blue-500/20 mb-4">
            <div className="w-full h-full bg-gray-950 rounded-full flex items-center justify-center text-3xl font-bold text-gray-200 uppercase">
              {profileData?.user?.name ? profileData.user.name.charAt(0) : "OP"}
            </div>
          </div>
          <h3 className="font-heading text-xl font-bold text-white">{profileData?.user?.name || "System Operator"}</h3>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400 mt-2">
            <Mail size={14} /> {profileData?.user?.email}
          </div>
          <div className="mt-6 w-full pt-6 border-t border-white/[0.06] flex justify-center gap-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] uppercase tracking-wider rounded-full font-mono">
              <ShieldCheck size={12} /> Role: {profileData?.user?.role || "User"}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase tracking-wider rounded-full font-mono">
              <Activity size={12} /> Node Active
            </span>
          </div>
        </div>

        {/* Ledger Lifetime Statistics */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-white/[0.06] rounded-xl p-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-gray-400 text-xs font-mono uppercase tracking-wider mb-2">
              <Database size={14} className="text-blue-500" /> Total Ledger Entries
            </div>
            <span className="text-4xl font-heading font-bold text-white">{profileData?.ledger_stats?.entries}</span>
            <p className="text-[10px] text-gray-500 mt-2 font-sans">Rows securely written to PostgreSQL</p>
          </div>

          <div className="bg-gray-900 border border-white/[0.06] rounded-xl p-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-gray-400 text-xs font-mono uppercase tracking-wider mb-2">
              <ArrowDownRight size={14} className="text-emerald-500" /> Lifetime Income
            </div>
            <span className="text-3xl font-heading font-bold text-emerald-400">₹{profileData?.ledger_stats?.income.toFixed(2)}</span>
            <p className="text-[10px] text-gray-500 mt-2 font-sans">Total cash flow positive metrics</p>
          </div>

          <div className="sm:col-span-2 bg-gray-900 border border-white/[0.06] rounded-xl p-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-gray-400 text-xs font-mono uppercase tracking-wider mb-2">
                <ArrowUpRight size={14} className="text-red-500" /> Lifetime Expenses
              </div>
              <span className="text-3xl font-heading font-bold text-red-400">₹{profileData?.ledger_stats?.expenses.toFixed(2)}</span>
            </div>
            <div className="h-16 w-16 rounded-full border-4 border-red-500/20 border-t-red-500 flex items-center justify-center animate-[spin_3s_linear_infinite]">
               <span className="text-xs text-red-400 font-mono rotate-90 absolute">OUT</span>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
