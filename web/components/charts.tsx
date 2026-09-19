import type { Candle } from "@/lib/types";

export function Sparkline({ history, className = "" }: { history: Candle[]; className?: string }) {
  if (history.length < 2) return <div className={className} />;
  const values = history.map((h) => h.yes_cents);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const w = 120;
  const h = 36;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  const up = values[values.length - 1] >= values[0];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} aria-hidden>
      <polyline
        fill="none"
        stroke={up ? "#6ec6f0" : "#f591b8"}
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
}

export function PriceChart({ history }: { history: Candle[] }) {
  if (history.length < 2) return null;
  const values = history.map((h) => h.yes_cents);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 100);
  const span = Math.max(1, max - min);
  const w = 640;
  const h = 280;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / span) * (h - 24) - 12;
    return [x, y] as const;
  });
  const line = points.map((p) => p.join(",")).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-[280px] w-full">
      <defs>
        <linearGradient id="yesFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#6ec6f0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#6ec6f0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill="url(#yesFill)" points={area} />
      <polyline fill="none" stroke="#6ec6f0" strokeWidth="3" points={line} />
    </svg>
  );
}
