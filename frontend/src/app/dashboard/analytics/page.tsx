"use client";
import { useEffect, useState } from "react";
import SidebarLayout from "@/components/SidebarLayout";
import { PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FileDown, PieChart as PieIcon, Activity, FileText } from "lucide-react";

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];

export default function AnalyticsWorkspace() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("expense_jwt");
    if (!token) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    fetch(`${apiUrl}/transactions`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { setTransactions(data); setLoading(false); });
  }, []);

  // Calculate Data for Pie Chart (Expenses by Merchant/Category)
  const expenseData = transactions.filter(t => t.type === 'expense').reduce((acc, tx) => {
    const name = tx.merchant_name || 'General';
    const existing = acc.find((x: any) => x.name === name);
    if (existing) existing.value += parseFloat(tx.amount);
    else acc.push({ name, value: parseFloat(tx.amount) });
    return acc;
  }, []).sort((a: any, b: any) => b.value - a.value).slice(0, 6);

  // Corporate PDF Generation Engine
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text("ExpenseIQ Corporate Ledger", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Classification: CONFIDENTIAL`, 14, 35);

    // Filter to last 50 transactions for the report
    const reportData = transactions.slice(0, 50).map(tx => [
      new Date(tx.date).toLocaleDateString(),
      tx.merchant_name || 'System Entry',
      tx.type.toUpperCase(),
      `INR ${parseFloat(tx.amount).toFixed(2)}`,
      tx.notes || '-'
    ]);

    autoTable(doc, {
      startY: 45,
      head: [['Date', 'Merchant / Reason', 'Type', 'Amount', 'Metadata']],
      body: reportData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: { fontSize: 8, cellPadding: 3 }
    });

    doc.save(`ExpenseIQ_Audit_${new Date().getTime()}.pdf`);
  };

  if (loading) return <SidebarLayout><div className="text-gray-500 font-mono flex items-center justify-center pt-20">Compiling Analytics...</div></SidebarLayout>;

  return (
    <SidebarLayout>
      <div className="border-b border-white/[0.06] pb-4 mb-6 flex justify-between items-end">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">Deep Analytics</h2>
          <p className="text-xs text-gray-400 mt-1">Visual heatmaps and corporate report generation.</p>
        </div>
        <button onClick={generatePDF} className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-lg shadow-emerald-500/20">
          <FileDown size={14} /> Export PDF Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module A: Expenditure Pie Chart */}
        <div className="bg-gray-900 border border-white/[0.06] rounded-xl p-6 flex flex-col h-80">
          <h3 className="font-heading text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2"><PieIcon size={14} className="text-blue-500"/> Capital Distribution</h3>
          <div className="flex-1 w-full">
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {expenseData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#090D16', borderColor: '#1F2937', borderRadius: '8px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-gray-600 text-xs font-mono">Awaiting ledger data...</div>
            )}
          </div>
        </div>

        {/* Module B: Behavioral Radar Graph */}
        <div className="bg-gray-900 border border-white/[0.06] rounded-xl p-6 flex flex-col h-80">
          <h3 className="font-heading text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Activity size={14} className="text-purple-500"/> Spending Velocity Radar</h3>
          <div className="flex-1 w-full">
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={expenseData}>
                  <PolarGrid stroke="#1F2937" />
                  <PolarAngleAxis dataKey="name" stroke="#6B7280" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#4B5563" fontSize={10} />
                  <Radar name="Capital" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                  <Tooltip contentStyle={{ backgroundColor: '#090D16', borderColor: '#1F2937', borderRadius: '8px', fontSize: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
             ) : (
               <div className="h-full flex items-center justify-center text-gray-600 text-xs font-mono">Awaiting ledger data...</div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
