import { H as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as formatCents, r as Route$1, s as formatMb } from "./router-DiqUngFa.mjs";
import { t as BankLoginForm } from "./bank-login-CwCfkvpU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/portfolio-Byxg9uEf.js
var import_jsx_runtime = require_jsx_runtime();
function PortfolioPage() {
	const data = Route$1.useLoaderData();
	if (!data.user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md rounded-2xl border border-line bg-surface p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mb-2 text-2xl font-semibold",
				children: "Portfolio"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-4 text-sm text-muted",
				children: "Log in with your bank account number to see Macho Bucks, positions, and fills."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BankLoginForm, {})
		]
	});
	const { user, positions, openOrders, trades, markets } = data;
	const titleFor = (ticker) => markets.find((m) => m.ticker === ticker)?.title ?? ticker;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						label: "Macho Bucks",
						value: formatMb(user.macho_bucks)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						label: "Bank account",
						value: String(user.bank_account_number)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						label: "Open orders",
						value: String(openOrders.length)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-line bg-surface p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 font-semibold",
					children: "Positions"
				}), positions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "No contracts yet. Buy Yes or No from any market."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: positions.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/markets/$ticker",
						params: { ticker: p.ticker },
						className: "flex flex-wrap items-center justify-between rounded-xl border border-line px-3 py-3 hover:bg-surface-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium",
							children: titleFor(p.ticker)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-mono text-xs text-muted-2",
							children: p.ticker
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mr-4 text-yes-text tabular-nums",
								children: [
									p.yes_contracts,
									" Yes @ ",
									formatCents(Math.round(p.avg_yes_cents))
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-no-text tabular-nums",
								children: [
									p.no_contracts,
									" No @ ",
									formatCents(Math.round(p.avg_no_cents))
								]
							})]
						})]
					}, p.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-line bg-surface p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 font-semibold",
					children: "Working orders"
				}), openOrders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "No resting bids."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2 text-sm",
					children: openOrders.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between border-b border-line py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							o.side.toUpperCase(),
							" ",
							o.ticker
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono tabular-nums",
							children: [
								o.remaining,
								" @ ",
								formatCents(o.price_cents)
							]
						})]
					}, o.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-line bg-surface p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 font-semibold",
					children: "Recent fills"
				}), trades.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "No trades yet."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2 text-sm",
					children: trades.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between border-b border-line py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							t.side.toUpperCase(),
							" ",
							t.ticker
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono tabular-nums",
							children: [
								t.quantity,
								" @ ",
								formatCents(t.price_cents),
								" · ",
								formatMb(t.macho_bucks)
							]
						})]
					}, t.id))
				})]
			})
		]
	});
}
function Card({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-line bg-surface p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs uppercase tracking-wide text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 text-2xl font-semibold tabular-nums",
			children: value
		})]
	});
}
//#endregion
export { PortfolioPage as component };
