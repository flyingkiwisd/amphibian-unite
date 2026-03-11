'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0e17',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* Background effects */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(20, 184, 166, 0.15), transparent),
            radial-gradient(ellipse 60% 40% at 80% 50%, rgba(99, 102, 241, 0.08), transparent),
            radial-gradient(ellipse 60% 40% at 20% 80%, rgba(139, 92, 246, 0.06), transparent)
          `,
        }}
      />

      {/* Grid overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(20, 184, 166, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(20, 184, 166, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 70%)',
        }}
      />

      {/* Logo and title */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', marginBottom: 32 }}>
        {/* Frog logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="32" cy="38" rx="18" ry="14" fill="url(#bodyGrad2)" opacity="0.9" />
            <ellipse cx="32" cy="28" rx="16" ry="12" fill="url(#headGrad2)" />
            <circle cx="22" cy="20" r="8" fill="url(#headGrad2)" />
            <circle cx="42" cy="20" r="8" fill="url(#headGrad2)" />
            <circle cx="22" cy="19" r="5" fill="#0a0e17" />
            <circle cx="22" cy="19" r="3.5" fill="#14b8a6" opacity="0.8" />
            <circle cx="23.5" cy="17.5" r="1.5" fill="white" opacity="0.9" />
            <circle cx="42" cy="19" r="5" fill="#0a0e17" />
            <circle cx="42" cy="19" r="3.5" fill="#14b8a6" opacity="0.8" />
            <circle cx="43.5" cy="17.5" r="1.5" fill="white" opacity="0.9" />
            <path d="M24 33 Q28 36 32 36 Q36 36 40 33" stroke="#0a0e17" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />
            <defs>
              <linearGradient id="bodyGrad2" x1="14" y1="24" x2="50" y2="52">
                <stop stopColor="#14b8a6" />
                <stop offset="1" stopColor="#0d9488" />
              </linearGradient>
              <linearGradient id="headGrad2" x1="16" y1="16" x2="48" y2="40">
                <stop stopColor="#2dd4bf" />
                <stop offset="1" stopColor="#14b8a6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: 5,
            marginBottom: 6,
            background: 'linear-gradient(135deg, #14b8a6, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          AMPHIBIAN UNITE
        </h1>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 3,
            textTransform: 'uppercase' as const,
            color: 'rgba(20, 184, 166, 0.6)',
          }}
        >
          10x Internal Operating System
        </p>
      </div>

      {/* Clerk SignIn component */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <SignIn
          appearance={{
            elements: {
              rootBox: {
                width: '100%',
                maxWidth: 440,
              },
              card: {
                backgroundColor: '#0f1423',
                border: '1px solid rgba(30, 41, 59, 0.8)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(20, 184, 166, 0.05)',
              },
              socialButtonsBlockButton: {
                backgroundColor: '#111827',
                border: '1px solid #1e293b',
                color: '#e2e8f0',
              },
              socialButtonsBlockButtonText: {
                color: '#e2e8f0',
              },
              dividerLine: {
                backgroundColor: '#1e293b',
              },
              dividerText: {
                color: '#64748b',
              },
              formFieldLabel: {
                color: '#94a3b8',
              },
              formFieldInput: {
                backgroundColor: '#111827',
                border: '1px solid #1e293b',
                color: '#e2e8f0',
              },
              formButtonPrimary: {
                background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)',
                color: '#ffffff',
                fontWeight: '600',
              },
              footerActionLink: {
                color: '#14b8a6',
              },
              footerActionText: {
                color: '#64748b',
              },
              headerTitle: {
                color: '#f1f5f9',
              },
              headerSubtitle: {
                color: '#94a3b8',
              },
              identityPreview: {
                backgroundColor: '#111827',
                border: '1px solid #1e293b',
              },
              identityPreviewText: {
                color: '#e2e8f0',
              },
              identityPreviewEditButton: {
                color: '#14b8a6',
              },
              otpCodeFieldInput: {
                backgroundColor: '#111827',
                border: '1px solid #1e293b',
                color: '#e2e8f0',
              },
              formResendCodeLink: {
                color: '#14b8a6',
              },
              alertText: {
                color: '#e2e8f0',
              },
            },
          }}
        />
      </div>

      {/* Footer */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          marginTop: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontSize: 10,
          color: 'rgba(148, 163, 184, 0.3)',
        }}
      >
        <span>Encrypted</span>
        <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(20, 184, 166, 0.4)' }} />
        <span>Internal Only</span>
        <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(20, 184, 166, 0.4)' }} />
        <span>AI-Powered</span>
      </div>
    </div>
  );
}
