export function formatMb(amount: number) {
  return `${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} MB`;
}

export function formatCents(cents: number) {
  return `${cents}¢`;
}

export function formatVolume(amount: number) {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M MB`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K MB`;
  return `${Math.round(amount)} MB`;
}

export function centsToMb(cents: number, qty: number) {
  return (cents / 100) * qty;
}

export function formatBankAccount(n: number) {
  return String(n);
}
