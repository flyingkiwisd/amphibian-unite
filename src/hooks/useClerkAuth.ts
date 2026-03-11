'use client';

import { useState, useEffect } from 'react';
import { resolveTeamMember } from '@/lib/auth';

/**
 * Bridge between Clerk auth and the Amphibian Unite team member system.
 *
 * - When Clerk is configured: uses Clerk's useUser() to get email → maps to memberId
 * - When Clerk is NOT configured: returns inactive state (app uses profile selector)
 *
 * This hook safely handles SSR/prerendering by deferring Clerk usage to the client.
 */

const isClerkConfigured = typeof window !== 'undefined'
  ? !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  : !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

interface ClerkAuthResult {
  /** Whether Clerk auth is active (keys configured + user session exists) */
  isClerkActive: boolean;
  /** The resolved team member ID (e.g., 'james', 'todd') or null */
  clerkMemberId: string | null;
  /** Whether Clerk has finished loading */
  isLoaded: boolean;
  /** The user's display name from Clerk */
  displayName: string | null;
  /** The user's email from Clerk */
  email: string | null;
}

const INACTIVE_STATE: ClerkAuthResult = {
  isClerkActive: false,
  clerkMemberId: null,
  isLoaded: true,
  displayName: null,
  email: null,
};

const LOADING_STATE: ClerkAuthResult = {
  isClerkActive: true,
  clerkMemberId: null,
  isLoaded: false,
  displayName: null,
  email: null,
};

/**
 * Safe wrapper that uses Clerk only on the client side.
 * During SSR/prerendering, returns loading state to avoid ClerkProvider errors.
 */
export function useClerkAuth(): ClerkAuthResult {
  const [result, setResult] = useState<ClerkAuthResult>(
    isClerkConfigured ? LOADING_STATE : INACTIVE_STATE
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // When Clerk is not configured, always return inactive
  if (!isClerkConfigured) {
    return INACTIVE_STATE;
  }

  // Before mount (SSR/prerender), return loading to avoid useUser() outside provider
  if (!mounted) {
    return LOADING_STATE;
  }

  // On the client, use the actual Clerk hook via the inner component
  return useClerkAuthClient();
}

/**
 * Inner hook that actually calls Clerk's useUser().
 * Only called on the client after mount, so ClerkProvider is guaranteed.
 */
function useClerkAuthClient(): ClerkAuthResult {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const clerk = require('@clerk/nextjs');
    const { isLoaded, isSignedIn, user } = clerk.useUser();

    if (!isLoaded) {
      return LOADING_STATE;
    }

    if (!isSignedIn || !user) {
      return {
        isClerkActive: true,
        clerkMemberId: null,
        isLoaded: true,
        displayName: null,
        email: null,
      };
    }

    const email = user.primaryEmailAddress?.emailAddress ?? null;
    const displayName = user.fullName ?? user.firstName ?? null;
    const memberId = resolveTeamMember(email, user.publicMetadata as Record<string, unknown>);

    return {
      isClerkActive: true,
      clerkMemberId: memberId,
      isLoaded: true,
      displayName,
      email,
    };
  } catch {
    // If Clerk throws (e.g., no provider), fall back gracefully
    return INACTIVE_STATE;
  }
}
