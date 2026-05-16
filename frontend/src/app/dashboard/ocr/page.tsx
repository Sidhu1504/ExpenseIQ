"use client";

import { useState } from "react";
import SidebarLayout from "@/components/SidebarLayout";
import { Receipt, Upload, Loader2, FileText, CheckCircle } from "lucide-react";

export default function OCRWorkspace() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

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
        alert(data.error || "OCR Extraction Dropped");
      }
    } catch (err) {
      console.error(err);
    } finally { // <-- FIXED TYPO HERE (double 'll')
      setLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="border-b border-white/[0.06] pb-4 mb-6">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-white">Receipt Matrix (OCR)</h2>
        <p className="text-xs text-gray-400 mt-1">Localized Tesseract engine processing image extraction arrays.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-gray-900 border border-white/[0.06] rounded-xl p-6">
          <h3 className="font-heading text-sm font-semibold text-gray-300 mb-4">Ingestion Console</h3>
          <form onSubmit={handleScan} className="space-y-4">
            <div className="border-2 border-dashed border-gray-800 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-950/50 hover:border-blue-500/40 transition cursor-pointer relative h-48">
              <input 
                type="file" accept="image/*" 
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="text-gray-500 mb-2" size={28} />
              <p className="text-xs font-mono text-gray-400 text-center px-2">
                {file ? file.name : "STAMP RECEIPT IMAGE GRID"}
              </p>
            </div>
            <button 
              type="submit" disabled={!file || loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white font-mono text-xs py-2.5 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={14} />}
              {loading ? "PARSING LOGIC CODES..." : "Execute Image Capture"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-gray-900 border border-white/[0.06] rounded-xl p-6">
          <h3 className="font-heading text-sm font-semibold text-gray-300 mb-4">Output Register</h3>
          {result ? (
            <div className="space-y-4 font-mono text-xs bg-gray-950 p-5 border border-white/[0.04] rounded-lg">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-heading font-semibold pb-2 border-b border-white/[0.06]">
                <CheckCircle size={16} /> Data Extraction Confirmed
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-gray-500 block">EXTRACTED VALUE</span>
                  <span className="text-base font-bold text-white">₹{result.amount || "0.00"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">TIMESTAMP RECORD</span>
                  <span className="text-white">{result.date || "Null"}</span>
                </div>
              </div>
              <div className="pt-2">
                <span className="text-gray-500 block mb-1">RAW TEXT STRING CAPTURE</span>
                <p className="text-[11px] text-gray-400 bg-black/40 p-3 rounded border border-white/[0.02] leading-relaxed max-h-32 overflow-y-auto">
                  {result.raw_text_snippet}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-48 border border-white/[0.04] bg-gray-950/20 rounded-xl flex flex-col items-center justify-center text-gray-600 font-mono text-xs">
              <FileText size={24} className="mb-2 opacity-40" />
              Awaiting payload execution pipeline...
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
