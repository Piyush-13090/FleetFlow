
import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import {
  motion,
  animate,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionValueEvent,
} from 'framer-motion';
import {
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  ArrowRight,
  ArrowUpRight,
  Check,
  Star,
  Play,
  Archive,
  Map,
  Car,
  ShieldCheck,
  Activity,
} from 'lucide-react';

const Spline = lazy(() => import('@splinetool/react-spline'));

interface CommandControlLandingProps {
  /** Fired by primary CTAs — routes to login. */
  onEnter: () => void;
}

/* ── Tokens ──────────────────────────────────────────────────────────────── */
const ACCENT = '#2563EB';
const EASE = [0.2, 0.8, 0.2, 1] as const;
/** Swappable Spline scene — abstract premium object. */
const SPLINE_SCENE = 'https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode';

const IMG = {
  truck: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80',
  fleet: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=900&q=80',
  warehouse: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80',
  dispatch: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=900&q=80',
  driver: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=900&q=80',
  road: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1600&q=80',
  closing: 'https://images.unsplash.com/photo-1620656798579-1984d9e87df7?auto=format&fit=crop&w=1600&q=80',
  avatar1: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
};

/* ── Reveal: fade + rise ─────────────────────────────────────────────────── */
const Reveal: React.FC<{ children: React.ReactNode; delay?: number; y?: number; className?: string }> = ({
  children, delay = 0, y = 16, className,
}) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.6, ease: EASE, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

/* ── Count-up, tabular numerals ──────────────────────────────────────────── */
const CountUp: React.FC<{ to: number; decimals?: number; prefix?: string; suffix?: string; duration?: number }> = ({
  to, decimals = 0, prefix = '', suffix = '', duration = 1.4,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) { setVal(to); return; }
    const controls = animate(0, to, { duration, ease: EASE, onUpdate: (v) => setVal(v) });
    return () => controls.stop();
  }, [inView, to, reduce, duration]);
  const text = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString('en-US');
  return <span ref={ref} className="tabular-nums">{prefix}{text}{suffix}</span>;
};

/* ── Spline error boundary → poster fallback ─────────────────────────────── */
class SplineBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

const HeroPoster: React.FC = () => (
  <div className="absolute inset-0 rounded-[20px] overflow-hidden">
    <img src={IMG.truck} alt="Fleet truck" className="w-full h-full object-cover" loading="lazy" />
    <div className="absolute inset-0 bg-gradient-to-tr from-[#0A0A0A]/30 via-transparent to-[#2563EB]/10" />
  </div>
);

/* ── Tilt + spotlight card ───────────────────────────────────────────────── */
const TiltCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const reduce = useReducedMotion();
  const rx = useSpring(0, { stiffness: 200, damping: 20 });
  const ry = useSpring(0, { stiffness: 200, damping: 20 });
  const [spot, setSpot] = useState({ x: 50, y: 50, on: false });

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 8);
    rx.set(-(py - 0.5) * 8);
    setSpot({ x: px * 100, y: py * 100, on: true });
  };
  const onLeave = () => { rx.set(0); ry.set(0); setSpot((s) => ({ ...s, on: false })); };

  return (
    <motion.div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d', transformPerspective: 900 }}
      className={`relative ${className ?? ''}`}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[20px] transition-opacity duration-300"
        style={{
          opacity: spot.on ? 1 : 0,
          background: `radial-gradient(340px circle at ${spot.x}% ${spot.y}%, rgba(37,99,235,0.10), transparent 60%)`,
        }}
      />
      {children}
    </motion.div>
  );
};

/* ── Magnetic button ─────────────────────────────────────────────────────── */
const Magnetic: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({
  children, className, onClick,
}) => {
  const reduce = useReducedMotion();
  const x = useSpring(0, { stiffness: 250, damping: 18 });
  const y = useSpring(0, { stiffness: 250, damping: 18 });
  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.25);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.35);
  };
  return (
    <motion.button
      onClick={onClick}
      onPointerMove={onMove}
      onPointerLeave={() => { x.set(0); y.set(0); }}
      style={{ x, y }}
      className={`cc-btn ${className ?? ''}`}
    >
      {children}
    </motion.button>
  );
};

