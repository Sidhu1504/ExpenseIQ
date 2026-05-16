"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Wallet, Shield, BellRing, Sparkles, Receipt, CalendarClock,
  ArrowRight, Lock, Mail, User, X, ShieldCheck, Heart,
  Briefcase, TrendingUp, HelpCircle, MapPin, Phone, Terminal
} from "lucide-react";

export default function LuxuryLandingPortal() {
  const router = useRouter();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMsg, setStatusMsg] = useState({ text: "", isError: false });
  const [loading, setLoading] = useState(false);

  const handleAuthSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg({ text: "", isError: false });
    setLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const targetEndpoint = isLogin ? "/auth/login" : "/auth/register";
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(`${apiUrl}${targetEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "The gateway rejected the access request.");

      if (isLogin) {
        localStorage.setItem("expense_jwt", data.token);
        setIsAuthOpen(false);
        router.push("/dashboard");
      } else {
        setStatusMsg({ text: "Identity recorded safely into PostgreSQL. Switching channels...", isError: false });
        setTimeout(() => {
          setIsLogin(true);
          setName("");
          setStatusMsg({ text: "", isError: false });
        }, 1500);
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message, isError: true });
    } finally {
      setLoading(false);
    }
  };

  const userBenefits = [
    {
      icon: Receipt,
      title: "Snap & Log Receipt Scanner",
      desc: "Stop typing expenses manually. Take a picture of your dinner bill or grocery receipt, and our local engine reads the shop name, date, and final price automatically using zero-fee local OCR processing channels."
    },
    {
      icon: BellRing,
      title: "Smart Budget Overspending Shield",
      desc: "Set monthly spending boundaries for food, travel, or clothes. The system tracks your ledger in real-time and alerts you instantly before you accidentally break your savings strategy."
    },
    {
      icon: CalendarClock,
      title: "Subscription & Bill Tracker",
      desc: "Never pay for an app or gym membership you forgot about. Track streaming trials, monthly utilities, and recurring cash cycles effortlessly from one clean, automated calendar matrix grid."
    }
  ];

  const appUseCases = [
    {
      icon: User,
      title: "Personal Cash Automation",
      detail: "Perfect for students and working professionals aiming to master daily savings. Split costs across lifestyle tags like groceries, dining, and gym memberships."
    },
    {
      icon: Briefcase,
      title: "Corporate Travel & Expense Management",
      detail: "Compile scanned receipts, tax configurations, and business travel allocations into instant structured tables ready for accounting submission."
    },
    {
      icon: TrendingUp,
      title: "Freelancer Inventory Allocation",
      detail: "Map custom category rules against clients, software subscriptions, and hardware asset costs to keep track of true project margins."
    }
  ];

  const faqItems = [
    { q: "Is my personal financial data shared with external networks?", a: "Absolutely not. ExpenseIQ functions on a strict privacy model. All receipt scanning and ledger computations are kept secure within your local isolated database layer." },
    { q: "Do I need premium paid tokens or AI keys to scan receipts?", a: "No keys required. The engine runs a fully integrated, open-source structural layout parser that reads and identifies receipt matrices out-of-the-box." },
    { q: "Can I extract my data for standard corporate tax calculations?", a: "Yes. The platform generates comprehensive data exports, allowing you to instantly pull your ledger rows directly into clean spreadsheet formats anytime." }
  ];

  return (
    <div className="min-h-screen bg-[#05070f] text-gray-100 font-sans selection:bg-blue-600 selection:text-white relative flex flex-col justify-between overflow-x-hidden">
      
      {/* 🌌 High-Fidelity Floating Gradient Mesh & Net Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0 pointer-events-none" />
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[450px] bg-gradient-to-b from-blue-500/10 to-transparent blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[40%] left-[-20%] w-[600px] h-[600px] bg-purple-500/5 blur-[160px] rounded-full pointer-events-none z-0" />

      {/* 🌐 Top Premium Navigation Ribbon */}
      <nav className="w-full h-20 border-b border-white/[0.05] bg-[#05070f]/70 backdrop-blur-md relative z-40 px-6 xl:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-heading font-black text-white text-base shadow-lg shadow-blue-500/20">
            ₹
          </div>
          <span className="font-heading font-bold text-lg tracking-tight text-white transition-all hover:opacity-90">
            ExpenseIQ
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setIsLogin(true); setStatusMsg({text:"", isError:false}); setIsAuthOpen(true); }}
            className="text-xs font-mono font-medium text-gray-400 hover:text-white transition-colors"
          >
            [ Sign In ]
          </button>
          <button 
            onClick={() => { setIsLogin(false); setStatusMsg({text:"", isError:false}); setIsAuthOpen(true); }}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-4 h-9 rounded-lg shadow-md shadow-blue-600/10 transition-all flex items-center justify-center gap-1.5 group"
          >
            <span>Get Started Free</span>
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </nav>

      {/* 🚀 Hero Presentation Layer */}
      <section className="pt-28 pb-16 px-6 max-w-5xl mx-auto text-center relative z-10 flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/40 border border-blue-500/20 text-blue-400 text-[10px] font-mono uppercase tracking-wide mb-6 shadow-sm">
          <Sparkles size={12} className="text-yellow-400 animate-spin-slow" /> Master Your Financial Cash Flow Completely Offline
        </div>
        <h1 className="font-heading text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] transition-all">
          Take Control of Your Daily Expenses with <span className="text-gradient-purple-blue">Zero Effort</span>
        </h1>
        <p className="mt-5 text-base sm:text-md text-gray-400 max-w-2xl mx-auto font-sans leading-relaxed">
          The ultimate personal finance workstation built to organize your financial life. Track spending limits, automate bill schedules, and scan physical receipts instantly—all from one secure, beautifully structured cloud portal.
        </p>

        <div className="mt-8 flex items-center gap-4">
          <button 
            onClick={() => { setIsLogin(true); setStatusMsg({text:"", isError:false}); setIsAuthOpen(true); }}
            className="bg-blue-600 text-white font-semibold text-sm px-8 h-12 rounded-lg hover:bg-blue-500 transition-all duration-300 shadow-xl shadow-blue-600/20 hover:scale-[1.02]"
          >
            Open Dashboard Workspace
          </button>
        </div>
      </section>

      {/* 🛠️ Core Functional Specifications Grid */}
      <section className="py-16 px-6 max-w-6xl mx-auto relative z-10 border-t border-white/[0.05]">
        <div className="text-center mb-12">
          <h2 className="font-heading text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">Capabilities Matrix</h2>
          <p className="text-xl font-bold text-white">Engineered Features for Daily Financial Clarity</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {userBenefits.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <div key={i} className="bg-white/[0.01] border border-white/[0.05] rounded-xl p-6 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.02] group hover:-translate-y-1">
                <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Icon size={18} />
                </div>
                <h3 className="font-heading text-base font-bold text-gray-200">{benefit.title}</h3>
                <p className="mt-2 text-xs text-gray-400 font-sans leading-relaxed">{benefit.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 💼 Real-World Use Cases Array Layout */}
      <section className="py-16 px-6 max-w-6xl mx-auto relative z-10 border-t border-white/[0.05]">
        <div className="text-center mb-12">
          <h2 className="font-heading text-xs font-bold text-purple-500 uppercase tracking-widest mb-2">Deployment Contexts</h2>
          <p className="text-xl font-bold text-white">Tailored Flow Systems For Every Workflow</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {appUseCases.map((useCase, idx) => {
            const CaseIcon = useCase.icon;
            return (
              <div key={idx} className="bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.04] p-6 rounded-xl flex gap-4">
                <div className="text-blue-400 mt-1 shrink-0"><CaseIcon size={20} /></div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-gray-200">{useCase.title}</h4>
                  <p className="text-xs text-gray-400 mt-2 font-sans leading-relaxed">{useCase.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ❓ Interactive FAQ Accordion Console */}
      <section className="py-16 px-6 max-w-4xl mx-auto relative z-10 border-t border-white/[0.05]">
        <div className="text-center mb-12">
          <h2 className="font-heading text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">Common Questions</h2>
          <p className="text-xl font-bold text-white">Frequently Reviewed Operations</p>
        </div>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <div key={i} className="bg-white/[0.01] border border-white/[0.04] rounded-lg p-5">
              <div className="flex gap-3 text-sm font-heading font-bold text-gray-200">
                <HelpCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <h4>{faq.q}</h4>
              </div>
              <p className="text-xs text-gray-400 font-sans mt-2.5 pl-7 leading-relaxed border-l border-white/[0.04] ml-2">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 🗺️ Professional Corporate Footer Layout */}
      <footer className="w-full border-t border-white/[0.06] bg-[#03050a] relative z-10 font-sans text-xs pt-12 pb-6">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-left mb-10">
          
          {/* Node Profile Summary */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center font-bold text-white text-xs">₹</div>
              <span className="font-heading font-bold text-sm tracking-tight text-white">ExpenseIQ Enterprise</span>
            </div>
            <p className="text-[11px] text-gray-500 font-sans leading-relaxed max-w-xs">
              Next-generation high-performance expense ecosystem designed to manage metrics, automate cash flows, and maximize local ledger efficiency safely.
            </p>
          </div>

          {/* Operational Infrastructure Links */}
          <div className="space-y-3">
            <h5 className="font-heading text-xs font-bold text-gray-300 uppercase tracking-wider">System Blueprints</h5>
            <div className="flex flex-col gap-2 font-mono text-[11px] text-gray-400">
              <a href="https://github.com/Sidhu1504/Expense-manager-Application.git" target="_blank" className="flex items-center gap-2 hover:text-white transition">
                <Terminal size={13} /> Source Repository
              </a>
              <a href="https://www.linkedin.com/in/sidhant-bote/" target="_blank" className="flex items-center gap-2 hover:text-white transition">
                <User size={13} /> Engineering Network
              </a>
            </div>
          </div>

          {/* Location & Contact Information */}
          <div className="space-y-3">
            <h5 className="font-heading text-xs font-bold text-gray-300 uppercase tracking-wider">Operational Base</h5>
            <div className="flex flex-col gap-2.5 text-gray-400 font-sans text-[11px]">
              <div className="flex items-start gap-2">
                <MapPin size={13} className="text-blue-500 shrink-0 mt-0.5" />
                <span>Viman Nagar, Pune, Maharashtra, India</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <Phone size={13} className="text-emerald-500" />
                <span>+91 7385799333</span>
              </div>
            </div>
          </div>
        </div>

        {/* ❤️ Love Signature Layout */}
        <div className="border-t border-white/[0.04] pt-6 max-w-6xl mx-auto px-6 text-center text-gray-600 font-mono text-[11px] flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} ExpenseIQ Ledger Systems. All data sovereign.</p>
          <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/[0.04] px-3 py-1 rounded-full">
            <span>Made with</span>
            <Heart size={11} className="text-red-500 fill-red-500 animate-pulse" />
            <span>from India by</span>
            <span className="text-gray-300 font-sans font-semibold tracking-wide">Sid</span>
          </div>
        </div>
      </footer>

      {/* 🔐 Authentication Handler Portal Modal */}
      {isAuthOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-[420px] bg-gray-900/90 border border-white/[0.08] rounded-2xl p-8 shadow-2xl relative transition-all">
            <button onClick={() => setIsAuthOpen(false)} className="absolute right-4 top-4 text-gray-500 hover:text-gray-300 transition-colors">
              <X size={18} />
            </button>
            <div className="flex flex-col items-center mb-6 text-center">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
                <Wallet size={18} />
              </div>
              <h3 className="font-heading text-xl font-bold text-white">
                {isLogin ? "System Access Authorization" : "Initialize Identity Node"}
              </h3>
              <p className="text-[11px] text-gray-500 font-mono mt-1">PostgreSQL 18 Secure Handshake</p>
            </div>

            {statusMsg.text && (
              <div className={`mb-4 p-3 rounded-lg border text-xs font-sans flex items-center gap-2 ${
                statusMsg.isError ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              }`}>
                <ShieldCheck size={14} className="shrink-0" />
                <span>{statusMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmission} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wide">Identifier Name</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><User size={14} /></span>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/[0.02] border border-white/[0.08] rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-all" placeholder="Sidhant Bote" />
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wide">Identity Email</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><Mail size={14} /></span>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/[0.02] border border-white/[0.08] rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-all" placeholder="operator@system.local" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wide">Secure Passkey</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><Lock size={14} /></span>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/[0.02] border border-white/[0.08] rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-mono" placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full h-10 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white text-xs font-medium rounded-lg shadow-md transition-all mt-4 flex items-center justify-center gap-2">
                {loading ? "Processing Encryption..." : isLogin ? "Authenticate" : "Write Record to Postgres"}
              </button>
            </form>

            <div className="mt-6 border-t border-white/[0.05] pt-4 text-center">
              <p className="text-xs text-gray-400">
                {isLogin ? "Need an account?" : "Already mapped inside database?"}{" "}
                <button onClick={() => { setIsLogin(!isLogin); setStatusMsg({text:"", isError:false}); }} className="text-blue-400 hover:text-blue-300 font-semibold underline ml-1">
                  {isLogin ? "Register Node" : "Access Auth Channel"}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
