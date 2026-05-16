"use client";

import { useState } from "react";
import SidebarLayout from "@/components/SidebarLayout";
import { CreditCard, ShieldAlert, Cpu } from "lucide-react";

export default function GatewayWorkspace() {
  const [payAmount, setPayAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  const handleWireProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || !recipient) return;

    try {
      const token = localStorage.getItem("expense_jwt");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      
      const res = await fetch(`${apiUrl}/features/pay`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ amount: parseFloat(payAmount), recipient })
      });
      
      const data = await res.json();
      if (res.ok) {
        const timestamp = new Date().toLocaleTimeString();
        let logMsg = `[${timestamp}] TRANSACTION ROUTED: ₹${payAmount} to ${recipient}`;
        if (data.system_alerts?.length > 0) {
          logMsg += ` -> ${data.system_alerts.join(" | ")}`;
        }
        setLogs(prev => [logMsg, ...prev]);
        setPayAmount("");
        setRecipient("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SidebarLayout>
      <div className="border-b border-white/[0.06] pb-4 mb-6">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-white">Sandbox Gateway Console</h2>
        <p className="text-xs text-gray-400 mt-1">Isolated simulation framework analyzing mock payload spikes and threshold violations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wire Form Panel */}
        <div className="bg-gray-900 border border-white/[0.06] rounded-xl p-6">
          <h3 className="font-heading text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <CreditCard size={16} className="text-blue-500" /> Payment Controller
          </h3>
          <form onSubmit={handleWireProcess} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-500 mb-1 font-mono uppercase tracking-wider">Target Acquirer Profile</label>
              <input 
                type="text" required value={recipient} onChange={(e) => setRecipient(e.target.value)} 
                className="w-full bg-gray-950 border border-white/[0.08] rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500" 
                placeholder="e.g. Vercel Enterprise Deployment" 
              />
            </div>
            <div>
              <label className="block text-gray-500 mb-1 font-mono uppercase tracking-wider">Routing Quantity (INR)</label>
              <input 
                type="number" required value={payAmount} onChange={(e) => setPayAmount(e.target.value)} 
                className="w-full bg-gray-950 border border-white/[0.08] rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-blue-500" 
                placeholder="0.00" 
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold py-2.5 rounded-lg transition mt-2">
              Authorize Local Settlement Loop
            </button>
          </form>
        </div>

        {/* Real-time Logger Terminal */}
        <div className="lg:col-span-2 bg-gray-900 border border-white/[0.06] rounded-xl p-6 flex flex-col h-[24rem]">
          <h3 className="font-heading text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Cpu size={16} className="text-purple-400" /> Pipeline Console Stream
          </h3>
          <div className="flex-1 bg-gray-950 border border-white/[0.04] rounded-lg p-4 font-mono text-[11px] text-gray-400 space-y-2 overflow-y-auto custom-scrollbar">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="border-b border-white/[0.02] pb-1 last:border-0">
                  <span className="text-blue-500">➜</span> {log}
                </div>
              ))
            ) : (
              <div className="text-gray-600 text-center pt-24">Terminal context idle. Awaiting authorization signatures...</div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
