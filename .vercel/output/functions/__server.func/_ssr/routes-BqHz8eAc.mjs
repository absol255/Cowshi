import { H as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as formatVolume, i as Route$4, o as formatCents } from "./router-DiqUngFa.mjs";
import { n as Sparkline } from "./charts-DA05kIYh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BqHz8eAc.js
var import_jsx_runtime = require_jsx_runtime();
function MarketTable({ markets }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overflow-hidden rounded-2xl border border-line bg-surface",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "hidden grid-cols-[1.6fr_90px_90px_110px_120px_90px] gap-3 border-b border-line px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-muted md:grid",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Market" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Yes" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "No" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Volume" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "24h" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Close" })
			]
		}), markets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-4 py-8 text-sm text-muted",
			children: "No markets match that filter."
		}) : markets.map((market) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/markets/$ticker",
			params: { ticker: market.ticker },
			className: "grid grid-cols-1 gap-3 border-b border-line px-4 py-3 last:border-b-0 hover:bg-surface-2 md:grid-cols-[1.6fr_90px_90px_110px_120px_90px] md:items-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted",
						children: [
							market.event.category,
							" · ",
							market.event.title
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-medium",
						children: market.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-xs text-muted-2",
						children: market.ticker
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceChip, {
					side: "yes",
					cents: market.yes_price_cents
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceChip, {
					side: "no",
					cents: market.no_price_cents
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm text-muted tabular-nums",
					children: formatVolume(market.volume_macho_bucks)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkline, {
					history: market.history,
					className: "h-9 w-[120px]"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm text-muted",
					children: new Date(market.close_at).toLocaleDateString(void 0, {
						month: "short",
						day: "numeric"
					})
				})
			]
		}, market.ticker))]
	});
}
function PriceChip({ side, cents }) {
	const yes = side === "yes";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `inline-flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm font-semibold tabular-nums ${yes ? "bg-yes-soft text-yes-text" : "bg-no-soft text-no-text"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: yes ? "Yes" : "No" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatCents(cents) })]
	});
}
var categories = [
	"All",
	"Politics",
	"Sports",
	"Culture",
	"Campus",
	"Economics",
	"Weather"
];
function Home() {
	const search = Route$4.useSearch();
	const q = search.q ?? "";
	const cat = search.cat ?? "All";
	const markets = Route$4.useLoaderData();
	const filtered = markets.filter((market) => {
		const hay = `${market.title} ${market.ticker} ${market.event.title}`.toLowerCase();
		const queryOk = !q || hay.includes(q.toLowerCase());
		const catOk = cat === "All" || market.event.category === cat;
		return queryOk && catOk;
	});
	const featured = markets.slice(0, 4);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "overflow-hidden rounded-3xl border border-line bg-surface px-6 py-8 md:px-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-yes-text",
						children: "Prediction markets · settled in Macho Bucks"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl",
						children: "Trade what happens next. Pay with Macho Bucks, not dollars."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-xl text-muted",
						children: "Cowshi is a Kalshi-style book for campus, sports, and culture. Yes prints in light blue. No prints in pink. Log in with your bank account number before you bet."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3 flex items-end justify-between",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold",
					children: "Top events"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 md:grid-cols-4",
				children: featured.map((market) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/markets/$ticker",
					params: { ticker: market.ticker },
					className: "rounded-2xl border border-line bg-surface p-4 hover:border-yes",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted",
							children: market.event.category
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 line-clamp-2 min-h-12 font-medium",
							children: market.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex items-center justify-between text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-semibold text-yes-text tabular-nums",
								children: ["Yes ", formatCents(market.yes_price_cents)]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted tabular-nums",
								children: formatVolume(market.volume_macho_bucks)
							})]
						})
					]
				}, market.ticker))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: categories.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						search: {
							q,
							cat: item
						},
						className: `rounded-full border px-3 py-1.5 text-sm ${cat === item ? "border-transparent bg-no font-medium text-background" : "border-line bg-surface"}`,
						children: item
					}, item))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketTable, { markets: filtered })]
			})
		]
	});
}
//#endregion
export { Home as component };
