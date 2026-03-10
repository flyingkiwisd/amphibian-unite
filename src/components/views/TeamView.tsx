'use client';

import { useState } from 'react';
import {
  User,
  Target,
  Shield,
  FileDown,
  X,
  CheckCircle,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import { teamMembers } from '@/lib/data';
import type { TeamMember } from '@/lib/data';

export function TeamView() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  return (
    <div className="animate-fade-in">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">
          Team Operating Systems
        </h1>
        <p className="mt-2 text-text-secondary text-base">
          Every person&apos;s 1-pager &mdash; roles, responsibilities, decision rights, and non-negotiables
        </p>
      </div>

      {/* ── Team Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {teamMembers.map((member, index) => (
          <button
            key={member.id}
            onClick={() => setSelectedMember(member)}
            className="glow-card group text-left rounded-xl border border-border bg-surface p-5 transition-all duration-300 hover:border-accent/40 hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-accent/50"
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: 'backwards',
            }}
          >
            <div className="flex items-start gap-3.5">
              {/* Avatar */}
              <div
                className={`${member.color} flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg`}
              >
                {member.avatar}
              </div>

              <div className="min-w-0 flex-1">
                {/* Name + Status */}
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-text-primary">
                    {member.name}
                  </h3>
                  {member.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                      <AlertCircle size={10} />
                      Hiring
                    </span>
                  )}
                </div>

                {/* Role */}
                <p className="mt-0.5 text-xs font-medium text-accent">
                  {member.role}
                </p>

                {/* One-sentence description (truncated) */}
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-text-muted">
                  {member.roleOneSentence}
                </p>
              </div>
            </div>

            {/* Subtle expand hint */}
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-text-muted opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <Briefcase size={12} />
              Click to view full operating system
            </div>
          </button>
        ))}
      </div>

      {/* ── Selected Member Detail Panel (Overlay) ── */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMember(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" />

          {/* Detail Card */}
          <div
            className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute right-4 top-4 z-20 rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-3 hover:text-text-primary"
            >
              <X size={20} />
            </button>

            {/* Detail Header */}
            <div className="border-b border-border p-6 pb-5">
              <div className="flex items-center gap-4">
                <div
                  className={`${selectedMember.color} flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold text-white shadow-xl`}
                >
                  {selectedMember.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-bold text-text-primary">
                      {selectedMember.name}
                    </h2>
                    {selectedMember.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                        <AlertCircle size={11} />
                        Hiring
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm font-medium text-accent">
                    {selectedMember.role}
                  </p>
                </div>
              </div>

              {/* Full role description */}
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                {selectedMember.roleOneSentence}
              </p>
            </div>

            {/* Detail Body */}
            <div className="space-y-6 p-6">
              {/* Single-Threaded Ownership */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
                    <User size={15} className="text-accent" />
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                    Single-Threaded Ownership
                  </h3>
                </div>
                <ul className="space-y-2 pl-1">
                  {selectedMember.singleThreadedOwnership.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle
                        size={14}
                        className="mt-0.5 flex-shrink-0 text-accent"
                      />
                      <span className="text-sm leading-relaxed text-text-secondary">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* KPIs */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
                    <Target size={15} className="text-blue-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                    KPIs
                  </h3>
                </div>
                <ul className="space-y-2 pl-1">
                  {selectedMember.kpis.map((kpi, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="mt-1 flex-shrink-0">
                        <div className="h-2.5 w-2.5 rounded-full border-2 border-blue-400 bg-blue-400/20" />
                      </div>
                      <span className="text-sm leading-relaxed text-text-secondary">
                        {kpi}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Non-Negotiables */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10">
                    <Shield size={15} className="text-rose-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                    Non-Negotiables
                  </h3>
                </div>
                <ul className="space-y-2 pl-1">
                  {selectedMember.nonNegotiables.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Shield
                        size={14}
                        className="mt-0.5 flex-shrink-0 text-rose-400"
                      />
                      <span className="text-sm leading-relaxed text-text-secondary">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* Footer Action */}
            <div className="border-t border-border p-6">
              <button
                onClick={() => {
                  console.log(
                    `Downloading 1-pager PDF for ${selectedMember.name}...`
                  );
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all duration-200 hover:bg-accent-2 hover:shadow-accent/30 active:scale-[0.97]"
              >
                <FileDown size={16} />
                Download 1-Pager as PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
