/**
 * Licensing — neutralized 2026-06-11 (Phase 5 · BIZ-01).
 *
 * TukaPuka has NO plan tiers and NO usage limits. Payments happen offline:
 * the Guardian uploads a bank-transfer screenshot, the Tuka verifies it.
 * Every Tuka can create unlimited classes, sessions, and enrollments.
 *
 * The enforce* functions are kept as exported no-ops so any remaining call
 * site stays harmless. The DB `plan/max*` columns survive only because
 * dropping them needs a migration — application logic must ignore them.
 */

export async function enforcePukaLimit(_tenantId: string): Promise<void> { /* no limits */ }
// Legacy alias
export const enforceQuesterLimit = enforcePukaLimit

export async function enforceClassLimit(_tenantId: string): Promise<void> { /* no limits */ }

export async function enforceSessionLimit(_tenantId: string): Promise<void> { /* no limits */ }

/**
 * Generates the academy enrollment code Pukas/Guardians use at /waiting.
 * Format matches existing tenants and the /waiting hint: ZHI-<ts>-<RANDOM>.
 */
export function generateLicenseKey(): string {
  return `ZHI-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
}
