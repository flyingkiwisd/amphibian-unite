'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Bot,
  Users,
  Target,
  CheckSquare,
  Map,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Scale,
  StickyNote,
  Search,
  DollarSign,
  Trophy,
  BookOpen,
  Settings,
  Check,
  ArrowRightLeft,
} from 'lucide-react';
import { teamMembers } from '@/lib/data';

type ViewType = 'dashboard' | 'agents' | 'team' | 'okrs' | 'tasks' | 'roadmap' | 'ai-edge' | 'decisions' | 'notes' | 'activity' | 'leaderboard' | 'accountability' | 'founder-alignment' | 'meeting-intel' | 'what-changed' | 'peer-feedback' | 'cash-runway' | 'lp-health' | 'competitive-intel' | 'knowledge-graph' | 'role-drift' | 'journal' | 'settings';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: ViewType) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentUser: string | null;
  onOpenSearch?: () => void;
  onSwitchProfile?: (userId: string) => void;
}

const tailwindColorMap: Record<string, string> = {
  'bg-teal-500': '#14b8a6',
  'bg-blue-500': '#3b82f6',
  'bg-amber-500': '#f59e0b',
  'bg-indigo-500': '#6366f1',
  'bg-rose-500': '#f43f5e',
  'bg-emerald-500': '#10b981',
  'bg-violet-500': '#8b5cf6',
  'bg-cyan-500': '#06b6d4',
  'bg-orange-500': '#f97316',
  'bg-sky-500': '#0ea5e9',
  'bg-lime-500': '#84cc16',
  'bg-pink-500': '#ec4899',
  'bg-purple-500': '#a855f7',
};

