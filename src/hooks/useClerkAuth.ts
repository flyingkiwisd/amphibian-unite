'use client';

import { resolveTeamMember } from '@/lib/auth';

/**
 * Bridge between Clerk auth and the Amphibian Unite team member system.
 *
 * - When Clerk is configured: uses Clerk's useUser() to get email → maps to memberId
 * - When Clerk is NOT configured: returns inactive state (app uses profile selector)
 *
 * This hook dynamically imports Clerk to avoid errors when keys aren't set.
 */

const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

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

// We need conditional Clerk usage — only import when keys are present
let useClerkHook: () => ClerkAuthResult;

if (isClerkConfigured) {
  // Dynamic usage — this module path is resolved at build time
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const clerk = require('@clerk/nextjs');
  useClerkHook = function useClerkAuthWithClerk(): ClerkAuthResult {
    const { isLoaded, isSignedIn, user } = clerk.useUser();

    if (!isLoaded) {
      return { isClerkActive: true, clerkMemberId: null, isLoaded: false, displayName: null, email: null };
    }

    if (!isSignedIn || !user) {
      return { isClerkActive: true, clerkMemberId: null, isLoaded: true, displayName: null, email: null };
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
  };
} else {
  // No Clerk — return inactive state, app uses profile selector
  useClerkHook = function useClerkAuthWithoutClerk(): ClerkAuthResult {
    return {
      isClerkActive: false,
      clerkMemberId: null,
      isLoaded: true,
      displayName: null,
      email: null,
    };
  };
}

export const useClerkAuth = useClerkHook;
