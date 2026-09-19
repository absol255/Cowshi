// Betting rules shared by the trade ticket (client) and the trade server fn.

/** Smallest bet a user can place, in whole Macho Bucks. */
export const MIN_BET_MB = 1;

/** Starting Macho Bucks for a newly opened betting account. */
export const NEW_ACCOUNT_MB = 1500;

/** Smallest bank account number Cowshi will accept (market_maker is 999). */
export const MIN_BANK_ACCOUNT = 1000;

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

const digitsOnly = (value: string) => value.replace(/\D/g, "");

/** Parse a bank account number from a typed field. Empty → NaN. */
export function parseBankAccountNumber(raw: string): number {
  const digits = digitsOnly(raw).slice(0, 12);
  if (digits === "") return NaN;
  return Number(digits);
}

/** Returns an error message, or null when `value` is a valid Cowshi bank account number. */
export function validateBankAccountNumber(value: unknown): string | null {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "Enter your bank account number.";
  }
  if (!Number.isInteger(value)) return "Bank account numbers are whole numbers.";
  if (!Number.isSafeInteger(value)) return "That account number is too large.";
  if (value < MIN_BANK_ACCOUNT) return "Bank account numbers are at least 4 digits.";
  return null;
}

/** Handle for a new betting account. */
export function validateUsername(value: unknown): string | null {
  if (typeof value !== "string") return "Pick a handle.";
  const username = value.trim();
  if (username.length < 3) return "Handle must be at least 3 characters.";
  if (username.length > 64) return "Handle is too long.";
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(username)) {
    return "Handle must start with a letter and use only letters, numbers, and underscores.";
  }
  const taken = username.toLowerCase();
  if (taken === "market_maker" || taken === "admin") return "That handle is reserved.";
  return null;
}

export function digitsOnlyInput(value: string, max = 12) {
  return value.replace(/\D/g, "").slice(0, max);
}
