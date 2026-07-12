import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, ArrowLeft } from 'lucide-react';
import { BackgroundPattern } from './components/BackgroundPattern';
import { FeatureCard } from './components/FeatureCard';
import { LoginCard } from './components/LoginCard';
import { CommandControlLanding } from './components/CommandControlLanding';
import { FleetFlowDashboard } from './components/dashboard/FleetFlowDashboard';
import { apiFetch, clearSessionToken, getSessionToken } from './lib/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => 
    Boolean(getSessionToken()) || new URLSearchParams(window.location.search).has('dashboard')
  );
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!getSessionToken()) return;

    apiFetch('/api/auth/me').then((response) => {
      if (!response.ok) {
        clearSessionToken();
        setIsAuthenticated(false);
      }
    }).catch(() => {
      clearSessionToken();
      setIsAuthenticated(false);
    });
  }, []);

  if (isAuthenticated) {
    return <FleetFlowDashboard onLogout={() => {
      clearSessionToken();
      setIsAuthenticated(false);
    }} />;
  }

  // Marketing landing page — CTAs route to the login screen.
  if (!showLogin) {
    return <CommandControlLanding onEnter={() => setShowLogin(true)} />;
  }
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="cc-root min-h-screen w-full bg-[#FBFCFD] text-[#0A0A0A] relative flex flex-col lg:flex-row overflow-x-hidden select-none"
    >
      {/* Back Button */}
      <button
        onClick={() => setShowLogin(false)}
        className="absolute top-6 right-6 z-20 flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E5E7EB] bg-white text-xs font-semibold text-[#4B5563] hover:text-[#0A0A0A] hover:bg-[#F3F4F6] transition-all cc-shadow-sm cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>
      {/* CSS style tokens for display styling */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        .cc-root { font-family: 'Inter', system-ui, -apple-system, sans-serif; line-height: 1.6; }
        .cc-display { font-family: 'Space Grotesk','Inter',system-ui,sans-serif; letter-spacing: -0.02em; line-height: 1.05; }
        .cc-glass { background: rgba(251,252,253,0.72); backdrop-filter: saturate(140%) blur(14px); -webkit-backdrop-filter: saturate(140%) blur(14px); }
        .cc-shadow-sm { box-shadow: 0 1px 2px rgba(10,15,30,0.04), 0 1px 3px rgba(10,15,30,0.06); }
        .cc-shadow-md { box-shadow: 0 4px 12px rgba(10,15,30,0.06), 0 2px 4px rgba(10,15,30,0.04); }
        .cc-shadow-lg { box-shadow: 0 24px 60px rgba(10,15,30,0.12), 0 6px 16px rgba(10,15,30,0.06); }
        .cc-grain { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E"); }
      `}</style>

      {/* grain + ambient blobs */}
      <div className="cc-grain pointer-events-none fixed inset-0 opacity-[0.025] z-[1]" />
      <div className="pointer-events-none fixed -top-40 -left-40 w-[560px] h-[560px] rounded-full bg-[#2563EB]/[0.06] blur-[130px] z-0" />
      <div className="pointer-events-none fixed top-1/3 -right-40 w-[620px] h-[620px] rounded-full bg-[#8B5CF6]/[0.05] blur-[150px] z-0" />

      {/* Background patterns and canvas dots */}
      <BackgroundPattern />

      {/* LEFT PANEL: 40% Screen Width on Desktop */}
      <div className="w-full lg:w-[40%] xl:w-[38%] flex flex-col justify-between p-8 sm:p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-[#E5E7EB] relative z-10 cc-glass shadow-lg">
        {/* Floating Logo Header */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <span className="w-8 h-8 rounded-[8px] bg-[#0A0A0A] flex items-center justify-center">
            <Truck className="w-[18px] h-[18px] text-white" strokeWidth={2} />
          </span>
          <span className="cc-display text-[19px] font-bold text-[#0A0A0A]">FleetFlow</span>
        </motion.div>

        {/* Content Area */}
        <div className="my-10 lg:my-auto space-y-8">
          <div className="space-y-4">
            <h1 className="cc-display text-[36px] sm:text-[44px] font-bold text-[#0A0A0A] leading-tight">
              Fleet operations,<br /> finally in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#7C3AED]">focus.</span>
            </h1>
            <p className="text-sm sm:text-base text-[#4B5563] font-normal leading-relaxed">
              Manage fleets, drivers, dispatch, maintenance and operational analytics in one calm, precise command center.
            </p>
          </div>

          {/* Three Feature Cards */}
          <div className="space-y-4">
            <FeatureCard
              title="Vehicle Management"
              description="Track real-time location, fuel diagnostics, health alerts, and utilization rates across your entire logistics fleet."
              iconName="Truck"
            />
            <FeatureCard
              title="Trip Dispatch"
              description="Automate route optimizations, ETA updates, driver matching, and electronic proof-of-delivery seamlessly."
              iconName="Route"
            />
            <FeatureCard
              title="Fleet Analytics"
              description="Identify operating inefficiencies, idle time reports, carbon emissions, and driver safety scores with advanced dashboard intelligence."
              iconName="BarChart3"
            />
          </div>

          {/* Verification Badges */}
          <div className="pt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-white text-[11px] font-medium text-[#4B5563] cc-shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" /> Secure JWT Auth
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-white text-[11px] font-medium text-[#4B5563] cc-shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" /> Role Based Access
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-white text-[11px] font-medium text-[#4B5563] cc-shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" /> Enterprise Ready
            </span>
          </div>
        </div>

        {/* Subtle Floating Logistics Illustration (Faint Line Drawing of a truck in the bottom corner) */}
        <motion.div
          animate={{ 
            x: [0, 8, -4, 0], 
            y: [0, -8, 4, 0],
            rotate: [0, 1, -1, 0]
          }}
          transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
          className="absolute bottom-6 right-6 pointer-events-none opacity-[0.05] hidden xl:block"
        >
          <svg width="150" height="150" viewBox="0 0 100 100" fill="none" stroke="#2563EB" strokeWidth="1.5">
            <rect x="5" y="45" width="55" height="30" rx="3" />
            <path d="M60 50h15l15 12v13H60V50z" />
            <circle cx="22" cy="78" r="8" />
            <circle cx="78" cy="78" r="8" />
            <line x1="22" y1="78" x2="70" y2="78" />
            <path d="M70 58h15" />
            <path d="M15 52h35" />
            <path d="M15 62h30" />
          </svg>
        </motion.div>

        {/* Small Legal text at bottom left */}
        <div className="text-[10px] text-slate-400 font-medium">
          © {new Date().getFullYear()} FleetFlow Inc. All systems operational.
        </div>
      </div>

      {/* RIGHT PANEL: 60% Screen Width on Desktop */}
      <div className="w-full lg:w-[60%] xl:w-[62%] flex flex-col justify-center py-16 lg:py-0 relative z-10 min-h-[600px] lg:min-h-0">
        {/* Floating decorative elements in the background behind the card */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
          className="absolute top-[15%] right-[10%] w-32 h-32 rounded-full bg-light-blue/20 blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
          className="absolute bottom-[20%] left-[15%] w-48 h-48 rounded-full bg-light-blue/30 blur-3xl pointer-events-none"
        />

        {/* Glassmorphic Login Card */}
        <LoginCard onLoginSuccess={() => setIsAuthenticated(true)} />
      </div>
    </motion.main>
  );
}

export default App;
