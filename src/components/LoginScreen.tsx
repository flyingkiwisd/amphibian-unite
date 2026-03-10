'use client';

import { useState } from 'react';
import { Lock, Zap, Shield, Fingerprint } from 'lucide-react';
import { teamMembers } from '@/lib/data';

interface LoginScreenProps {
  onLogin: (userId: string) => void;
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

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [clickedUser, setClickedUser] = useState<string | null>(null);

  const activeMembers = teamMembers.filter((m) => m.status === 'active');
  const hiringMembers = teamMembers.filter((m) => m.status === 'hiring');
  const allMembers = [...activeMembers, ...hiringMembers];
  const founderCount = 3;
  const hoveredMember = teamMembers.find((m) => m.id === hoveredUser);

  const handleLogin = (userId: string) => {
    setClickedUser(userId);
    setTimeout(() => {
      onLogin(userId);
    }, 600);
  };

  const getHexColor = (twClass: string) => tailwindColorMap[twClass] || '#14b8a6';

  return (
    <div className="login-screen">
      <style jsx>{`
        .login-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0e17;
          position: relative;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
        }

        /* Animated gradient background */
        .login-screen::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(20, 184, 166, 0.15), transparent),
            radial-gradient(ellipse 60% 40% at 80% 50%, rgba(99, 102, 241, 0.08), transparent),
            radial-gradient(ellipse 60% 40% at 20% 80%, rgba(139, 92, 246, 0.06), transparent);
          animation: bgPulse 8s ease-in-out infinite alternate;
        }

        @keyframes bgPulse {
          0% { opacity: 0.6; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.05); }
        }

        /* Grid pattern overlay */
        .login-screen::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(20, 184, 166, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(20, 184, 166, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 70%);
        }

        /* Floating orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: float 12s ease-in-out infinite;
        }

        .orb-1 {
          width: 400px;
          height: 400px;
          background: rgba(20, 184, 166, 0.08);
          top: -10%;
          right: -5%;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 300px;
          height: 300px;
          background: rgba(99, 102, 241, 0.06);
          bottom: -5%;
          left: -5%;
          animation-delay: -4s;
        }

        .orb-3 {
          width: 200px;
          height: 200px;
          background: rgba(139, 92, 246, 0.05);
          top: 50%;
          left: 60%;
          animation-delay: -8s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }

        .login-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 520px;
          margin: 0 20px;
          padding: 48px 40px 40px;
          background: rgba(15, 20, 35, 0.75);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(20, 184, 166, 0.12);
          border-radius: 24px;
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.03),
            0 25px 50px -12px rgba(0, 0, 0, 0.5),
            0 0 80px rgba(20, 184, 166, 0.04);
          animation: cardAppear 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes cardAppear {
          0% { opacity: 0; transform: translateY(30px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .logo-container {
          display: flex;
          justify-content: center;
          margin-bottom: 28px;
          animation: logoFloat 4s ease-in-out infinite;
        }

        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .logo-glow {
          position: relative;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-glow::before {
          content: '';
          position: absolute;
          inset: -8px;
          background: radial-gradient(circle, rgba(20, 184, 166, 0.2), transparent 70%);
          border-radius: 50%;
          animation: glowPulse 3s ease-in-out infinite;
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }

        .title {
          text-align: center;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: 6px;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #14b8a6, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          text-align: center;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(20, 184, 166, 0.6);
          margin-bottom: 6px;
        }

        .tagline {
          text-align: center;
          font-size: 12px;
          color: rgba(148, 163, 184, 0.5);
          margin-bottom: 36px;
          line-height: 1.6;
          font-style: italic;
          max-width: 340px;
          margin-left: auto;
          margin-right: auto;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(20, 184, 166, 0.15), transparent);
          margin-bottom: 28px;
        }

        .section-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(148, 163, 184, 0.4);
          margin-bottom: 20px;
        }

        .section-label svg {
          width: 12px;
          height: 12px;
          opacity: 0.5;
        }

        .avatar-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }

        .avatar-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 12px 4px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }

        .avatar-button:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.06);
          transform: translateY(-4px) scale(1.1);
        }

        .avatar-button.clicked {
          animation: avatarClick 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes avatarClick {
          0% { transform: scale(1); }
          30% { transform: scale(0.9); }
          60% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 0.5; }
        }

        .avatar-circle {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1px;
          color: white;
          position: relative;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .avatar-circle::before {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .avatar-button:hover .avatar-circle::before {
          border-color: currentColor;
          opacity: 0.3;
        }

        .avatar-button:hover .avatar-circle {
          transform: scale(1.1);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .avatar-name {
          font-size: 10px;
          font-weight: 500;
          color: rgba(148, 163, 184, 0.3);
          transition: all 0.3s ease;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 80px;
        }

        .avatar-button:hover .avatar-name {
          color: rgba(226, 232, 240, 0.8);
        }

        .avatar-short-role {
          font-size: 9px;
          font-weight: 500;
          color: rgba(148, 163, 184, 0.25);
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 80px;
          margin-top: -4px;
          transition: all 0.3s ease;
        }

        .avatar-button:hover .avatar-short-role {
          color: rgba(20, 184, 166, 0.6);
        }

        .status-indicator {
          position: absolute;
          top: 10px;
          right: calc(50% - 30px);
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid rgba(15, 20, 35, 0.9);
          z-index: 5;
        }

        .status-active {
          background: #22c55e;
          box-shadow: 0 0 6px rgba(34, 197, 94, 0.5);
        }

        .status-hiring {
          background: #6b7280;
          box-shadow: 0 0 6px rgba(107, 114, 128, 0.3);
        }

        .hiring-badge {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: rgba(251, 191, 36, 0.9);
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.2);
          border-radius: 4px;
          padding: 1px 5px;
          margin-top: -2px;
        }

        .hover-preview {
          margin-top: -8px;
          margin-bottom: 20px;
          min-height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hover-preview-card {
          width: 100%;
          padding: 14px 18px;
          background: rgba(20, 184, 166, 0.04);
          border: 1px solid rgba(20, 184, 166, 0.1);
          border-radius: 12px;
          animation: previewAppear 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes previewAppear {
          0% { opacity: 0; transform: translateY(-4px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .hover-preview-name {
          font-size: 14px;
          font-weight: 700;
          color: rgba(226, 232, 240, 0.95);
          margin-bottom: 2px;
        }

        .hover-preview-role {
          font-size: 11px;
          font-weight: 600;
          color: rgba(20, 184, 166, 0.7);
          margin-bottom: 6px;
        }

        .hover-preview-desc {
          font-size: 11px;
          color: rgba(148, 163, 184, 0.6);
          line-height: 1.5;
        }

        .hover-preview-empty {
          font-size: 11px;
          color: rgba(148, 163, 184, 0.2);
          font-style: italic;
          text-align: center;
        }

        .stats-line {
          text-align: center;
          font-size: 11px;
          color: rgba(148, 163, 184, 0.35);
          margin-bottom: 28px;
          margin-top: -8px;
          line-height: 1.5;
        }

        .stats-line .stats-separator {
          display: inline-block;
          margin: 0 6px;
          color: rgba(20, 184, 166, 0.3);
        }

        .avatar-role {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          padding: 6px 12px;
          background: rgba(15, 20, 35, 0.95);
          border: 1px solid rgba(20, 184, 166, 0.2);
          border-radius: 8px;
          font-size: 11px;
          color: rgba(226, 232, 240, 0.9);
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: all 0.2s ease;
          z-index: 20;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .avatar-button:hover .avatar-role {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        .footer-badges {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }

        .badge {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 500;
          color: rgba(148, 163, 184, 0.3);
          letter-spacing: 0.5px;
        }

        .badge svg {
          width: 11px;
          height: 11px;
          opacity: 0.4;
        }

        .badge-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(20, 184, 166, 0.4);
          animation: dotPulse 2s ease-in-out infinite;
        }

        @keyframes dotPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        /* Scanline effect for that terminal feel */
        .scanline {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(20, 184, 166, 0.06), transparent);
          animation: scanMove 6s linear infinite;
          pointer-events: none;
          z-index: 15;
        }

        @keyframes scanMove {
          0% { top: -2px; }
          100% { top: 100%; }
        }
      `}</style>

      {/* Floating orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Main card */}
      <div className="login-card">
        <div className="scanline" />

        {/* Logo */}
        <div className="logo-container">
          <div className="logo-glow">
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Frog body */}
              <ellipse cx="32" cy="38" rx="18" ry="14" fill="url(#bodyGrad)" opacity="0.9" />
              {/* Frog head */}
              <ellipse cx="32" cy="28" rx="16" ry="12" fill="url(#headGrad)" />
              {/* Left eye bump */}
              <circle cx="22" cy="20" r="8" fill="url(#headGrad)" />
              {/* Right eye bump */}
              <circle cx="42" cy="20" r="8" fill="url(#headGrad)" />
              {/* Left eye */}
              <circle cx="22" cy="19" r="5" fill="#0a0e17" />
              <circle cx="22" cy="19" r="3.5" fill="#14b8a6" opacity="0.8" />
              <circle cx="23.5" cy="17.5" r="1.5" fill="white" opacity="0.9" />
              {/* Right eye */}
              <circle cx="42" cy="19" r="5" fill="#0a0e17" />
              <circle cx="42" cy="19" r="3.5" fill="#14b8a6" opacity="0.8" />
              <circle cx="43.5" cy="17.5" r="1.5" fill="white" opacity="0.9" />
              {/* Mouth - subtle smile */}
              <path
                d="M24 33 Q28 36 32 36 Q36 36 40 33"
                stroke="#0a0e17"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                opacity="0.4"
              />
              {/* Nostrils */}
              <circle cx="28" cy="27" r="1" fill="#0a0e17" opacity="0.3" />
              <circle cx="36" cy="27" r="1" fill="#0a0e17" opacity="0.3" />
              {/* Left front leg */}
              <path
                d="M16 40 Q10 44 8 48 Q12 48 16 46"
                fill="url(#legGrad)"
                opacity="0.7"
              />
              {/* Right front leg */}
              <path
                d="M48 40 Q54 44 56 48 Q52 48 48 46"
                fill="url(#legGrad)"
                opacity="0.7"
              />
              {/* Left back leg */}
              <path
                d="M18 48 Q12 54 10 58 Q16 56 20 52"
                fill="url(#legGrad)"
                opacity="0.6"
              />
              {/* Right back leg */}
              <path
                d="M46 48 Q52 54 54 58 Q48 56 44 52"
                fill="url(#legGrad)"
                opacity="0.6"
              />
              <defs>
                <linearGradient id="bodyGrad" x1="14" y1="24" x2="50" y2="52">
                  <stop stopColor="#14b8a6" />
                  <stop offset="1" stopColor="#0d9488" />
                </linearGradient>
                <linearGradient id="headGrad" x1="16" y1="16" x2="48" y2="40">
                  <stop stopColor="#2dd4bf" />
                  <stop offset="1" stopColor="#14b8a6" />
                </linearGradient>
                <linearGradient id="legGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop stopColor="#14b8a6" />
                  <stop offset="1" stopColor="#0d9488" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="title">AMPHIBIAN UNITE</h1>
        <p className="subtitle">10x Internal Operating System</p>
        <p className="tagline">
          Built to thrive in uncertain times. Aligned with what outlives us.
        </p>

