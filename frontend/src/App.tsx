import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { BackgroundPattern } from './components/BackgroundPattern';
import { FeatureCard } from './components/FeatureCard';
import { LoginCard } from './components/LoginCard';
import { CommandControlLanding } from './components/CommandControlLanding';
import { TransitOpsDashboard } from './components/dashboard/TransitOpsDashboard';
import { apiFetch, clearSessionToken, getSessionToken } from './lib/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getSessionToken()));
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
    return <TransitOpsDashboard onLogout={() => {
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
      className="min-h-screen w-full bg-bg-main relative flex flex-col lg:flex-row overflow-x-hidden font-sans select-none"
    >
      {/* Background patterns and canvas dots */}
      <BackgroundPattern />

      {/* LEFT PANEL: 40% Screen Width on Desktop */}
      <div className="w-full lg:w-[40%] xl:w-[38%] flex flex-col justify-between p-8 sm:p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-border-gray/70 relative z-10 bg-white/40 backdrop-blur-[2px]">
        {/* Floating Logo Header */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="flex items-center space-x-3 cursor-pointer select-none"
        >
          {/* Custom geometric logo mark (interlocking roads/nodes) */}
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25 relative overflow-hidden">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-.554-8.243-1.582" />
            </svg>
          </div>
          <span className="text-xl font-extrabold text-text-dark tracking-tight">
            Transit<span className="text-primary font-medium">Ops</span>
          </span>
        </motion.div>

        {/* Content Area */}
        <div className="my-10 lg:my-auto space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-text-dark leading-tight tracking-tight">
              Smart Transport Operations Platform
            </h1>
            <p className="text-sm sm:text-base text-slate-500 font-normal leading-relaxed">
              Manage fleets, drivers, dispatch, maintenance and operational analytics from one intelligent platform.
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
          <div className="pt-2 flex flex-wrap gap-x-6 gap-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-white/70 px-3 py-1.5 rounded-full border border-border-gray shadow-sm">
              <CheckCircle className="w-4 h-4 text-success-green" />
              <span>Secure JWT Auth</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-white/70 px-3 py-1.5 rounded-full border border-border-gray shadow-sm">
              <CheckCircle className="w-4 h-4 text-success-green" />
              <span>Role Based Access</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-white/70 px-3 py-1.5 rounded-full border border-border-gray shadow-sm">
              <CheckCircle className="w-4 h-4 text-success-green" />
              <span>Enterprise Ready</span>
            </div>
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
          © {new Date().getFullYear()} TransitOps Inc. All systems operational.
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
