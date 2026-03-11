import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
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
    colorPrimary: "#14b8a6",
    colorBackground: "#0f1423",
    colorInputBackground: "#111827",
    colorInputText: "#e2e8f0",
    colorText: "#e2e8f0",
    colorTextSecondary: "#94a3b8",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  },
  elements: {
    card: {
      backgroundColor: "rgba(15, 20, 35, 0.85)",
      backdropFilter: "blur(24px)",
      border: "1px solid rgba(20, 184, 166, 0.12)",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    },
    headerTitle: {
      color: "#e2e8f0",
    },
    headerSubtitle: {
      color: "#94a3b8",
    },
    formButtonPrimary: {
      background: "linear-gradient(135deg, #14b8a6, #0d9488)",
      border: "none",
      boxShadow: "0 4px 12px rgba(20, 184, 166, 0.3)",
    },
    footerActionLink: {
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
      {children}
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
