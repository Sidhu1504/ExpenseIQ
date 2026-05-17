"use client";
import { useEffect, useState } from "react";
import SidebarLayout from "@/components/SidebarLayout";
import { User, Mail, ShieldCheck, Activity, ArrowUpRight, ArrowDownRight, Database, ShieldAlert, MonitorSmartphone } from "lucide-react";

export default function ProfileWorkspace() {
  const [profileData, setProfileData] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("expense_jwt");
    if (!token) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    
    // Fetch Profile
    fetch(`${apiUrl}/features/profile`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(res => res.json()).then(data => setProfileData(data));
      
    // Fetch Audit Logs (WITH DEFENSIVE PROGRAMMING)
    fetch(`${apiUrl}/features/audit/logs`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { 
        // Force it to be an array even if the backend sends an error object
        setAuditLogs(Array.isArray(data) ? data : []); 
        setLoading(false); 
      })
      .catch(() => {
        setAuditLogs([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <SidebarLayout><div className="text-gray-500 font-mono flex h-full items-center justify-center pt-20">Decrypting security matrix...</div></SidebarLayout>;

  return (
    <SidebarLayout>
      <div className="border-b border-white/[0.06] pb-4 mb-6 flex justify-between items-end">
        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-white">Operator Identity</h2>
          <p className="text-xs text-gray-400 mt-1">Secure ledger profile and session audit history.</p>
        </div>
        <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="bg-red-950/40 border border-red-500/30 text-red-400 font-mono text-[10px] uppercase tracking-wider px-4 py-2 rounded hover:bg-red-900/60 transition">
          Terminate All Active Sessions
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-white/[0.06] rounded-xl p-6 flex flex-col items-center text-center h-fit">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 p-1 shadow-lg shadow-blue-500/20 mb-4">
            <div className="w-full h-full bg-gray-950 rounded-full flex items-center justify-center text-3xl font-bold text-gray-200 uppercase">
              {profileData?.user?.name ? profileData.user.name.charAt(0) : "OP"}
            </div>
          </div>
          <h3 className="font-heading text-xl font-bold text-white">{profileData?.user?.name || "System Operator"}</h3>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400 mt-2"><Mail size={14} /> {profileData?.user?.email}</div>
          <div className="mt-6 w-full pt-6 border-t border-white/[0.06] flex justify-center gap-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] uppercase tracking-wider rounded-full font-mono"><ShieldCheck size={12} /> Role: {profileData?.user?.role || "User"}</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase tracking-wider rounded-full font-mono"><Activity size={12} /> Node Active</span>
          </div>
        </div>

        <div className="lg:col-span-2 bg-gray-900 border border-white/[0.06] rounded-xl p-6 flex flex-col h-[28rem]">
          <h3 className="font-heading text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2"><ShieldAlert size={14} className="text-purple-500"/> Security Audit & Session Logs</h3>
          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
            {auditLogs.length > 0 ? auditLogs.map((log, i) => (
              <div key={i} className="bg-gray-950 border border-white/[0.04] p-3 rounded-lg flex flex-col gap-1.5 hover:border-white/[0.1] transition">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-blue-400">{log.action}</span>
                  <span className="text-[10px] text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
                </div>
                <div className="flex gap-4 text-[10px] font-mono text-gray-500 border-t border-white/[0.02] pt-1.5 mt-1">
                  <span className="flex items-center gap-1"><MonitorSmartphone size={10}/> Device: {log.device?.substring(0,30) || "Unknown"}...</span>
                  <span>IP: {log.ip_address || "Hidden"}</span>
                </div>
              </div>
            )) : (
              <div className="text-center font-mono text-xs text-gray-600 pt-10">No audit logs found. Awaiting database ingestion.</div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
