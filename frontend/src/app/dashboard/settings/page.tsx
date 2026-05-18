"use client";

import { useState } from "react";
import SidebarLayout from "@/components/SidebarLayout";
import { Users, ShieldCheck, Palette, Coins, Moon, Sun, Monitor } from "lucide-react";

export default function SettingsPage() {
  const [theme, setTheme] = useState("dark");
  const [currency, setCurrency] = useState("INR");
  const [inviteEmail, setInviteEmail] = useState("");

  const handleSavePreferences = () => {
    // Stores preferences locally for the frontend context layer
    localStorage.setItem("app_theme", theme);
    localStorage.setItem("app_currency", currency);
    // You can hook this up to a toast notification or backend API later
    alert("Global preferences updated successfully!");
  };

  return (
    <SidebarLayout>
      <div className="border-b border-white/[0.06] pb-5 mb-8">
        <h2 className="font-heading text-2xl font-bold text-white">Ledger Configuration</h2>
        <p className="text-xs text-gray-400 mt-1 font-mono">Manage database permissions, multi-tenant access, and global display preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* NEW: Workspace Theme Configuration */}
        <div className="bg-[#0a0d14] border border-white/[0.06] rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Palette size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-200">Workspace Theme</h3>
              <p className="text-xs text-gray-500">Customize your visual interface engine.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-auto">
            <button onClick={() => setTheme("dark")} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${theme === 'dark' ? 'bg-purple-500/10 border-purple-500/50 text-purple-400 shadow-inner' : 'border-white/[0.05] text-gray-400 hover:bg-white/[0.02]'}`}>
              <Moon size={18} className="mb-2" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Dark</span>
            </button>
            <button onClick={() => setTheme("light")} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${theme === 'light' ? 'bg-purple-500/10 border-purple-500/50 text-purple-400 shadow-inner' : 'border-white/[0.05] text-gray-400 hover:bg-white/[0.02]'}`}>
              <Sun size={18} className="mb-2" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Light</span>
            </button>
            <button onClick={() => setTheme("system")} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${theme === 'system' ? 'bg-purple-500/10 border-purple-500/50 text-purple-400 shadow-inner' : 'border-white/[0.05] text-gray-400 hover:bg-white/[0.02]'}`}>
              <Monitor size={18} className="mb-2" />
              <span className="text-[10px] font-bold uppercase tracking-wider">System</span>
            </button>
          </div>
        </div>

        {/* NEW: Base Currency Configuration */}
        <div className="bg-[#0a0d14] border border-white/[0.06] rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Coins size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-200">Base Currency</h3>
              <p className="text-xs text-gray-500">Set the default fiat metric for ledger calculations.</p>
            </div>
          </div>
          <div className="mt-auto">
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full bg-[#070a12] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 cursor-pointer transition-all">
              <option value="INR">₹ Indian Rupee (INR)</option>
              <option value="USD">$ US Dollar (USD)</option>
              <option value="EUR">€ Euro (EUR)</option>
              <option value="GBP">£ British Pound (GBP)</option>
            </select>
            <button onClick={handleSavePreferences} className="w-full mt-4 bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 text-xs font-bold py-3 rounded-xl transition-all">
              Save Display Preferences
            </button>
          </div>
        </div>

        {/* EXISTING: Multi-Tenant Access */}
        <div className="bg-[#0a0d14] border border-white/[0.06] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-400">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-200">Multi-Tenant Access</h3>
              <p className="text-xs text-gray-500">Invite trusted nodes (Family/Partners) to your ledger.</p>
            </div>
          </div>
          <div className="mt-4">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-semibold">Registered Node Email</label>
            <input type="email" placeholder="partner@system.local" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-full mt-1.5 bg-[#070a12] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all" />
            <button className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20">
              Grant Ledger Access
            </button>
          </div>
        </div>

        {/* EXISTING: Data Sovereignty */}
        <div className="bg-[#0a0d14] border border-white/[0.06] rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-200">Data Sovereignty</h3>
              <p className="text-xs text-gray-500">Your ledger is encrypted via PostgreSQL 18.</p>
            </div>
          </div>
          <div className="mt-4 space-y-3 text-xs text-gray-400 font-mono">
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> Database Sync: Active</div>
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> Encryption: AES-256 (At Rest)</div>
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> Local OCR Parsing: Enabled</div>
          </div>
          <div className="mt-auto pt-6">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] text-emerald-400 font-bold tracking-wide uppercase text-center">
              All data remains strictly within your isolated container network.
            </div>
          </div>
        </div>

      </div>
    </SidebarLayout>
  );
}
