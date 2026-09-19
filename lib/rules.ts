// Betting rules shared by the trade ticket (client) and /api/trade (server).

/** Smallest bet a user can place, in whole Macho Bucks. */
export const MIN_BET_MB = 1;

/** Returns an error message, or null when `value` is a valid bet amount. */
export function validateBetAmount(value: unknown): string | null {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "Enter how many Macho Bucks to bet.";
  }
  if (!Number.isInteger(value)) return "Bets must be a whole number of Macho Bucks.";
  if (!Number.isSafeInteger(value)) return "That amount is too large.";
  if (value < MIN_BET_MB) return `The minimum bet is ${MIN_BET_MB} Macho Buck.`;
  return null;
}

/** Contracts are always whole numbers, at least 1. */
export function validateContracts(value: unknown): string | null {
  if (typeof value !== "number" || Number.isNaN(value)) return "Enter a number of contracts.";
  if (!Number.isInteger(value) || value < 1) return "Contracts must be a whole number, at least 1.";
  if (!Number.isSafeInteger(value)) return "That quantity is too large.";
  return null;
}

/** How many contracts a whole-MB bet buys at a limit price (never spends more than the bet). */
export function contractsForAmount(amountMb: number, limitCents: number): number {
  return Math.floor((amountMb * 100) / limitCents);
}
