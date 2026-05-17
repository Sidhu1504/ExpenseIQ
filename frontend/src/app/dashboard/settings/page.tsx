"use client";
import { useState } from "react";
import SidebarLayout from "@/components/SidebarLayout";
import { Users, Mail, CheckCircle2, ShieldAlert, Key } from "lucide-react";

export default function LedgerSettings() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });

  const handleShareWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setMessage({ text: "", isError: false });

    try {
      const token = localStorage.getItem("expense_jwt");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const res = await fetch(`${apiUrl}/features/wallets/share`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: data.message, isError: false });
        setEmail("");
      } else {
        setMessage({ text: data.error, isError: true });
      }
    } catch (err) {
      setMessage({ text: "Gateway offline.", isError: true });
    } finally { setLoading(false); }
  };

  return (
    <SidebarLayout>
      <div className="border-b border-white/[0.06] pb-4 mb-6">
        <h2 className="font-heading text-2xl font-bold text-white">Ledger Configuration</h2>
        <p className="text-xs text-gray-400 mt-1">Manage database permissions and multi-tenant access.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Module A: Multi-Tenant Access */}
        <div className="bg-gray-900 border border-white/[0.06] rounded-xl p-6 h-fit">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center"><Users size={20} /></div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white">Multi-Tenant Access</h3>
              <p className="text-[11px] font-mono text-gray-500">Invite trusted nodes (Family/Partners) to your ledger.</p>
            </div>
          </div>
          
          <div className="mt-6">
            <form onSubmit={handleShareWallet} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Registered Node Email</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><Mail size={14} /></span>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-950 border border-white/[0.08] rounded-lg pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all" placeholder="partner@system.local" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full h-10 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white text-xs font-medium rounded-lg shadow-md transition-all flex items-center justify-center gap-2">
                {loading ? "Establishing Link..." : "Grant Ledger Access"}
              </button>
            </form>

            {message.text && (
              <div className={`mt-4 p-3 rounded-lg border text-xs font-sans flex items-start gap-2 ${message.isError ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"}`}>
                {message.isError ? <ShieldAlert size={14} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={14} className="shrink-0 mt-0.5" />}
                <span>{message.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* Module B: Data Sovereignty */}
        <div className="bg-gray-900 border border-white/[0.06] rounded-xl p-6 h-fit">
           <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><Key size={20} /></div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white">Data Sovereignty</h3>
              <p className="text-[11px] font-mono text-gray-500">Your ledger is encrypted via PostgreSQL 18.</p>
            </div>
          </div>
          <div className="mt-6 text-xs text-gray-400 font-mono space-y-2 border-t border-white/[0.04] pt-4">
            <p>• Database Sync: Active</p>
            <p>• Encryption: AES-256 (At Rest)</p>
            <p>• Local OCR Parsing: Enabled</p>
            <p className="text-emerald-500 pt-2 text-[10px]">All data remains strictly within your isolated container network.</p>
          </div>
        </div>

      </div>
    </SidebarLayout>
  );
}
