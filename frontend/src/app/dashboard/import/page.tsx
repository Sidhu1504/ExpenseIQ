"use client";
import { useState } from "react";
import SidebarLayout from "@/components/SidebarLayout";
import Papa from "papaparse";
import { HardDriveDownload, FileSpreadsheet, Loader2, CheckCircle2 } from "lucide-react";

export default function BulkImportWorkspace() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        // Map raw CSV to our schema (Expects columns: Date, Merchant, Amount, Type)
        const mapped = results.data.map((row: any) => ({
          date: row.Date || new Date().toISOString().split('T')[0],
          merchant: row.Merchant || row.Description || "Unknown Merchant",
          amount: row.Amount || row.Value || 0,
          type: row.Type || (parseFloat(row.Amount) > 0 ? "income" : "expense"),
          notes: "CSV Import"
        })).filter(tx => tx.amount !== 0);
        setData(mapped);
      },
    });
  };

  const executeBulkInsert = async () => {
    if (data.length === 0) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("expense_jwt");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const res = await fetch(`${apiUrl}/features/import/bulk`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: data })
      });
      if (res.ok) {
        setSuccess(`Successfully wrote ${data.length} rows to PostgreSQL Ledger.`);
        setData([]);
      }
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  return (
    <SidebarLayout>
      <div className="border-b border-white/[0.06] pb-4 mb-6">
        <h2 className="font-heading text-2xl font-bold text-white">Data Ingestion Engine</h2>
        <p className="text-xs text-gray-400 mt-1">Upload banking CSV files to write hundreds of transactions into your ledger instantly.</p>
      </div>

      <div className="bg-gray-900 border border-white/[0.06] rounded-xl p-8 mb-6 flex flex-col items-center justify-center border-dashed border-2 hover:border-blue-500/50 transition">
        <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="csv-upload" />
        <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
          <FileSpreadsheet size={40} className="text-blue-500 mb-4" />
          <span className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs py-2 px-4 rounded-lg transition">Select CSV File</span>
          <span className="text-xs text-gray-500 mt-3 font-mono">Requires Columns: Date, Merchant, Amount, Type</span>
        </label>
      </div>

      {success && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm font-mono flex items-center gap-2 mb-6"><CheckCircle2 size={16}/> {success}</div>}

      {data.length > 0 && (
        <div className="bg-gray-900 border border-white/[0.06] rounded-xl p-6">
          <div className="flex justify-between items-center mb-4 border-b border-white/[0.06] pb-4">
            <h3 className="font-heading text-sm font-semibold text-gray-300">Staged Payload Preview ({data.length} rows)</h3>
            <button onClick={executeBulkInsert} disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs px-4 py-2 rounded-lg flex items-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={14} /> : <HardDriveDownload size={14} />} Execute Database Write
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2">
            {data.slice(0, 10).map((row, i) => (
              <div key={i} className="flex justify-between bg-gray-950 p-2 border border-white/[0.04] rounded text-xs font-mono text-gray-400">
                <span>{row.date} | {row.merchant}</span>
                <span className={row.type === 'expense' ? 'text-red-400' : 'text-emerald-400'}>{row.type === 'expense' ? '-' : '+'}₹{Math.abs(row.amount)}</span>
              </div>
            ))}
            {data.length > 10 && <div className="text-center text-xs text-gray-600 pt-2 font-mono">... and {data.length - 10} more rows</div>}
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
