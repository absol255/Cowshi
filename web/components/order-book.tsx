import { formatCents } from "@/lib/format";
import type { BookLevel } from "@/lib/types";

export function OrderBook({ yes, no }: { yes: BookLevel[]; no: BookLevel[] }) {
  const max = Math.max(1, ...yes.map((l) => l.size), ...no.map((l) => l.size));
  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <BookColumn title="Yes bids" color="yes" levels={yes} max={max} />
      <BookColumn title="No bids" color="no" levels={no} max={max} />
    </div>
  );
}

function BookColumn({
  title,
  color,
  levels,
  max,
}: {
  title: string;
  color: "yes" | "no";
  levels: BookLevel[];
  max: number;
}) {
  const bar = color === "yes" ? "bg-yes/40" : "bg-no/50";
  const text = color === "yes" ? "text-yes-text" : "text-no-text";
  return (
    <div>
      <div className="mb-2 flex justify-between text-[11px] uppercase tracking-wide text-muted">
        <span>{title}</span>
        <span>Size</span>
      </div>
      <div className="space-y-1">
        {levels.map((level) => (
          <div key={`${title}-${level.price_cents}`} className="relative overflow-hidden rounded-md">
            <div
              className={`absolute inset-y-0 right-0 ${bar}`}
              style={{ width: `${(level.size / max) * 100}%` }}
            />
            <div className="relative flex justify-between px-2 py-1 font-mono">
              <span className={text}>{formatCents(level.price_cents)}</span>
              <span>{level.size}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
