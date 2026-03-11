/**
 * Auth utilities — maps Clerk users to Amphibian Unite team members
 *
 * When a team member signs in via Clerk (email/password or magic link),
 * we look up their email to find their corresponding team member ID.
 * This ID feeds into the existing `currentUser` prop system across all 21 views.
 */

/**
 * Email-to-team-member mapping.
 * Update these when team members join or their emails change.
 * The key is the lowercase email, the value is the team member ID from data.ts.
 */
const emailToMemberMap: Record<string, string> = {
  // Founders & C-Suite
  'james@amphibiancapital.com': 'james',
  'jameshodges@gmail.com': 'james',
  'david@amphibiancapital.com': 'david',
  'mark@amphibiancapital.com': 'mark',
  'todd@amphibiancapital.com': 'todd',

  // Team
  'paola@amphibiancapital.com': 'paola',
  'andrew@amphibiancapital.com': 'andrew',
  'ty@amphibiancapital.com': 'ty',
  'ross@amphibiancapital.com': 'ross',
  'thao@amphibiancapital.com': 'thao',
  'timon@amphibiancapital.com': 'timon',
  'sahir@amphibiancapital.com': 'sahir',
};

/**
 * Resolve a Clerk user to a team member ID.
 *
 * Checks primary email first, then falls back to Clerk publicMetadata.memberId.
 * Returns null if the user isn't a recognized team member.
 */
export function resolveTeamMember(
  emailAddress: string | null | undefined,
  publicMetadata?: Record<string, unknown>
): string | null {
  // 1. Check email mapping
  if (emailAddress) {
    const normalized = emailAddress.toLowerCase().trim();
    const memberId = emailToMemberMap[normalized];
    if (memberId) return memberId;
  }

  // 2. Check Clerk publicMetadata (set via Clerk dashboard or API)
  if (publicMetadata?.memberId && typeof publicMetadata.memberId === 'string') {
    return publicMetadata.memberId;
  }

  return null;
}

/**
 * Check if Clerk auth is configured (keys are present).
 * When false, the app falls back to the profile selector (dev mode).
 */
export function isClerkConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
}

/**
 * All valid team member IDs (for validation)
 */
export const validMemberIds = [
  'james', 'david', 'mark', 'todd', 'paola', 'andrew',
  'ty', 'ross', 'thao', 'timon', 'sahir', 'nicole', 'nick',
] as const;

export type MemberId = (typeof validMemberIds)[number];
