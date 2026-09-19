import { H as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/charts-DA05kIYh.js
var import_jsx_runtime = require_jsx_runtime();
function Sparkline({ history, className = "" }) {
	if (history.length < 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className });
	const values = history.map((h) => h.yes_cents);
	const min = Math.min(...values);
	const max = Math.max(...values);
	const span = Math.max(1, max - min);
	const w = 120;
	const h = 36;
	const points = values.map((v, i) => {
		return `${i / (values.length - 1) * w},${h - (v - min) / span * 32 - 2}`;
	}).join(" ");
	const up = values[values.length - 1] >= values[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: `0 0 ${w} ${h}`,
		className,
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
			fill: "none",
			stroke: up ? "var(--yes)" : "var(--no-text)",
			strokeWidth: "2",
			points
		})
	});
}
function PriceChart({ history }) {
	if (history.length < 2) return null;
	const values = history.map((h) => h.yes_cents);
	const min = Math.min(...values, 0);
	const max = Math.max(...values, 100);
	const span = Math.max(1, max - min);
	const w = 640;
	const h = 280;
	const line = values.map((v, i) => {
		return [i / (values.length - 1) * w, h - (v - min) / span * 256 - 12];
	}).map((p) => p.join(",")).join(" ");
	const area = `0,${h} ${line} ${w},${h}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: `0 0 ${w} ${h}`,
		className: "h-[280px] w-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: "yesFill",
				x1: "0",
				x2: "0",
				y1: "0",
				y2: "1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "0%",
					stopColor: "var(--yes)",
					stopOpacity: "0.35"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "100%",
					stopColor: "var(--yes)",
					stopOpacity: "0"
				})]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
				fill: "url(#yesFill)",
				points: area
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
				fill: "none",
				stroke: "var(--yes)",
				strokeWidth: "3",
				points: line
			})
		]
	});
}
//#endregion
export { Sparkline as n, PriceChart as t };