        <div className="divider" />

        {/* Section label */}
        <div className="section-label">
          <Fingerprint size={12} />
          <span>Select your profile to continue</span>
        </div>

        {/* Avatar grid */}
        <div className="avatar-grid">
          {allMembers.map((member) => {
            const hex = getHexColor(member.color);
            return (
              <button
                key={member.id}
                className={`avatar-button ${clickedUser === member.id ? 'clicked' : ''}`}
                onClick={() => handleLogin(member.id)}
                onMouseEnter={() => setHoveredUser(member.id)}
                onMouseLeave={() => setHoveredUser(null)}
              >
                <div className="avatar-role">{member.shortRole}</div>
                <div className={`status-indicator ${member.status === 'active' ? 'status-active' : 'status-hiring'}`} />
                <div
                  className="avatar-circle"
                  style={{
                    background: `linear-gradient(135deg, ${hex}, ${hex}cc)`,
                    color: hex,
                    opacity: member.status === 'hiring' ? 0.6 : 1,
                  }}
                >
                  <span style={{ color: 'white' }}>{member.avatar}</span>
                </div>
                <span className="avatar-name">
                  {member.name.split(' ')[0]}
                </span>
                {member.status === 'hiring' ? (
                  <span className="hiring-badge">Hiring</span>
                ) : (
                  <span className="avatar-short-role">{member.shortRole}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Hover preview card */}
        <div className="hover-preview">
          {hoveredMember ? (
            <div className="hover-preview-card" key={hoveredMember.id}>
              <div className="hover-preview-name">{hoveredMember.name}</div>
              <div className="hover-preview-role">{hoveredMember.role}</div>
              <div className="hover-preview-desc">{hoveredMember.roleOneSentence}</div>
            </div>
          ) : (
            <div className="hover-preview-empty">Hover over a profile to see details</div>
          )}
        </div>

        {/* Quick stats line */}
        <div className="stats-line">
          {teamMembers.length} team members
          <span className="stats-separator">&middot;</span>
          {founderCount} founders
          <span className="stats-separator">&middot;</span>
          Building the future of crypto fund management
        </div>

        {/* Footer badges */}
        <div className="footer-badges">
          <div className="badge">
            <Shield size={11} />
            <span>Encrypted</span>
          </div>
          <div className="badge-dot" />
          <div className="badge">
            <Lock size={11} />
            <span>Internal Only</span>
          </div>
          <div className="badge-dot" />
          <div className="badge">
            <Zap size={11} />
            <span>AI-Powered</span>
          </div>
        </div>
      </div>
    </div>
  );
}
