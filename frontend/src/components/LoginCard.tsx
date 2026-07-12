import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Check, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { apiFetch, setSessionToken } from '../lib/api';

interface LoginCardProps {
  onLoginSuccess: () => void;
}

export const LoginCard: React.FC<LoginCardProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@fleetflow.io');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Validation & Loading states
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const [successStep, setSuccessStep] = useState<number | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});

  const validate = () => {
    const tempErrors: { email?: string; password?: string } = {};
    if (!email) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    setSuccessStep(1); // Step 1: Validating credentials

    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setSessionToken(data.token);
        setSuccessStep(2); // Step 2: Generating secure JWT Token
        await new Promise((resolve) => setTimeout(resolve, 800));
        setSuccessStep(3); // Step 3: Loading Fleet Dashboard
        await new Promise((resolve) => setTimeout(resolve, 800));
        setSuccessStep(4); // Step 4: Success & Redirecting
        await new Promise((resolve) => setTimeout(resolve, 600));
        setIsSubmitting(false);
        setSuccessStep(null);
        onLoginSuccess();
      } else {
        setIsSubmitting(false);
        setSuccessStep(null);
        setErrors({
          email: data.message || 'Invalid credentials. Use admin@fleetflow.io',
          password: 'Use password123 for demo authentication'
        });
        triggerShake();
      }
    } catch {
      setIsSubmitting(false);
      setSuccessStep(null);
      setErrors({
        email: 'Connection error. Make sure the backend is running.',
        password: 'Check server state.'
      });
      triggerShake();
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="w-full max-w-lg mx-auto relative px-4 sm:px-6">
      {/* Loading Modal/Overlay */}
      <AnimatePresence>
        {isSubmitting && successStep !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/45 backdrop-blur-md z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card p-8 rounded-[18px] border border-border-gray shadow-2xl max-w-sm w-full mx-4 text-center flex flex-col items-center"
            >
              {successStep < 4 ? (
                <>
                  {/* Premium Spinner */}
                  <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 rounded-full border-[3px] border-light-blue" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-[3px] border-t-primary border-r-transparent border-b-transparent border-l-transparent"
                    />
                    <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-dark">Securing Session</h3>
                  <div className="mt-2 text-sm text-slate-500 h-6 overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={successStep}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {successStep === 1 && 'Validating JWT signature...'}
                        {successStep === 2 && 'Signing session payload...'}
                        {successStep === 3 && 'Syncing vehicle telemetry data...'}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  {/* Success Banner */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.4 }}
                    className="w-16 h-16 bg-success-green/15 text-success-green rounded-full flex items-center justify-center mb-6"
                  >
                    <Check className="w-8 h-8" strokeWidth={2.5} />
                  </motion.div>
                  <h3 className="text-xl font-bold text-text-dark">Access Granted</h3>
                  <p className="text-sm text-slate-500 mt-2">
                    Welcome to FleetFlow Hub. Redirecting...
                  </p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Glassmorphic Login Card */}
      <motion.div
        animate={shake ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="cc-glass w-full rounded-[20px] p-8 sm:p-10 cc-shadow-lg relative border border-[#E5E7EB]/80"
      >
        <div className="mb-8">
          <h2 className="cc-display text-3xl font-bold text-[#0A0A0A] tracking-tight">Welcome Back</h2>
          <p className="text-sm text-[#4B5563] mt-2">Continue to your FleetFlow workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Address Input */}
          <div className="space-y-1.5 text-left">
            <label htmlFor="email" className="block text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
              Corporate Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl text-sm text-[#0A0A0A] transition-all duration-200 focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 focus:outline-none ${
                  errors.email ? 'border-danger-red/60 focus:border-danger-red focus:ring-danger-red/10' : 'border-[#E5E7EB]'
                }`}
              />
            </div>
            {errors.email && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-1.5 mt-1 text-xs text-danger-red font-medium"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.email}</span>
              </motion.div>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
                Password
              </label>
              <a
                href="#forgot"
                className="text-xs text-[#2563EB] hover:underline font-medium transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Reset password flow triggered. Check your email for guidelines.');
                }}
              >
                Forgot Password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                className={`w-full pl-11 pr-11 py-3 bg-white border rounded-xl text-sm text-[#0A0A0A] transition-all duration-200 focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 focus:outline-none ${
                  errors.password ? 'border-danger-red/60 focus:border-danger-red focus:ring-danger-red/10' : 'border-[#E5E7EB]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-1.5 mt-1 text-xs text-danger-red font-medium"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.password}</span>
              </motion.div>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center text-left">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className="flex items-center space-x-2.5 group focus:outline-none text-left"
              role="checkbox"
              aria-checked={rememberMe}
            >
              <div
                className={`w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center transition-all duration-200 ${
                  rememberMe ? 'bg-[#2563EB] border-[#2563EB]' : 'border-[#E5E7EB] bg-white group-hover:border-[#2563EB]'
                }`}
              >
                <AnimatePresence>
                  {rememberMe && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3.5} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span className="text-xs text-[#4B5563] font-medium select-none cursor-pointer">
                Remember this device for 30 days
              </span>
            </button>
          </div>

          {/* Login Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] hover:scale-[1.01] text-white font-semibold rounded-xl text-sm cc-shadow-md focus:outline-none focus:ring-4 focus:ring-[#2563EB]/20 transition-all duration-200 flex items-center justify-center space-x-2 group cursor-pointer"
          >
            <span>Sign In to Workspace</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E5E7EB]"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#FBFCFD] px-4 text-[#9CA3AF] font-semibold tracking-wider">or sign in with</span>
          </div>
        </div>

        {/* Social Logins */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => alert('Redirecting to Google Enterprise Single-Sign-On...')}
            className="px-4 py-2.5 border border-[#E5E7EB] hover:bg-[#F3F4F6] hover:border-[#2563EB]/50 text-[#4B5563] text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 group cursor-pointer"
          >
            {/* Monochromatic Google SVG */}
            <svg className="w-4.5 h-4.5 text-slate-500 group-hover:text-[#2563EB] transition-colors" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google Workspace</span>
          </button>
          <button
            type="button"
            onClick={() => alert('Redirecting to Microsoft Azure AD Single-Sign-On...')}
            className="px-4 py-2.5 border border-[#E5E7EB] hover:bg-[#F3F4F6] hover:border-[#2563EB]/50 text-[#4B5563] text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 group cursor-pointer"
          >
            {/* Monochromatic Microsoft SVG */}
            <svg className="w-4.5 h-4.5 text-slate-500 group-hover:text-[#2563EB] transition-colors" viewBox="0 0 23 23" fill="currentColor">
              <path d="M0 0h11v11H0zM12 0h11v11H12zM0 12h11v11H0zM12 12h11v11H12z" />
            </svg>
            <span>Azure AD</span>
          </button>
        </div>

        {/* Demo Accounts Panel */}
        <div className="mt-8 pt-6 border-t border-[#E5E7EB] text-left">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3">Role-Based Evaluation Logins</h4>
          <div className="space-y-2 select-text">
            {[
              { role: 'Admin', email: 'admin@fleetflow.io', pass: 'password123', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
              { role: 'Fleet Manager', email: 'manager@fleetflow.io', pass: 'password123', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
              { role: 'Driver', email: 'driver@fleetflow.io', pass: 'password123', color: 'text-blue-600 bg-blue-50 border-blue-100' },
              { role: 'Safety Officer', email: 'safety@fleetflow.io', pass: 'password123', color: 'text-amber-600 bg-amber-50 border-amber-100' },
              { role: 'Financial Analyst', email: 'finance@fleetflow.io', pass: 'password123', color: 'text-rose-600 bg-rose-50 border-rose-100' },
            ].map((acc, idx) => {
              const isVisible = Boolean(visiblePasswords[idx]);
              return (
                <div 
                  key={acc.role} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all duration-200 gap-2"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className={`w-28 shrink-0 text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md text-center border ${acc.color}`}>
                      {acc.role}
                    </span>
                    <span className="font-mono text-[11px] text-slate-600 truncate">{acc.email}</span>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0">
                    <div className="flex items-center space-x-1.5 font-mono text-[11.5px] text-slate-500 bg-white sm:bg-transparent px-2 sm:px-0 py-1 sm:py-0 rounded-lg border border-slate-100 sm:border-none">
                      <span>{isVisible ? acc.pass : '••••••••'}</span>
                      <button
                        type="button"
                        onClick={() => setVisiblePasswords(prev => ({ ...prev, [idx]: !prev[idx] }))}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                      >
                        {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail(acc.email);
                        setPassword(acc.pass);
                      }}
                      className="px-2.5 py-1 bg-primary hover:bg-primary/95 text-white text-[10px] font-black rounded-lg cursor-pointer transition-colors shadow-sm hover:shadow"
                    >
                      Autofill
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info inside the right panel */}
        <div className="mt-6 text-center text-xs text-slate-400 font-medium">
          <span>Need help? </span>
          <a
            href="#admin"
            onClick={(e) => {
              e.preventDefault();
              alert('Support channels: administrator@fleetflow.io or dial extensions #9090.');
            }}
            className="text-[#2563EB] hover:underline transition-colors"
          >
            Contact Administrator
          </a>
        </div>
      </motion.div>
    </div>
  );
};
