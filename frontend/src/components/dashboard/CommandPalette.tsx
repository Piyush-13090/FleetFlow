import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  CornerDownLeft,
  Truck,
  Users,
  Route,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { NAV_GROUPS } from './CommandCenterSidebar';

interface CommandItem {
  id: string;
  group: string;
  label: string;
  sublabel?: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  run: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tabId: string) => void;
  onQuickAction: (type: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onQuickAction,
}) => {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [entities, setEntities] = useState<{ vehicles: any[]; drivers: any[]; trips: any[] }>({
    vehicles: [],
    drivers: [],
    trips: [],
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Fetch searchable entities when opened
  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setActive(0);
    setTimeout(() => inputRef.current?.focus(), 40);
    (async () => {
      try {
        const [v, d, t] = await Promise.all([
          fetch('/api/fleet/vehicles').then((r) => (r.ok ? r.json() : [])),
          fetch('/api/fleet/drivers').then((r) => (r.ok ? r.json() : [])),
          fetch('/api/fleet/trips').then((r) => (r.ok ? r.json() : [])),
        ]);
        setEntities({ vehicles: v || [], drivers: d || [], trips: t || [] });
      } catch {
        /* offline — sections + actions still work */
      }
    })();
  }, [isOpen]);

  const items: CommandItem[] = useMemo(() => {
    const go = (id: string) => () => {
      onNavigate(id);
      onClose();
    };
    const act = (type: string) => () => {
      onQuickAction(type);
      onClose();
    };

    const sections: CommandItem[] = NAV_GROUPS.flatMap((g) =>
      g.items.map((it) => ({
        id: `nav-${it.id}`,
        group: 'Navigate',
        label: it.label,
        sublabel: g.label,
        icon: it.icon,
        run: go(it.id),
      }))
    );

    const actions: CommandItem[] = [
      { id: 'act-trip', group: 'Quick actions', label: 'New Trip', sublabel: 'Dispatch a vehicle & driver', icon: Plus, run: act('trip') },
      { id: 'act-vehicle', group: 'Quick actions', label: 'New Vehicle', sublabel: 'Register an asset', icon: Plus, run: act('vehicle') },
      { id: 'act-driver', group: 'Quick actions', label: 'New Driver', sublabel: 'Enroll a driver', icon: Plus, run: act('driver') },
    ];

    const vehicles: CommandItem[] = entities.vehicles.map((v) => ({
      id: `veh-${v.registrationNumber}`,
      group: 'Vehicles',
      label: `${v.name} (#${v.registrationNumber})`,
      sublabel: `${v.type} · ${v.status}`,
      icon: Truck,
      run: go('vehicles'),
    }));

    const drivers: CommandItem[] = entities.drivers.map((d) => ({
      id: `drv-${d.id}`,
      group: 'Drivers',
      label: d.name,
      sublabel: `${d.licenseNumber} · ${d.status}`,
      icon: Users,
      run: go('drivers'),
    }));

    const trips: CommandItem[] = entities.trips.map((t) => ({
      id: `trip-${t.id}`,
      group: 'Trips',
      label: `${t.id} — ${t.route}`,
      sublabel: `${t.driver} · ${t.status}`,
      icon: Route,
      run: go('trips'),
    }));

    return [...actions, ...sections, ...vehicles, ...drivers, ...trips];
  }, [entities, onNavigate, onQuickAction, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) => it.label.toLowerCase().includes(q) || it.sublabel?.toLowerCase().includes(q) || it.group.toLowerCase().includes(q)
    );
  }, [items, query]);

  // Group filtered results preserving order
  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    filtered.forEach((it) => {
      if (!map.has(it.group)) map.set(it.group, []);
      map.get(it.group)!.push(it);
    });
    return Array.from(map.entries());
  }, [filtered]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        filtered[active]?.run();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, filtered, active, onClose]);

  // Keep active item in view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  let flatIndex = -1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-[#0A0F1E]/40 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
            className="cc-body fixed left-1/2 top-[12vh] -translate-x-1/2 z-[71] w-[92vw] max-w-[560px] bg-white border border-[#E5E7EB] rounded-[16px] cc-shadow-lg overflow-hidden"
            role="dialog"
            aria-label="Command palette"
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 h-14 border-b border-[#EEF1F4]">
              <Search className="w-4.5 h-4.5 text-[#9CA3AF]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sections, vehicles, drivers, trips…"
                className="flex-1 bg-transparent outline-none text-[15px] text-[#0A0A0A] placeholder-[#9CA3AF]"
              />
              <kbd className="text-[10px] font-semibold text-[#9CA3AF] bg-[#F3F4F6] border border-[#E5E7EB] rounded-md px-1.5 py-0.5">ESC</kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[52vh] overflow-y-auto py-2">
              {filtered.length === 0 && (
                <div className="px-4 py-10 text-center text-[13px] text-[#9CA3AF]">No results for “{query}”.</div>
              )}
              {grouped.map(([group, groupItems]) => (
                <div key={group} className="px-2 pb-1">
                  <div className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">{group}</div>
                  {groupItems.map((it) => {
                    flatIndex += 1;
                    const idx = flatIndex;
                    const Icon = it.icon;
                    const isActive = idx === active;
                    return (
                      <button
                        key={it.id}
                        data-idx={idx}
                        onMouseEnter={() => setActive(idx)}
                        onClick={() => it.run()}
                        className={`w-full flex items-center gap-3 px-2.5 h-11 rounded-[10px] text-left transition-colors ${
                          isActive ? 'bg-[#EFF4FF]' : 'hover:bg-[#F9FAFB]'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 ${isActive ? 'bg-white text-[#2563EB]' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
                          <Icon className="w-4 h-4" strokeWidth={1.9} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block text-[14px] font-medium truncate ${isActive ? 'text-[#2563EB]' : 'text-[#0A0A0A]'}`}>{it.label}</span>
                          {it.sublabel && <span className="block text-[11px] text-[#9CA3AF] truncate">{it.sublabel}</span>}
                        </span>
                        {isActive ? (
                          <CornerDownLeft className="w-4 h-4 text-[#2563EB] shrink-0" />
                        ) : (
                          <ArrowRight className="w-4 h-4 text-[#D1D5DB] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Footer hint */}
            <div className="flex items-center gap-4 px-4 h-10 border-t border-[#EEF1F4] text-[11px] text-[#9CA3AF]">
              <span className="flex items-center gap-1"><kbd className="bg-[#F3F4F6] border border-[#E5E7EB] rounded px-1">↑</kbd><kbd className="bg-[#F3F4F6] border border-[#E5E7EB] rounded px-1">↓</kbd> navigate</span>
              <span className="flex items-center gap-1"><kbd className="bg-[#F3F4F6] border border-[#E5E7EB] rounded px-1">↵</kbd> select</span>
              <span className="ml-auto tabular-nums">{filtered.length} results</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