const navItems: { label: string; icon: React.ElementType; view: ViewType; group: number }[] = [
  // Core 7
  { label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard', group: 1 },
  { label: 'Tasks', icon: CheckSquare, view: 'tasks', group: 1 },
  { label: 'OKRs & KPIs', icon: Target, view: 'okrs', group: 1 },
  { label: 'Decisions', icon: Scale, view: 'decisions', group: 1 },
  { label: 'Journal', icon: BookOpen, view: 'journal', group: 1 },
  { label: 'Team', icon: Users, view: 'team', group: 1 },
  // More
  { label: 'Notes', icon: StickyNote, view: 'notes', group: 2 },
  { label: 'Roadmap', icon: Map, view: 'roadmap', group: 2 },
  { label: 'Cash Runway', icon: DollarSign, view: 'cash-runway', group: 2 },
  { label: 'Leaderboard', icon: Trophy, view: 'leaderboard', group: 2 },
  { label: 'Settings', icon: Settings, view: 'settings', group: 2 },
];

export function Sidebar({
  currentView,
  onViewChange,
  collapsed,
  onToggleCollapse,
  currentUser,
  onOpenSearch,
  onSwitchProfile,
}: SidebarProps) {
  const user = teamMembers.find((m) => m.id === currentUser);
  const initials = user?.avatar ?? '??';
  const userName = user?.name ?? 'Unknown';
  const userRole = user?.shortRole ?? '';

  const [showProfilePicker, setShowProfilePicker] = useState(false);
  const profilePickerRef = useRef<HTMLDivElement>(null);

  // Close profile picker when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profilePickerRef.current && !profilePickerRef.current.contains(e.target as Node)) {
        setShowProfilePicker(false);
      }
    }
    if (showProfilePicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showProfilePicker]);

  const activeMembers = teamMembers.filter((m) => m.status === 'active');

  const groups = [1, 2];

  return (
    <aside
      style={{
        width: collapsed ? 72 : 260,
        minWidth: collapsed ? 72 : 260,
        backgroundColor: '#111827',
        borderRight: '1px solid #1e293b',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
      }}
    >
      {/* Logo + Collapse Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '20px 0' : '20px 16px',
          borderBottom: '1px solid #1e293b',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <ellipse cx="16" cy="18" rx="11" ry="9" fill="#0d9488" />
            <circle cx="10" cy="10" r="5" fill="#14b8a6" />
            <circle cx="10" cy="10" r="3" fill="#111827" />
            <circle cx="11" cy="9" r="1" fill="#5eead4" />
            <circle cx="22" cy="10" r="5" fill="#14b8a6" />
            <circle cx="22" cy="10" r="3" fill="#111827" />
            <circle cx="23" cy="9" r="1" fill="#5eead4" />
            <path d="M10 21 Q16 25 22 21" stroke="#0f766e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
          {!collapsed && (
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: '#e2e8f0' }}>
              AMPHIBIAN UNITE
            </span>
          )}
        </div>
        {!collapsed && (
          <button onClick={onToggleCollapse} title="Collapse sidebar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', transition: 'background 0.15s, color 0.15s', flexShrink: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = '#e2e8f0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            <ChevronLeft size={18} />
          </button>
        )}
        {collapsed && (
          <button onClick={onToggleCollapse} title="Expand sidebar" style={{ position: 'absolute', top: 20, right: -12, width: 24, height: 24, borderRadius: '50%', backgroundColor: '#1e293b', border: '1px solid #334155', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', padding: 0, transition: 'background 0.15s, color 0.15s', zIndex: 60 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#334155'; e.currentTarget.style.color = '#e2e8f0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Search Button */}
      {onOpenSearch && (
        <div style={{ padding: collapsed ? '8px 12px' : '8px 16px', flexShrink: 0 }}>
          <button
            onClick={onOpenSearch}
            title={collapsed ? 'Search (Cmd+K)' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: collapsed ? '8px 0' : '8px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              border: '1px solid #1e293b',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              color: '#64748b',
              backgroundColor: '#0f172a',
              transition: 'border-color 0.15s, color 0.15s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#94a3b8'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#64748b'; }}
          >
            <Search size={16} style={{ flexShrink: 0 }} />
            {!collapsed && (
              <>
                <span style={{ flex: 1, textAlign: 'left' }}>Search...</span>
                <span style={{ fontSize: 11, backgroundColor: '#1e293b', borderRadius: 4, padding: '2px 6px', color: '#64748b' }}>
                  ⌘K
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: collapsed ? '8px 0' : '8px 8px' }}>
        {groups.map((group, gi) => (
          <React.Fragment key={group}>
            {gi > 0 && (
              <div style={{ height: 1, backgroundColor: '#1e293b', margin: collapsed ? '8px 12px' : '8px 8px' }} />
            )}
            {navItems
              .filter((item) => item.group === group)
              .map((item) => {
                const isActive = currentView === item.view;
                const Icon = item.icon;
                return (
                  <button
                    key={item.view}
                    onClick={() => onViewChange(item.view)}
                    title={collapsed ? item.label : undefined}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                      padding: collapsed ? '9px 0' : '9px 12px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      border: 'none',
                      borderLeft: isActive ? '3px solid #14b8a6' : '3px solid transparent',
                      borderRadius: collapsed ? 0 : '0 8px 8px 0',
                      cursor: 'pointer', fontSize: 13, fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#5eead4' : '#94a3b8',
                      backgroundColor: isActive ? 'rgba(20, 184, 166, 0.08)' : 'transparent',
                      boxShadow: isActive ? 'inset 0 0 20px rgba(20, 184, 166, 0.05)' : 'none',
                      transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
                      whiteSpace: 'nowrap', overflow: 'hidden', fontFamily: 'inherit', marginBottom: 1,
                    }}
                    onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = '#1e293b'; e.currentTarget.style.color = '#e2e8f0'; }}}
                    onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}}
                  >
                    <Icon size={18} style={{ flexShrink: 0 }} />
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
          </React.Fragment>
        ))}
      </nav>

      {/* User Section with Profile Switcher */}
      <div ref={profilePickerRef} style={{ position: 'relative', flexShrink: 0 }}>
        {/* Profile Picker Dropdown — appears above user section */}
        {showProfilePicker && onSwitchProfile && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#111827',
            border: '1px solid #1e293b',
            borderRadius: collapsed ? 8 : 12,
            marginBottom: 4,
            maxHeight: 360,
            overflowY: 'auto',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
            zIndex: 100,
            padding: '8px 0',
          }}>
            {!collapsed && (
              <div style={{ padding: '6px 16px 10px', borderBottom: '1px solid #1e293b', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ArrowRightLeft size={12} style={{ color: '#94a3b8' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Switch Profile</span>
                </div>
              </div>
            )}
            {activeMembers.map((member) => {
              const isCurrent = member.id === currentUser;
              const hexColor = tailwindColorMap[member.color] || '#14b8a6';
              return (
                <button
                  key={member.id}
                  onClick={() => {
                    if (!isCurrent) {
                      onSwitchProfile(member.id);
                    }
                    setShowProfilePicker(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: collapsed ? 0 : 10,
                    width: '100%',
                    padding: collapsed ? '8px 0' : '8px 16px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    border: 'none',
                    cursor: isCurrent ? 'default' : 'pointer',
                    fontSize: 13,
                    color: isCurrent ? '#5eead4' : '#94a3b8',
                    backgroundColor: isCurrent ? 'rgba(20, 184, 166, 0.08)' : 'transparent',
                    transition: 'background 0.15s, color 0.15s',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => { if (!isCurrent) { e.currentTarget.style.backgroundColor = '#1e293b'; e.currentTarget.style.color = '#e2e8f0'; }}}
                  onMouseLeave={(e) => { if (!isCurrent) { e.currentTarget.style.backgroundColor = isCurrent ? 'rgba(20, 184, 166, 0.08)' : 'transparent'; e.currentTarget.style.color = isCurrent ? '#5eead4' : '#94a3b8'; }}}
                  title={collapsed ? `${member.name} · ${member.shortRole}` : undefined}
                >
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${hexColor}88, ${hexColor})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#f0fdfa',
                    flexShrink: 0,
                  }}>
                    {member.avatar}
                  </div>
                  {!collapsed && (
                    <>
                      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                        <div style={{ fontSize: 13, fontWeight: isCurrent ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {member.name}
                        </div>
                        <div style={{ fontSize: 10, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {member.shortRole}
                        </div>
                      </div>
                      {isCurrent && (
                        <Check size={14} style={{ color: '#14b8a6', flexShrink: 0 }} />
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Clickable User Section */}
        <button
          onClick={() => onSwitchProfile && setShowProfilePicker(!showProfilePicker)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 12,
            width: '100%',
            padding: collapsed ? '16px 0' : '16px',
            border: 'none',
            borderTop: '1px solid #1e293b',
            cursor: onSwitchProfile ? 'pointer' : 'default',
            backgroundColor: showProfilePicker ? '#1e293b' : 'transparent',
            transition: 'background 0.15s',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => { if (onSwitchProfile) e.currentTarget.style.backgroundColor = '#1a2234'; }}
          onMouseLeave={(e) => { if (onSwitchProfile) e.currentTarget.style.backgroundColor = showProfilePicker ? '#1e293b' : 'transparent'; }}
          title={collapsed ? `${userName} · ${userRole} (click to switch)` : undefined}
        >
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #0d9488, #14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#f0fdfa', letterSpacing: '0.02em', boxShadow: '0 0 12px rgba(20, 184, 166, 0.25)' }}>
              {initials}
            </div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22c55e', border: '2px solid #111827' }} />
          </div>
          {!collapsed && (
            <>
              <div style={{ overflow: 'hidden', flex: 1, minWidth: 0, textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</span>
                  {userRole && (
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, backgroundColor: 'rgba(20, 184, 166, 0.15)', color: '#5eead4', border: '1px solid rgba(20, 184, 166, 0.3)', letterSpacing: '0.05em', flexShrink: 0 }}>
                      {userRole}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
                  Online
                </div>
              </div>
              {onSwitchProfile && (
                <ChevronUp size={14} style={{
                  color: '#64748b',
                  flexShrink: 0,
                  transition: 'transform 0.2s',
                  transform: showProfilePicker ? 'rotate(180deg)' : 'rotate(0deg)',
                }} />
              )}
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
