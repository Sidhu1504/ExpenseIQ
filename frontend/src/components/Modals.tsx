"use client";

import { useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ScanModal({ isOpen, onClose, onSuccess }: ModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("receipt", file);

    try {
      const token = localStorage.getItem("expense_jwt");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      
      const res = await fetch(`${apiUrl}/ocr/scan`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data.extracted_data);
      } else {
        alert(data.error || "OCR Failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommitTransaction = async () => {
    if (!result) return;
    try {
      const token = localStorage.getItem("expense_jwt");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

      const res = await fetch(`${apiUrl}/transactions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: result.amount,
          type: "expense",
          merchant_name: "OCR Extracted Merchant",
          date: new Date().toISOString(),
          notes: `Parsed text snippet: ${result.raw_text_snippet.substring(0, 50)}`,
          category_id: result.suggested_category_id,
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
        setResult(null);
        setFile(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-md w-full p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-gray-300">
          <X size={20} />
        </button>
        <h3 className="font-heading text-xl font-bold mb-4 text-white">Local OCR Processing</h3>

        {!result ? (
          <form onSubmit={handleScan} className="space-y-4">
            <div className="border-2 border-dashed border-gray-800 rounded-lg p-8 flex flex-col items-center justify-center bg-gray-950 hover:border-gray-700 transition cursor-pointer relative">
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="text-gray-500 mb-2" size={32} />
              <p className="text-xs font-mono text-gray-400">
                {file ? file.name : "DRAG & DROP RECEIPT IMAGE"}
              </p>
            </div>
            <button 
              type="submit" 
              disabled={!file || loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white font-medium py-2 rounded transition flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={16} />}
              {loading ? "Analyzing Matrix..." : "Execute Scan"}
            </button>
          </form>
        ) : (
          <div className="space-y-4 font-mono text-sm bg-gray-950 p-4 border border-gray-800 rounded">
            <p className="text-gray-400 uppercase text-xs tracking-wider">Extraction Matrix Matrix</p>
            <div className="text-gray-200">Amount Found: <span className="text-green-400">₹{result.amount}</span></div>
            <div className="text-gray-200">Date Logged: <span className="text-blue-400">{result.date}</span></div>
            <div className="text-gray-200">Rule Match: <span className="text-purple-400">{result.suggested_category_id ? "MATCHED" : "DEFAULT"}</span></div>
            <button 
              onClick={handleCommitTransaction}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-medium py-2 rounded font-sans transition mt-4"
            >
              Commit to Ledger
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function AddModal({ isOpen, onClose, onSuccess }: ModalProps) {
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [type, setType] = useState("expense");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("expense_jwt");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

      const res = await fetch(`${apiUrl}/transactions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          type,
          merchant_name: merchant,
          date: new Date().toISOString(),
          notes: "Manual standard interface entry",
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
        setAmount("");
        setMerchant("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-md w-full p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-gray-300">
          <X size={20} />
        </button>
        <h3 className="font-heading text-xl font-bold mb-4 text-white">Manual Ledger Entry</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">VALUE (INR)</label>
            <input 
              type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-white font-mono"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">MERCHANT NAME</label>
            <input 
              type="text" required value={merchant} onChange={(e) => setMerchant(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-white"
              placeholder="e.g., Apple Store"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">ENTRY TYPE</label>
            <select 
              value={type} onChange={(e) => setType(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded px-3 py-2 text-white font-mono"
            >
              <option value="expense">EXPENSE (-)</option>
              <option value="income">INCOME (+)</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded transition mt-2">
            Append Entry
          </button>
        </form>
      </div>
    </div>
  );
}

export function AddSubModal({ isOpen, onClose, onSuccess }: ModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [cycle, setCycle] = useState("Monthly");
  const [nextDate, setNextDate] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("expense_jwt");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const res = await fetch(`${apiUrl}/features/subscriptions`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name, amount: parseFloat(amount), cycle, next_date: nextDate }),
      });
      if (res.ok) { onSuccess(); onClose(); }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-white/[0.08] rounded-xl max-w-md w-full p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-gray-300"><X size={20} /></button>
        <h3 className="font-heading text-lg font-bold mb-4 text-white">Define Recurring Schedule</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><label className="text-[10px] font-mono text-gray-400">SERVICE NAME</label><input type="text" required onChange={(e)=>setName(e.target.value)} className="w-full bg-gray-950 border border-white/[0.06] rounded p-2 text-white text-sm" placeholder="e.g. Netflix" /></div>
          <div><label className="text-[10px] font-mono text-gray-400">AMOUNT (INR)</label><input type="number" required onChange={(e)=>setAmount(e.target.value)} className="w-full bg-gray-950 border border-white/[0.06] rounded p-2 text-white text-sm font-mono" placeholder="0.00" /></div>
          <div><label className="text-[10px] font-mono text-gray-400">BILLING CYCLE</label><select onChange={(e)=>setCycle(e.target.value)} className="w-full bg-gray-950 border border-white/[0.06] rounded p-2 text-white text-sm"><option>Monthly</option><option>Yearly</option></select></div>
          <div><label className="text-[10px] font-mono text-gray-400">NEXT DEDUCTION DATE</label><input type="date" required onChange={(e)=>setNextDate(e.target.value)} className="w-full bg-gray-950 border border-white/[0.06] rounded p-2 text-white text-sm font-mono" /></div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded transition mt-4">Append to Engine</button>
        </form>
      </div>
    </div>
  );
}

export function AddGoalModal({ isOpen, onClose, onSuccess }: ModalProps) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("expense_jwt");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const res = await fetch(`${apiUrl}/features/goals`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name, target_amount: parseFloat(target), current_amount: 0, deadline }),
      });
      if (res.ok) { onSuccess(); onClose(); }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-white/[0.08] rounded-xl max-w-md w-full p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-gray-300"><X size={20} /></button>
        <h3 className="font-heading text-lg font-bold mb-4 text-white">Initialize Savings Matrix</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><label className="text-[10px] font-mono text-gray-400">TARGET NAME</label><input type="text" required onChange={(e)=>setName(e.target.value)} className="w-full bg-gray-950 border border-white/[0.06] rounded p-2 text-white text-sm" placeholder="e.g. MacBook Pro" /></div>
          <div><label className="text-[10px] font-mono text-gray-400">TARGET CAPITAL (INR)</label><input type="number" required onChange={(e)=>setTarget(e.target.value)} className="w-full bg-gray-950 border border-white/[0.06] rounded p-2 text-white text-sm font-mono" placeholder="0.00" /></div>
          <div><label className="text-[10px] font-mono text-gray-400">DEADLINE</label><input type="date" required onChange={(e)=>setDeadline(e.target.value)} className="w-full bg-gray-950 border border-white/[0.06] rounded p-2 text-white text-sm font-mono" /></div>
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded transition mt-4">Deploy Target</button>
        </form>
      </div>
    </div>
  );
}
