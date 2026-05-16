"use client";

import { useState, useEffect } from "react";
import SidebarLayout from "@/components/SidebarLayout";
import { Sun, Moon, Monitor, Bell, Shield, Wallet } from "lucide-react";

export default function SettingsWorkspace() {
  const [theme, setTheme] = useState("dark");
  const [currency, setCurrency] = useState("INR");
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  // Load saved preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem("expense_theme") || "dark";
    setTheme(savedTheme);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("expense_theme", newTheme);
    alert(`Theme preference saved to local storage: ${newTheme.toUpperCase()}.\n\n(Note: Full Light Mode requires a global CSS variable refactor, currently running in Enterprise Dark mode for optimal eye-care).`);
  };

  return (
    <SidebarLayout>
      <div className="border-b border-white/[0.06] pb-4 mb-6">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-white">System Configuration</h2>
        <p className="text-xs text-gray-400 mt-1">Manage UI layout preferences, ledger tracking variables, and security alerts.</p>
      </div>

      <div className="max-w-3xl space-y-6">
        
        {/* Interface Theme Settings */}
        <section className="bg-gray-900 border border-white/[0.06] rounded-xl p-6">
          <h3 className="font-heading text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Monitor size={16} className="text-blue-500" /> Interface Appearance
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <button 
              onClick={() => handleThemeChange("dark")}
              className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${theme === 'dark' ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-gray-950 border-white/[0.06] text-gray-400 hover:border-gray-600'}`}
            >
              <Moon size={20} /> <span className="text-xs font-mono">Enterprise Dark</span>
            </button>
            <button 
              onClick={() => handleThemeChange("light")}
              className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${theme === 'light' ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-gray-950 border-white/[0.06] text-gray-400 hover:border-gray-600'}`}
            >
              <Sun size={20} /> <span className="text-xs font-mono">Daylight Mode</span>
            </button>
            <button 
              onClick={() => handleThemeChange("system")}
              className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${theme === 'system' ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-gray-950 border-white/[0.06] text-gray-400 hover:border-gray-600'}`}
            >
              <Monitor size={20} /> <span className="text-xs font-mono">System Sync</span>
            </button>
          </div>
        </section>

        {/* Ledger Preferences */}
        <section className="bg-gray-900 border border-white/[0.06] rounded-xl p-6">
          <h3 className="font-heading text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Wallet size={16} className="text-emerald-500" /> Income/Expense Ledger Config
          </h3>
          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-gray-500 mb-1 font-mono text-[10px] uppercase">Base Currency Tracker</label>
              <select 
                value={currency} onChange={(e) => setCurrency(e.target.value)}
                className="w-full sm:w-64 bg-gray-950 border border-white/[0.08] rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
              >
                <option value="INR">₹ INR - Indian Rupee</option>
                <option value="USD">$ USD - US Dollar</option>
                <option value="EUR">€ EUR - Euro</option>
              </select>
            </div>
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-gray-950 border-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900" />
                <span className="text-gray-300 text-xs">Enable Smart Keyword Auto-Categorization</span>
              </label>
            </div>
          </div>
        </section>

        {/* Notification & Alerts */}
        <section className="bg-gray-900 border border-white/[0.06] rounded-xl p-6">
          <h3 className="font-heading text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Bell size={16} className="text-purple-500" /> System Alerts & Thresholds
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-950 border border-white/[0.04] rounded-lg hover:border-white/[0.1] transition">
              <div>
                <p className="text-sm text-gray-200 font-medium">Budget Breach Alerts</p>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5">Notify when category spending exceeds 80% limit</p>
              </div>
              <input 
                type="checkbox" 
                checked={alertsEnabled} 
                onChange={() => setAlertsEnabled(!alertsEnabled)}
                className="w-8 h-4 bg-gray-700 rounded-full appearance-none checked:bg-blue-500 relative transition-colors cursor-pointer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-transform checked:after:translate-x-4" 
              />
            </label>
          </div>
        </section>

      </div>
    </SidebarLayout>
  );
}
