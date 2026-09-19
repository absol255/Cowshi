//#region node_modules/.nitro/vite/services/ssr/assets/rules-OkhjTODs.js
/** Starting Macho Bucks for a newly opened betting account. */
var NEW_ACCOUNT_MB = 1500;
/** Returns an error message, or null when `value` is a valid bet amount. */
function validateBetAmount(value) {
	if (typeof value !== "number" || Number.isNaN(value)) return "Enter how many Macho Bucks to bet.";
	if (!Number.isInteger(value)) return "Bets must be a whole number of Macho Bucks.";
	if (!Number.isSafeInteger(value)) return "That amount is too large.";
	if (value < 1) return `The minimum bet is 1 Macho Buck.`;
	return null;
}
/** Contracts are always whole numbers, at least 1. */
function validateContracts(value) {
	if (typeof value !== "number" || Number.isNaN(value)) return "Enter a number of contracts.";
	if (!Number.isInteger(value) || value < 1) return "Contracts must be a whole number, at least 1.";
	if (!Number.isSafeInteger(value)) return "That quantity is too large.";
	return null;
}
/** How many contracts a whole-MB bet buys at a limit price (never spends more than the bet). */
function contractsForAmount(amountMb, limitCents) {
	return Math.floor(amountMb * 100 / limitCents);
}
var digitsOnly = (value) => value.replace(/\D/g, "");
/** Parse a bank account number from a typed field. Empty → NaN. */
function parseBankAccountNumber(raw) {
	const digits = digitsOnly(raw).slice(0, 12);
	if (digits === "") return NaN;
	return Number(digits);
}
/** Returns an error message, or null when `value` is a valid Cowshi bank account number. */
function validateBankAccountNumber(value) {
	if (typeof value !== "number" || Number.isNaN(value)) return "Enter your bank account number.";
	if (!Number.isInteger(value)) return "Bank account numbers are whole numbers.";
	if (!Number.isSafeInteger(value)) return "That account number is too large.";
	if (value < 1e3) return "Bank account numbers are at least 4 digits.";
	return null;
}
/** Handle for a new betting account. */
function validateUsername(value) {
	if (typeof value !== "string") return "Pick a handle.";
	const username = value.trim();
	if (username.length < 3) return "Handle must be at least 3 characters.";
	if (username.length > 64) return "Handle is too long.";
	if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(username)) return "Handle must start with a letter and use only letters, numbers, and underscores.";
	const taken = username.toLowerCase();
	if (taken === "market_maker" || taken === "admin") return "That handle is reserved.";
	return null;
}
function digitsOnlyInput(value, max = 12) {
	return value.replace(/\D/g, "").slice(0, max);
}
//#endregion
export { validateBankAccountNumber as a, validateUsername as c, parseBankAccountNumber as i, contractsForAmount as n, validateBetAmount as o, digitsOnlyInput as r, validateContracts as s, NEW_ACCOUNT_MB as t };