/* ── Data ────────────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: Truck, title: 'Vehicle Registry', copy: 'A single source of truth for every asset — capacity, odometer, cost, and lifecycle status.', img: IMG.fleet },
  { icon: Users, title: 'Driver Management', copy: 'Profiles, license validity, and safety scores, with compliance surfaced before it lapses.', img: IMG.driver },
  { icon: Route, title: 'Trip Dispatch & Lifecycle', copy: 'Assign, dispatch, and track trips from draft to completion with rules enforced end to end.', img: IMG.dispatch },
  { icon: Wrench, title: 'Maintenance Automation', copy: 'Log a service and the vehicle leaves the dispatch pool automatically — no manual toggling.' },
  { icon: Fuel, title: 'Fuel & Expense Tracking', copy: 'Capture fuel, tolls, and repairs, then compute true operational cost per vehicle.' },
  { icon: BarChart3, title: 'Reports & Analytics', copy: 'Utilization, fuel efficiency, and ROI — measured, exportable, decision-ready.' },
];

const FLOW = [
  { label: 'Dispatch trip', tone: 'accent' },
  { label: 'Vehicle & driver → On Trip', tone: 'accent' },
  { label: 'Trip completes', tone: 'neutral' },
  { label: 'Both → Available', tone: 'success' },
  { label: 'Maintenance logged', tone: 'neutral' },
  { label: 'Vehicle → In Shop', tone: 'critical' },
] as const;

const toneStyles: Record<string, string> = {
  accent: 'bg-[#EFF4FF] text-[#2563EB] border-[#DBE6FF]',
  success: 'bg-[#ECFDF5] text-[#059669] border-[#C7F0DC]',
  neutral: 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]',
  critical: 'bg-[#FEF2F2] text-[#DC2626] border-[#FBD5D5]',
};

const LOGOS = ['NorthFreight', 'CargoLine', 'Veloce', 'HaulerX', 'TransGlobal', 'FleetIQ', 'RouteOne', 'Continental'];

/* ── Page ────────────────────────────────────────────────────────────────── */
export const CommandControlLanding: React.FC<CommandControlLandingProps> = ({ onEnter }) => {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 16));

  // Hero mouse-parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const pxs = useSpring(mx, { stiffness: 120, damping: 20 });
  const pys = useSpring(my, { stiffness: 120, damping: 20 });
  const glowX = useTransform(pxs, [-0.5, 0.5], [-30, 30]);
  const glowY = useTransform(pys, [-0.5, 0.5], [-24, 24]);
  const cardX = useTransform(pxs, [-0.5, 0.5], [14, -14]);
  const cardY = useTransform(pys, [-0.5, 0.5], [10, -10]);
  const card2X = useTransform(pxs, [-0.5, 0.5], [-16, 16]);
  const card2Y = useTransform(pys, [-0.5, 0.5], [-12, 12]);
  const onHeroMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  // Product-preview scroll parallax
  const previewRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: previewP } = useScroll({ target: previewRef, offset: ['start end', 'end start'] });
  const previewY = useTransform(previewP, [0, 1], [60, -60]);

  return (
    <div className="cc-root relative w-full bg-[#FBFCFD] text-[#0A0A0A] overflow-x-hidden antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        .cc-root { font-family: 'Inter', system-ui, -apple-system, sans-serif; line-height: 1.6; }
        .cc-display { font-family: 'Space Grotesk','Inter',system-ui,sans-serif; letter-spacing: -0.02em; line-height: 1.05; }
        .cc-glass { background: rgba(251,252,253,0.72); backdrop-filter: saturate(140%) blur(14px); -webkit-backdrop-filter: saturate(140%) blur(14px); }
        .cc-shadow-sm { box-shadow: 0 1px 2px rgba(10,15,30,0.04), 0 1px 3px rgba(10,15,30,0.06); }
        .cc-shadow-md { box-shadow: 0 4px 12px rgba(10,15,30,0.06), 0 2px 4px rgba(10,15,30,0.04); }
        .cc-shadow-lg { box-shadow: 0 24px 60px rgba(10,15,30,0.12), 0 6px 16px rgba(10,15,30,0.06); }
        .cc-grain { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E"); }
        .cc-btn:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(37,99,235,0.35); }
        a:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(37,99,235,0.35); border-radius: 8px; }
        .cc-marquee { animation: ccMarquee 32s linear infinite; }
        @keyframes ccMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .cc-marquee { animation: none; } }
      `}</style>

      {/* grain + ambient blobs */}
      <div className="cc-grain pointer-events-none fixed inset-0 opacity-[0.025] z-[1]" />
      <div className="pointer-events-none fixed -top-40 -left-40 w-[560px] h-[560px] rounded-full bg-[#2563EB]/[0.06] blur-[130px] z-0" />
      <div className="pointer-events-none fixed top-1/3 -right-40 w-[620px] h-[620px] rounded-full bg-[#8B5CF6]/[0.05] blur-[150px] z-0" />

      {/* ── 1 · Floating nav + scroll progress ───────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-50 px-4 sm:px-6">
        <motion.nav
          animate={{ marginTop: scrolled ? 10 : 18, paddingTop: scrolled ? 10 : 14, paddingBottom: scrolled ? 10 : 14 }}
          transition={{ duration: 0.22, ease: EASE }}
          className={`relative mx-auto max-w-6xl px-5 sm:px-6 rounded-[20px] flex items-center gap-6 ${
            scrolled ? 'cc-glass border border-[#E5E7EB] cc-shadow-sm' : 'border border-transparent'
          }`}
        >
          <a href="#top" className="flex items-center gap-2.5 mr-auto">
            <span className="w-8 h-8 rounded-[8px] bg-[#0A0A0A] flex items-center justify-center">
              <Truck className="w-[18px] h-[18px] text-white" strokeWidth={2} />
            </span>
            <span className="cc-display text-[19px] font-bold">FleetFlow</span>
          </a>
          <button onClick={onEnter} className="cc-btn min-h-[44px] px-5 rounded-[12px] bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] hover:scale-[1.02] transition-[background,transform] cc-shadow-sm">
            Login
          </button>
          <motion.div style={{ scaleX: scrollYProgress }} className="absolute left-5 right-5 -bottom-[1px] h-[2px] origin-left rounded-full bg-[#2563EB]" />
        </motion.nav>
      </header>

      {/* ── 2 · Hero ─────────────────────────────────────────────────────── */}
      <section id="top" onMouseMove={onHeroMove} className="relative z-10 px-6 pt-40 pb-24 sm:pt-44">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-[1.02fr_0.98fr] gap-14 items-center">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-white text-[12px] font-medium text-[#4B5563] cc-shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" /> Real-time fleet visibility
              </span>
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="cc-display mt-6 text-[46px] sm:text-[64px] font-bold text-[#0A0A0A]">
                Fleet operations,<br /> finally in{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#7C3AED]">focus.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-6 max-w-md text-[17px] text-[#4B5563]">
                Digitize your entire logistics lifecycle — vehicles, drivers, dispatch,
                maintenance, and cost — in one calm, precise command center.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Magnetic onClick={onEnter} className="min-h-[44px] px-6 rounded-[12px] bg-[#2563EB] text-white text-sm font-semibold cc-shadow-md inline-flex items-center gap-2">
                  Request a demo <ArrowRight className="w-4 h-4" />
                </Magnetic>
                <button onClick={onEnter} className="cc-btn min-h-[44px] px-5 rounded-[12px] bg-white border border-[#E5E7EB] text-sm font-semibold text-[#0A0A0A] hover:scale-[1.02] transition-transform cc-shadow-sm inline-flex items-center gap-2">
                  <Play className="w-4 h-4 text-[#2563EB]" /> Watch tour
                </button>
              </div>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-8 flex items-center gap-3 text-[13px] text-[#6B7280]">
                <div className="flex -space-x-2">
                  {[IMG.avatar1, IMG.driver, IMG.warehouse].map((src, i) => (
                    <img key={i} src={src} alt="" className="w-7 h-7 rounded-full border-2 border-white object-cover" loading="lazy" />
                  ))}
                </div>
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" /> Trusted by 500+ fleet teams
                </span>
              </div>
            </Reveal>
          </div>

          {/* Hero visual: 3D Spline + parallax glow + floating KPI card */}
          <Reveal delay={0.1}>
            <div className="relative h-[420px] sm:h-[500px]">
              <motion.div style={{ x: glowX, y: glowY }} className="pointer-events-none absolute inset-6 rounded-full bg-[#2563EB]/15 blur-[80px]" />
              <div className="relative h-full rounded-[20px] overflow-hidden border border-[#E5E7EB] bg-gradient-to-b from-white to-[#F4F7FB] cc-shadow-lg">
                <SplineBoundary fallback={<HeroPoster />}>
                  <Suspense fallback={<HeroPoster />}>
                    <Spline scene={SPLINE_SCENE} style={{ width: '100%', height: '100%' }} />
                  </Suspense>
                </SplineBoundary>
                {/* cover the Spline watermark */}
                <div className="absolute bottom-2 right-2 w-28 h-8 bg-gradient-to-b from-white to-[#F4F7FB]" />
              </div>

              {/* floating: Fleet Safety Score (top-left) */}
              <motion.div style={{ x: cardX, y: cardY }} className="absolute top-6 -left-4 sm:-left-6 cc-glass border border-[#E5E7EB] rounded-[16px] p-5 cc-shadow-lg w-[190px]">
                <div className="flex items-center justify-between mb-3">
                  <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
                  <span className="text-[10px] font-bold text-[#2563EB] bg-[#EFF4FF] px-2 py-0.5 rounded-full">LIVE</span>
                </div>
                <div className="cc-display text-[30px] font-bold leading-none"><CountUp to={94.2} decimals={1} /></div>
                <div className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.12em] mt-2">Fleet Safety Score</div>
              </motion.div>

              {/* floating: Active Trips (bottom-right) */}
              <motion.div style={{ x: card2X, y: card2Y }} className="absolute bottom-8 -right-4 sm:-right-6 cc-glass border border-[#E5E7EB] rounded-[16px] p-5 cc-shadow-lg w-[180px]">
                <div className="relative w-14 h-14 mb-3">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="#EFF4FF" strokeWidth="4" />
                    <motion.circle
                      cx="28" cy="28" r="24" fill="none" stroke={ACCENT} strokeWidth="4" strokeLinecap="round"
                      strokeDasharray={150.8}
                      initial={{ strokeDashoffset: 150.8 }}
                      whileInView={{ strokeDashoffset: 42 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: EASE }}
                    />
                  </svg>
                  <Activity className="absolute inset-0 m-auto w-5 h-5 text-[#2563EB]" />
                </div>
                <div className="cc-display text-[26px] font-bold text-[#2563EB] leading-none"><CountUp to={1204} /></div>
                <div className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.12em] mt-2">Active Trips Today</div>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 3 · Logo marquee ─────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-6 border-y border-[#E5E7EB] bg-white/50 overflow-hidden">
        <div className="mx-auto max-w-6xl flex items-center gap-6">
          <span className="hidden sm:block shrink-0 text-[12px] text-[#9CA3AF]">Powering fleets at</span>
          <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <div className="flex w-max cc-marquee gap-12">
              {[...LOGOS, ...LOGOS].map((name, i) => (
                <span key={i} className="cc-display text-[18px] font-semibold text-[#9CA3AF] whitespace-nowrap">{name}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4 · Proof strip ──────────────────────────────────────────────── */}
      <section className="relative z-10 px-6">
        <div className="mx-auto max-w-6xl py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { stat: <CountUp to={40} suffix="%" />, label: 'fewer scheduling conflicts' },
            { stat: <CountUp to={99.8} decimals={1} suffix="%" />, label: 'on-time dispatch rate' },
            { stat: '0', label: 'double-bookings' },
            { stat: <CountUp to={100} suffix="%" />, label: 'license compliance tracked' },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 0.06} className="text-center md:text-left">
              <div className="cc-display text-[34px] font-bold text-[#0A0A0A]">{s.stat}</div>
              <div className="text-[13px] text-[#6B7280] mt-1">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── 5 · Product preview ──────────────────────────────────────────── */}
      <section ref={previewRef} className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-6xl text-center mb-12">
          <Reveal>
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">One command center</span>
            <h2 className="cc-display mt-3 text-[34px] sm:text-[44px] font-bold">See the whole operation at a glance.</h2>
          </Reveal>
        </div>
        <motion.div style={{ y: reduce ? 0 : previewY }} className="mx-auto max-w-5xl">
          <div className="rounded-[20px] border border-[#E5E7EB] bg-white cc-shadow-lg overflow-hidden">
            {/* browser chrome */}
            <div className="flex items-center gap-2 px-4 h-10 border-b border-[#EEF1F4] bg-[#FBFCFD]">
              <span className="w-3 h-3 rounded-full bg-[#F87171]" />
              <span className="w-3 h-3 rounded-full bg-[#FBBF24]" />
              <span className="w-3 h-3 rounded-full bg-[#34D399]" />
              <span className="ml-4 text-[11px] text-[#9CA3AF]">app.fleetflow.io/dashboard</span>
            </div>
            {/* faux dashboard */}
            <div className="p-5 bg-[#FBFCFD]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { v: <CountUp to={121} />, l: 'Active Vehicles', up: '+8%' },
                  { v: <CountUp to={78} />, l: 'Available', up: '+3%' },
                  { v: <CountUp to={42} />, l: 'Active Trips', up: '+11%' },
                  { v: <CountUp to={84} suffix="%" />, l: 'Utilization', up: '+6%' },
                ].map((k, i) => (
                  <div key={i} className="rounded-[12px] border border-[#EEF1F4] bg-white p-4">
                    <div className="flex items-center justify-between">
                      <span className="cc-display text-[22px] font-bold">{k.v}</span>
                      <span className="text-[11px] font-medium text-[#059669] bg-[#ECFDF5] px-1.5 py-0.5 rounded-full">{k.up}</span>
                    </div>
                    <div className="text-[11px] text-[#9CA3AF] mt-1">{k.l}</div>
                  </div>
                ))}
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="md:col-span-2 rounded-[12px] border border-[#EEF1F4] bg-white p-4">
                  <div className="text-[12px] text-[#6B7280] mb-3">Fleet utilization trend</div>
                  <svg viewBox="0 0 400 120" className="w-full" fill="none">
                    <defs>
                      <linearGradient id="ccP" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={ACCENT} stopOpacity="0.16" />
                        <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <motion.path d="M0 90 C 60 84, 100 64, 160 60 S 280 40, 400 26 L400 120 L0 120 Z" fill="url(#ccP)"
                      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }} />
                    <motion.path d="M0 90 C 60 84, 100 64, 160 60 S 280 40, 400 26" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round"
                      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE }} />
                  </svg>
                </div>
                <div className="rounded-[12px] border border-[#EEF1F4] bg-white p-4">
                  <div className="text-[12px] text-[#6B7280] mb-3">Status</div>
                  {[
                    { l: 'On Trip', c: 'bg-[#2563EB]', w: 'w-[60%]' },
                    { l: 'Available', c: 'bg-[#16A34A]', w: 'w-[30%]' },
                    { l: 'In Shop', c: 'bg-[#DC2626]', w: 'w-[10%]' },
                  ].map((r) => (
                    <div key={r.l} className="mb-2.5">
                      <div className="flex justify-between text-[11px] text-[#6B7280] mb-1"><span>{r.l}</span></div>
                      <div className="h-1.5 rounded-full bg-[#F1F3F5]"><div className={`h-full rounded-full ${r.c} ${r.w}`} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── 5b · Fleet showcase (device frame + floating stat cards) ─────── */}
      <section className="relative z-10 px-6 pt-8 pb-24">
        <Reveal>
          <div className="relative mx-auto w-full max-w-[560px]">
            {/* device bezel */}
            <div className="rounded-[36px] bg-gradient-to-b from-[#EEF1F5] to-[#E3E8EF] p-3.5 sm:p-4 cc-shadow-lg">
              <div className="relative rounded-[26px] overflow-hidden aspect-[3/4] bg-[#0A0A0A]">
                <img src={IMG.truck} alt="Electric delivery truck charging at depot" className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/25 via-transparent to-transparent" />
              </div>
            </div>

            {/* floating: Fleet Safety Score (top-left) */}
            <motion.div
              animate={reduce ? {} : { y: [0, -9, 0] }}
              transition={{ repeat: Infinity, duration: 5.5, ease: 'easeInOut' }}
              className="absolute top-16 -left-3 sm:-left-8 cc-glass border border-[#E5E7EB] rounded-[16px] p-5 cc-shadow-lg w-[178px]"
            >
              <div className="flex items-center justify-between mb-3">
                <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
                <span className="text-[10px] font-bold text-[#2563EB] bg-[#EFF4FF] px-2 py-0.5 rounded-full">LIVE</span>
              </div>
              <div className="cc-display text-[30px] font-bold leading-none"><CountUp to={94.2} decimals={1} /></div>
              <div className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.12em] mt-2">Fleet Safety Score</div>
            </motion.div>

            {/* floating: Active Trips (right) */}
            <motion.div
              animate={reduce ? {} : { y: [0, 9, 0] }}
              transition={{ repeat: Infinity, duration: 6.5, ease: 'easeInOut' }}
              className="absolute bottom-24 -right-3 sm:-right-8 cc-glass border border-[#E5E7EB] rounded-[16px] p-5 cc-shadow-lg w-[168px]"
            >
              <div className="relative w-14 h-14 mb-3">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="#EFF4FF" strokeWidth="4" />
                  <motion.circle
                    cx="28" cy="28" r="24" fill="none" stroke={ACCENT} strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={150.8}
                    initial={{ strokeDashoffset: 150.8 }}
                    whileInView={{ strokeDashoffset: 42 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: EASE }}
                  />
                </svg>
                <Activity className="absolute inset-0 m-auto w-5 h-5 text-[#2563EB]" />
              </div>
              <div className="cc-display text-[26px] font-bold text-[#2563EB] leading-none"><CountUp to={1204} /></div>
              <div className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.12em] mt-2">Active Trips Today</div>
            </motion.div>
          </div>
        </Reveal>
      </section>

      {/* ── 6 · Enterprise-grade feature grid (rich tilt cards) ──────────── */}
      <section id="platform" className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="cc-display text-[34px] sm:text-[42px] font-bold">Enterprise-Grade Fleet Control</h2>
              <p className="mt-3 text-[15px] text-[#6B7280]">Built for scale, designed for simplicity.</p>
            </div>
          </Reveal>

          {/* Row 1 — three signature cards with live mini-visualizations */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Unified Registry */}
            <Reveal delay={0}>
              <TiltCard className="h-full">
                <div className="h-full flex flex-col rounded-[20px] border border-[#E5E7EB] bg-white p-7 cc-shadow-sm hover:cc-shadow-md transition-shadow">
                  <span className="w-14 h-14 rounded-[16px] bg-[#FFFBEB] border border-[#FDE8B0] flex items-center justify-center">
                    <Archive className="w-6 h-6 text-[#D97706]" strokeWidth={1.9} />
                  </span>
                  <h3 className="cc-display mt-6 text-[21px] font-semibold">Unified Registry</h3>
                  <p className="mt-2 text-[15px] text-[#4B5563]">
                    Centralize vehicle lifecycle management. Track odometer, maintenance logs, and ROI in one granular view.
                  </p>
                  <div className="mt-auto pt-6">
                    <div className="rounded-[12px] bg-[#FFFBEB] border border-[#FDE8B0] p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-[#B45309] uppercase tracking-wide">Fuel Efficiency</span>
                        <span className="text-[13px] font-bold tabular-nums">18.4 km/L</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#FDE8B0]/60 overflow-hidden">
                        <motion.div className="h-full rounded-full bg-[#F59E0B]"
                          initial={{ width: 0 }} whileInView={{ width: '72%' }} viewport={{ once: true }} transition={{ duration: 1, ease: EASE }} />
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </Reveal>

            {/* Smart Driver Pool */}
            <Reveal delay={0.06}>
              <TiltCard className="h-full">
                <div className="h-full flex flex-col rounded-[20px] border border-[#E5E7EB] bg-white p-7 cc-shadow-sm hover:cc-shadow-md transition-shadow">
                  <span className="w-14 h-14 rounded-[16px] bg-[#ECFDF5] border border-[#C7F0DC] flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#059669]" strokeWidth={1.9} />
                  </span>
                  <h3 className="cc-display mt-6 text-[21px] font-semibold">Smart Driver Pool</h3>
                  <p className="mt-2 text-[15px] text-[#4B5563]">
                    Manage profiles, safety scores, and compliance. Real-time status tracking with automated dispatch routing.
                  </p>
                  <div className="mt-auto pt-6 space-y-2">
                    {['Marco Rossi', 'Sarah Chen'].map((name) => (
                      <div key={name} className="flex items-center gap-3 p-3 rounded-[12px] border border-[#EEF1F4] bg-[#FBFCFD]">
                        <Car className="w-4 h-4 text-[#059669]" />
                        <span className="text-[13px] font-semibold flex-1">{name}</span>
                        <span className="text-[9px] font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full">ACTIVE</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TiltCard>
            </Reveal>

            {/* Live Dispatch Map */}
            <Reveal delay={0.12}>
              <TiltCard className="h-full">
                <div className="h-full flex flex-col rounded-[20px] border border-[#E5E7EB] bg-white p-7 cc-shadow-sm hover:cc-shadow-md transition-shadow">
                  <span className="w-14 h-14 rounded-[16px] bg-[#EFF4FF] border border-[#DBE6FF] flex items-center justify-center">
                    <Map className="w-6 h-6 text-[#2563EB]" strokeWidth={1.9} />
                  </span>
                  <h3 className="cc-display mt-6 text-[21px] font-semibold">Live Dispatch Map</h3>
                  <p className="mt-2 text-[15px] text-[#4B5563]">
                    Total operational visibility. Dark-mode map insets with glowing route lines and anomaly detection.
                  </p>
                  <div className="mt-auto pt-6">
                    <div className="relative h-28 rounded-[12px] overflow-hidden flex items-center justify-center"
                      style={{ background: '#0F172A', backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(59,130,246,0.14) 1px, transparent 0)', backgroundSize: '20px 20px' }}>
                      <div className="relative z-10 text-center">
                        <div className="cc-display text-[24px] font-bold text-white"><CountUp to={99.8} decimals={1} suffix="%" /></div>
                        <div className="text-[8px] font-bold text-[#60A5FA] uppercase tracking-[0.14em] mt-0.5">SLA Success</div>
                      </div>
                      <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 200 100" preserveAspectRatio="none">
                        <path d="M0 60 Q 50 20, 100 55 T 200 40" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 5" />
                      </svg>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          </div>

          {/* Row 2 — remaining capabilities, consistent premium style */}
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            {[
              { icon: Wrench, title: 'Maintenance Automation', copy: 'Log a service and the vehicle leaves the dispatch pool automatically — no manual toggling.' },
              { icon: Fuel, title: 'Fuel & Expense Tracking', copy: 'Capture fuel, tolls, and repairs, then compute true operational cost per vehicle.' },
              { icon: BarChart3, title: 'Reports & Analytics', copy: 'Utilization, fuel efficiency, and ROI — measured, exportable, decision-ready.' },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={i * 0.06}>
                  <TiltCard className="h-full">
                    <div className="h-full rounded-[20px] border border-[#E5E7EB] bg-white p-7 cc-shadow-sm hover:cc-shadow-md transition-shadow">
                      <span className="w-12 h-12 rounded-[14px] bg-[#F3F4F6] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[#0A0A0A]" strokeWidth={1.8} />
                      </span>
                      <h3 className="cc-display mt-5 text-[19px] font-semibold">{f.title}</h3>
                      <p className="mt-2 text-[15px] text-[#4B5563]">{f.copy}</p>
                    </div>
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 6b · Capability grid (photo-band tilt cards) ─────────────────── */}
      <section className="relative z-10 px-6 py-24 bg-white border-y border-[#E5E7EB]">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 className="cc-display text-[34px] sm:text-[40px] font-bold max-w-xl">
              Everything the operation needs. Nothing it doesn't.
            </h2>
          </Reveal>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={(i % 3) * 0.06}>
                  <TiltCard className="h-full">
                    <div className="h-full rounded-[20px] border border-[#E5E7EB] bg-white p-6 cc-shadow-sm hover:cc-shadow-md transition-shadow overflow-hidden">
                      {f.img && (
                        <div className="mb-5 -mx-6 -mt-6 h-32 overflow-hidden">
                          <img src={f.img} alt="" className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      )}
                      <span className="w-11 h-11 rounded-[12px] bg-[#F3F4F6] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[#0A0A0A]" strokeWidth={1.75} />
                      </span>
                      <h3 className="cc-display mt-5 text-[19px] font-semibold">{f.title}</h3>
                      <p className="mt-2 text-[15px] text-[#4B5563]">{f.copy}</p>
                    </div>
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 7 · Automation showcase ──────────────────────────────────────── */}
      <section id="automation" className="relative z-10 px-6 py-24 border-y border-[#E5E7EB]">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">Business logic, enforced</span>
            <h2 className="cc-display mt-3 text-[30px] sm:text-[38px] font-bold max-w-2xl">Statuses that update themselves.</h2>
          </Reveal>
          <div className="mt-12 flex flex-col md:flex-row md:items-stretch gap-3">
            {FLOW.map((step, i) => (
              <div key={i} className="flex items-center gap-3 md:flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.5, ease: EASE, delay: i * 0.12 }}
                  className={`flex-1 min-h-[64px] rounded-[12px] border px-4 py-3 flex items-center text-[14px] font-medium ${toneStyles[step.tone]}`}
                >
                  {step.tone === 'success' && <Check className="w-4 h-4 mr-2 shrink-0" />}
                  {step.label}
                </motion.div>
                {i < FLOW.length - 1 && <ArrowRight className="w-4 h-4 text-[#9CA3AF] shrink-0 rotate-90 md:rotate-0" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8 · Analytics teaser ─────────────────────────────────────────── */}
      <section id="analytics" className="relative z-10 px-6 py-28">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-14 items-center">
          <Reveal>
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">Analytics</span>
            <h2 className="cc-display mt-3 text-[32px] sm:text-[40px] font-bold">Know your fleet's real cost — and its real return.</h2>
            <p className="mt-5 text-[16px] text-[#4B5563] max-w-md">
              Fuel efficiency, utilization, and per-vehicle ROI, computed from live trips and logs.
              Exportable the moment you need to answer for it.
            </p>
            <button onClick={onEnter} className="cc-btn mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:gap-2.5 transition-all">
              See the analytics <ArrowUpRight className="w-4 h-4" />
            </button>
          </Reveal>
          <Reveal delay={0.08}>
            <TiltCard>
              <div className="rounded-[20px] border border-[#E5E7EB] bg-white cc-shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-[13px] text-[#6B7280]">Fleet utilization</div>
                    <div className="cc-display text-[26px] font-bold"><CountUp to={84} suffix="%" /></div>
                  </div>
                  <span className="text-[12px] font-medium text-[#059669] bg-[#ECFDF5] border border-[#C7F0DC] px-2.5 py-1 rounded-full">+6% MoM</span>
                </div>
                <svg viewBox="0 0 400 180" className="w-full" fill="none">
                  {[0, 45, 90, 135, 180].map((y) => <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#F1F3F5" strokeWidth="1" />)}
                  <defs>
                    <linearGradient id="ccArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={ACCENT} stopOpacity="0.14" />
                      <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <motion.path d="M0 130 C 60 120, 100 96, 160 92 S 280 66, 400 44 L400 180 L0 180 Z" fill="url(#ccArea)"
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.5 }} />
                  <motion.path d="M0 130 C 60 120, 100 96, 160 92 S 280 66, 400 44" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round"
                    initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE }} />
                </svg>
                <div className="flex justify-between text-[11px] text-[#9CA3AF] mt-3 px-0.5">
                  {['Apr', 'May', 'Jun', 'Jul'].map((m) => <span key={m}>{m}</span>)}
                </div>
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </section>

      {/* ── 9 · Testimonial ──────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 pb-28">
        <Reveal>
          <div className="mx-auto max-w-4xl rounded-[20px] border border-[#E5E7EB] bg-white cc-shadow-md p-10 sm:p-14 text-center">
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />)}
            </div>
            <p className="cc-display text-[24px] sm:text-[30px] font-medium leading-snug text-[#0A0A0A]">
              "We retired three spreadsheets and a whiteboard in a week. Dispatch conflicts
              basically disappeared, and we finally trust our utilization numbers."
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <img src={IMG.avatar1} alt="" className="w-11 h-11 rounded-full object-cover" loading="lazy" />
              <div className="text-left">
                <div className="text-[14px] font-semibold">Priya Nair</div>
                <div className="text-[13px] text-[#6B7280]">Head of Operations, NorthFreight</div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── 10 · Closing CTA (dark + image + glow) ───────────────────────── */}
      <section id="pricing" className="relative z-10 px-6 pb-6">
        <Reveal>
          <div className="relative mx-auto max-w-6xl rounded-[20px] overflow-hidden text-white cc-shadow-lg">
            <img src={IMG.closing} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-[#0A0A0A]/80" />
            <div className="absolute -top-24 left-1/3 w-[420px] h-[420px] rounded-full bg-[#2563EB]/30 blur-[120px]" />
            <div className="relative px-8 sm:px-14 py-16 sm:py-24 text-center">
              <h2 className="cc-display text-[34px] sm:text-[48px] font-bold">Ready to run your fleet in focus?</h2>
              <p className="mt-4 text-[16px] text-white/60 max-w-lg mx-auto">
                Join logistics teams replacing spreadsheets with one precise command center.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Magnetic onClick={onEnter} className="min-h-[44px] px-7 rounded-[12px] bg-[#2563EB] text-white text-sm font-semibold inline-flex items-center gap-2">
                  Request a demo <ArrowRight className="w-4 h-4" />
                </Magnetic>
                <button onClick={onEnter} className="cc-btn min-h-[44px] px-7 rounded-[12px] bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/15 transition-colors">
                  Talk to an expert
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── 11 · Footer ──────────────────────────────────────────────────── */}
      <footer className="relative z-10 px-6 py-16">
        <div className="mx-auto max-w-6xl grid sm:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-[8px] bg-[#0A0A0A] flex items-center justify-center">
                <Truck className="w-[18px] h-[18px] text-white" strokeWidth={2} />
              </span>
              <span className="cc-display text-[18px] font-bold">FleetFlow</span>
            </div>
            <p className="mt-4 text-[13px] text-[#9CA3AF] max-w-[220px]">Smart transport operations for modern logistics teams.</p>
          </div>
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF] mb-4">Product</div>
            <ul className="space-y-3 text-[14px] text-[#4B5563]">
              {['Platform', 'Automation', 'Analytics', 'Pricing'].map((l) => (
                <li key={l}><a href={`#${l.toLowerCase()}`} className="hover:text-[#0A0A0A] transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF] mb-4">Company</div>
            <ul className="space-y-3 text-[14px] text-[#4B5563]">
              {['About', 'Customers', 'Security', 'Contact'].map((l) => (
                <li key={l}><a href="#" className="hover:text-[#0A0A0A] transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-6xl mt-12 pt-6 border-t border-[#E5E7EB] text-[12px] text-[#9CA3AF]">
          © 2026 FleetFlow Technologies Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
