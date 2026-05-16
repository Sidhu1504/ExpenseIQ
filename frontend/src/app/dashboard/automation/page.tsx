"use client";

import { useState, useEffect } from "react";
import SidebarLayout from "@/components/SidebarLayout";
import { Sliders, PlusCircle, CheckCircle, HelpCircle, Loader2 } from "lucide-react";

export default function AutomationWorkspace() {
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);

  // Fetch an existing category UUID to make linking easy for the user
  useEffect(() => {
    const token = localStorage.getItem("expense_jwt");
    if (!token) return;
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    fetch(`${apiUrl}/transactions`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setTransactions(data);
      // Auto-select the first available category UUID from seeded data if it exists
      const fallbackCat = data.find((t: any) => t.category_id)?.category_id;
      if (fallbackCat) setCategoryId(fallbackCat);
    })
    .catch(err => console.error(err));
  }, []);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword || !categoryId) return;
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("expense_jwt");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

      const res = await fetch(`${apiUrl}/rules`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyword: keyword.toLowerCase(),
          assign_category_id: categoryId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Success: Keyword "${keyword}" is now actively bound to your category.`);
        setKeyword("");
      } else {
        setMessage(`Error: ${data.error || "Failed to compile rule configuration."}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("Error: Network connection dropped.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout>
      {/* Page Header */}
      <div className="border-b border-white/[0.06] pb-4 mb-6">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-white">Automation Rules Configuration</h2>
        <p className="text-xs text-gray-400 mt-1">Define deterministic string-matching keyword metrics to auto-categorize incoming transactions without external APIs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rule Builder Form Panel */}
        <div className="bg-gray-900 border border-white/[0.06] rounded-xl p-6">
          <h3 className="font-heading text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <PlusCircle size={16} className="text-blue-500" /> Append Matching Protocol
          </h3>
          
          <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-500 mb-1 font-mono uppercase tracking-wider">TARGET KEYWORD (LOWERCASE)</label>
              <input 
                type="text" required value={keyword} onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-gray-950 border border-white/[0.08] rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                placeholder="e.g. zomato, swiggy, ola"
              />
            </div>

            <div>
              <label className="block text-gray-500 mb-1 font-mono uppercase tracking-wider">TARGET CATEGORY RESOLUTION UUID</label>
              <input 
                type="text" required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-gray-950 border border-white/[0.08] rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                placeholder="Paste category-uuid"
              />
              <p className="text-[10px] text-gray-600 mt-1 font-sans">
                {transactions.length > 0 ? "💡 Auto-detected active category UUID from your ledger history." : "Awaiting database history feed..."}
              </p>
            </div>

            <button 
              type="submit" disabled={loading || !categoryId}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold py-2.5 rounded-lg transition mt-2 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={14} />}
              <span>Commit Rule to Engine</span>
            </button>
          </form>
        </div>

        {/* Status Console Monitor Panel */}
        <div className="lg:col-span-2 bg-gray-900 border border-white/[0.06] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-heading text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <Sliders size={16} className="text-purple-400" /> Active Policy Engine Monitor
            </h3>
            
            {message ? (
              <div className={`p-4 rounded-lg border font-mono text-xs ${message.startsWith("Error") ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"}`}>
                {message}
              </div>
            ) : (
              <div className="bg-gray-950/50 border border-white/[0.04] rounded-xl p-6 text-center text-gray-600 font-mono text-xs">
                Awaiting rule input signatures. Local string matcher daemon is operational and hovering over current database indices.
              </div>
            )}
          </div>

          {/* Quick Informational Use Case Footer Card */}
          <div className="bg-gray-950 p-4 border border-white/[0.04] rounded-xl flex gap-3 text-xs text-gray-400 mt-6">
            <HelpCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
            <p className="font-sans leading-relaxed">
              <strong className="text-gray-300">How this works:</strong> When you execute a receipt scan or manual transaction without picking a category, the system runs a text-search loop. If it finds your keyword anywhere inside the vendor description or notes, it maps the record instantly.
            </p>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
