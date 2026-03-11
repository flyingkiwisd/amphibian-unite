import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Amphibian Unite | 10x Internal Operating System",
  description: "The AI-native command center powering Amphibian Capital's path to $1B+ AUM. 14 intelligent agents orchestrating strategy, execution, and alignment.",
};

const clerkAppearance = {
  baseTheme: dark,
  variables: {
    // Core colors — using updated v7 variable names
    colorPrimary: "#14b8a6",
    colorDanger: "#ef4444",
    colorSuccess: "#22c55e",
    colorWarning: "#f59e0b",
    colorBackground: "#0a0e17",
    colorForeground: "#e2e8f0",
    colorMutedForeground: "#94a3b8",
    colorInputForeground: "#e2e8f0",
    colorInput: "#111827",
    colorNeutral: "#334155",
    colorBorder: "#1e293b",
    colorRing: "#14b8a6",
    colorShadow: "rgba(0, 0, 0, 0.4)",
    colorModalBackdrop: "rgba(0, 0, 0, 0.7)",
    // Typography
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    // Card / root container
    card: {
      backgroundColor: "#0f1423",
      border: "1px solid rgba(30, 41, 59, 0.8)",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(20, 184, 166, 0.05)",
    },
    // Header
    headerTitle: {
      color: "#f1f5f9",
    },
    headerSubtitle: {
      color: "#94a3b8",
    },
    // Social / OAuth buttons
    socialButtonsBlockButton: {
      backgroundColor: "#111827",
      border: "1px solid #1e293b",
      color: "#e2e8f0",
    },
    socialButtonsBlockButtonText: {
      color: "#e2e8f0",
    },
    // Divider / or separator
    dividerLine: {
      backgroundColor: "#1e293b",
    },
    dividerText: {
      color: "#64748b",
    },
    // Form fields
    formFieldLabel: {
      color: "#94a3b8",
    },
    formFieldInput: {
      backgroundColor: "#111827",
      border: "1px solid #1e293b",
      color: "#e2e8f0",
    },
    formFieldInputShowPasswordButton: {
      color: "#64748b",
    },
    // Primary button
    formButtonPrimary: {
      background: "linear-gradient(135deg, #14b8a6, #0d9488)",
      border: "none",
      boxShadow: "0 4px 12px rgba(20, 184, 166, 0.3)",
      color: "#ffffff",
      fontWeight: "600",
    },
    // Footer
    footerActionLink: {
      color: "#14b8a6",
    },
    footerActionText: {
      color: "#64748b",
    },
    // Badge / tag
    badge: {
      backgroundColor: "rgba(20, 184, 166, 0.15)",
      color: "#14b8a6",
      border: "1px solid rgba(20, 184, 166, 0.3)",
    },
    // Internal navigation / tabs
    navbarButton: {
      color: "#94a3b8",
    },
    navbarButtonIcon: {
      color: "#64748b",
    },
    // User button / profile
    userButtonBox: {
      color: "#e2e8f0",
    },
    userButtonOuterIdentifier: {
      color: "#e2e8f0",
    },
    userButtonPopoverCard: {
      backgroundColor: "#0f1423",
      border: "1px solid #1e293b",
    },
    userButtonPopoverActionButton: {
      color: "#e2e8f0",
    },
    userButtonPopoverActionButtonText: {
      color: "#e2e8f0",
    },
    userButtonPopoverActionButtonIcon: {
      color: "#94a3b8",
    },
    userButtonPopoverFooter: {
      borderTop: "1px solid #1e293b",
    },
    // Alerts / errors
    alertText: {
      color: "#e2e8f0",
    },
    // Identity preview (shows email during verification)
    identityPreview: {
      backgroundColor: "#111827",
      border: "1px solid #1e293b",
    },
    identityPreviewText: {
      color: "#e2e8f0",
    },
    identityPreviewEditButton: {
      color: "#14b8a6",
    },
    // OTP / verification code input
    otpCodeFieldInput: {
      backgroundColor: "#111827",
      border: "1px solid #1e293b",
      color: "#e2e8f0",
    },
    // Form resend code link
    formResendCodeLink: {
      color: "#14b8a6",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const body = (
    <body
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <ToastProvider>
        {children}
      </ToastProvider>
    </body>
  );

  // If Clerk is configured, wrap in ClerkProvider. Otherwise render raw (dev mode).
  if (hasClerk) {
    return (
      <html lang="en" className="dark">
        <ClerkProvider appearance={clerkAppearance}>
          {body}
        </ClerkProvider>
      </html>
    );
  }

  return (
    <html lang="en" className="dark">
      {body}
    </html>
  );
}
