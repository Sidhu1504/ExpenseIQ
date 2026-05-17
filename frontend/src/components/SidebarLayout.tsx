"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutDashboard, Receipt, CreditCard, Sliders, 
  LogOut, Menu, X, Wallet, User, Settings, Users, CalendarClock, Target, HardDriveDownload
} from "lucide-react";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("System Operator");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("expense_jwt");
    if (!token && pathname !== "/") router.push("/");
  }, [pathname, router]);

  const navigationItems = [
    { label: "Overview Workspace", path: "/dashboard", icon: LayoutDashboard },
    { label: "Receipt Matrix", path: "/dashboard/ocr", icon: Receipt },
    { label: "Bulk CSV Import", path: "/dashboard/import", icon: HardDriveDownload },
    { label: "Split Expenses", path: "/dashboard/split", icon: Users },
    { label: "Sandbox Gateway", path: "/dashboard/gateway", icon: CreditCard },
    { label: "Automation Rules", path: "/dashboard/automation", icon: Sliders },
    { label: "Recurring Subs", path: "/dashboard/subscriptions", icon: CalendarClock },
    { label: "Savings Goals", path: "/dashboard/goals", icon: Target },
  ];

  const executeLogoutSequence = () => {
    localStorage.removeItem("expense_jwt");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-white flex font-sans">
      <header className="xl:hidden w-full h-16 bg-gray-900/60 backdrop-blur-md border-b border-white/[0.06] fixed top-0 left-0 px-4 flex items-center justify-between z-40">
        <div onClick={() => { router.push("/dashboard"); setIsOpen(false); }} className="flex items-center gap-2 cursor-pointer group">
          <Wallet className="text-blue-500 group-hover:text-blue-400 transition-colors" size={20} />
          <span className="font-heading font-bold text-sm tracking-tight group-hover:text-gray-200 transition-colors">EXPENSEIQ</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-400 hover:text-white">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900/40 backdrop-blur-xl border-r border-white/[0.06] p-6 flex flex-col justify-between transform transition-transform duration-300 ease-in-out xl:translate-x-0 xl:static xl:h-screen ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div onClick={() => { router.push("/dashboard"); setIsOpen(false); }} className="flex items-center gap-3 cursor-pointer group">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm group-hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20">₹</div>
              <span className="font-heading font-bold text-base tracking-tight text-white group-hover:text-gray-200 transition-colors">ExpenseIQ <span className="text-blue-500">Core</span></span>
            </div>
            <button onClick={() => setIsOpen(false)} className="xl:hidden p-1 text-gray-500 hover:text-white"><X size={18} /></button>
          </div>

          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <button key={item.path} onClick={() => { router.push(item.path); setIsOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-mono tracking-wide transition-all ${isActive ? "bg-blue-600/10 border border-blue-500/30 text-blue-400 font-semibold" : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.02] border border-transparent"}`}>
                  <Icon size={16} /><span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/[0.06] pt-4 flex flex-col gap-2">
          <div className="flex flex-col gap-1 mb-2">
            <button onClick={() => { router.push("/dashboard/profile"); setIsOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-mono tracking-wide transition-colors ${pathname === '/dashboard/profile' ? 'bg-white/[0.05] text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]'}`}>
              <User size={14} /> <span>Operator Profile</span>
            </button>
            <button onClick={() => { router.push("/dashboard/settings"); setIsOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-mono tracking-wide transition-colors ${pathname === '/dashboard/settings' ? 'bg-white/[0.05] text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]'}`}>
              <Settings size={14} /> <span>Ledger Settings</span>
            </button>
          </div>
          <div className="flex items-center gap-2.5 px-2 mb-2 bg-black/20 p-2 rounded-lg border border-white/[0.02]">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 p-[1px]"><div className="w-full h-full bg-gray-950 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-300">OP</div></div>
            <div className="truncate"><p className="text-xs font-medium text-gray-200 truncate">{userName}</p><p className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest">Node Active</p></div>
          </div>
          <button onClick={executeLogoutSequence} className="w-full flex items-center justify-center gap-2 bg-red-950/20 border border-red-500/20 hover:bg-red-950/40 text-red-400 font-mono text-[11px] py-2.5 rounded-lg transition">
            <LogOut size={14} /><span>[ Terminate Node ]</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 h-screen overflow-y-auto p-4 md:p-8 pt-20 xl:pt-8 custom-scrollbar">
        <div className="max-w-[1400px] mx-auto space-y-6">{children}</div>
      </main>
    </div>
  );
}
