"use client";
import { useEffect, useState, useCallback } from "react";
import SidebarLayout from "@/components/SidebarLayout";
import { Target, PlusCircle, Flag } from "lucide-react";
import { AddGoalModal } from "@/components/Modals";

export default function SavingsGoals() {
  const [goals, setGoals] = useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const fetchGoals = useCallback(async () => {
    const token = localStorage.getItem("expense_jwt");
    if (!token) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    try {
      const res = await fetch(`${apiUrl}/features/goals`, { headers: { "Authorization": `Bearer ${token}` } });
      const data = await res.json();
      setGoals(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return (
    <SidebarLayout>
      <div className="border-b border-white/[0.06] pb-4 mb-6 flex justify-between items-end">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">Savings Matrix</h2>
          <p className="text-xs text-gray-400 mt-1">Track capital accumulation targets via visual progress metrics.</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs py-2 px-4 rounded-lg flex gap-2 transition">
          <PlusCircle size={14}/> Define Target
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.length > 0 ? goals.map((goal, i) => {
          const percentage = Math.min((parseFloat(goal.current_amount) / parseFloat(goal.target_amount)) * 100, 100);
          return (
            <div key={i} className="bg-gray-900 border border-white/[0.06] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="text-emerald-500" size={20} />
                <h3 className="font-heading font-bold text-base text-gray-200">{goal.name}</h3>
              </div>
              <div className="flex justify-between items-end mb-2">
                <p className="text-2xl font-bold text-white">₹{parseFloat(goal.current_amount).toLocaleString()}</p>
                <p className="text-xs font-mono text-gray-500">Target: ₹{parseFloat(goal.target_amount).toLocaleString()}</p>
              </div>
              
              <div className="w-full h-2 bg-gray-950 rounded-full overflow-hidden border border-white/[0.04]">
                <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/[0.06] flex justify-between items-center text-[10px] text-gray-400 font-mono">
                <span className="flex items-center gap-1"><Flag size={12} className="text-blue-400"/> Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                <span className="text-emerald-400">{percentage.toFixed(1)}% Achieved</span>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full text-center text-gray-500 font-mono text-xs py-10">No active savings targets defined in the system.</div>
        )}
      </div>

      <AddGoalModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSuccess={() => { setIsAddOpen(false); fetchGoals(); }} />
    </SidebarLayout>
  );
}
