import { o as __toESM } from "./_runtime.mjs";
import { H as require_jsx_runtime, V as require_react, b as useRouter, v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as contractsForAmount, o as validateBetAmount, r as digitsOnlyInput, s as validateContracts } from "./_ssr/rules-OkhjTODs.mjs";
import { a as centsToMb, c as formatVolume, h as placeTrade, n as Route, o as formatCents, s as formatMb } from "./_ssr/router-DiqUngFa.mjs";
import { t as PriceChart } from "./_ssr/charts-DA05kIYh.mjs";
import { t as BankLoginForm } from "./_ssr/bank-login-CwCfkvpU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_ticker-OM48m9ww.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function OrderBook({ yes, no }) {
	const max = Math.max(1, ...yes.map((l) => l.size), ...no.map((l) => l.size));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-2 gap-4 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookColumn, {
			title: "Yes bids",
			color: "yes",
			levels: yes,
			max
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookColumn, {
			title: "No bids",
			color: "no",
			levels: no,
			max
		})]
	});
}
function BookColumn({ title, color, levels, max }) {
	const bar = color === "yes" ? "bg-yes/40" : "bg-no/50";
	const text = color === "yes" ? "text-yes-text" : "text-no-text";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-2 flex justify-between text-[11px] uppercase tracking-wide text-muted",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Size" })]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-1",
		children: levels.map((level) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative overflow-hidden rounded-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `absolute inset-y-0 right-0 ${bar}`,
				style: { width: `${level.size / max * 100}%` }
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex justify-between px-2 py-1 font-mono tabular-nums",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: text,
					children: formatCents(level.price_cents)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: level.size })]
			})]
		}, `${title}-${level.price_cents}`))
	})] });
}
/** Where the limit starts: the quoted price when buying, the best bid when selling. */
function defaultLimit(market, action, side) {
	const price = side === "yes" ? market.yes_price_cents : market.no_price_cents;
	if (action === "buy") return price;
	return (side === "yes" ? market.yes_bids : market.no_bids)[0]?.price_cents ?? price;
}
function TradeTicket({ market, position, user }) {
	const router = useRouter();
	const [action, setAction] = (0, import_react.useState)("buy");
	const [side, setSide] = (0, import_react.useState)("yes");
	const [amountText, setAmountText] = (0, import_react.useState)(String(5));
	const [qtyText, setQtyText] = (0, import_react.useState)("1");
	const [limit, setLimit] = (0, import_react.useState)(defaultLimit(market, "buy", "yes"));
	const [error, setError] = (0, import_react.useState)("");
	const [notice, setNotice] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const amount = amountText === "" ? NaN : Number(amountText);
	const qty = qtyText === "" ? NaN : Number(qtyText);
	const inputProblem = action === "buy" ? validateBetAmount(amount) : validateContracts(qty);
	const contracts = action === "buy" && !inputProblem ? contractsForAmount(amount, limit) : 0;
	const tooSmall = action === "buy" && !inputProblem && contracts < 1;
	const cost = centsToMb(limit, action === "buy" ? contracts : qty);
	const valid = !inputProblem && !tooSmall;
	const signedIn = Boolean(user);
	function pick(nextAction, nextSide) {
		setAction(nextAction);
		setSide(nextSide);
		setLimit(defaultLimit(market, nextAction, nextSide));
		setError("");
		setNotice("");
	}
	async function submit() {
		if (!signedIn) {
			setError("Log in with your bank account number to bet");
			return;
		}
		if (!valid) return;
		setBusy(true);
		setError("");
		setNotice("");
		try {
			const data = await placeTrade({ data: {
				ticker: market.ticker,
				action,
				side,
				price_cents: limit,
				...action === "buy" ? { amount } : { quantity: qty }
			} });
			setNotice(action === "buy" ? `Order placed for ${data.filled} contracts (${formatMb(data.spent)}).` : `Sold ${data.filled} contracts for ${formatMb(data.proceeds ?? 0)}.`);
			window.dispatchEvent(new Event("cowshi:refresh"));
			await router.invalidate();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Trade failed");
		} finally {
			setBusy(false);
		}
	}
	const yesLabel = defaultLimit(market, action, "yes");
	const noLabel = defaultLimit(market, action, "no");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "rounded-2xl border border-line bg-surface p-4 shadow-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3 grid grid-cols-2 rounded-xl bg-background p-1 text-sm font-medium",
				children: ["buy", "sell"].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => pick(item, side),
					className: `rounded-lg py-2 capitalize ${action === item ? "bg-surface-2 shadow-sm" : "text-muted"}`,
					children: item
				}, item))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => pick(action, "yes"),
					className: `rounded-xl border px-3 py-3 text-left ${side === "yes" ? "border-yes bg-yes-soft" : "border-line"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted",
						children: "Yes"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-lg font-semibold text-yes-text tabular-nums",
						children: formatCents(yesLabel)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => pick(action, "no"),
					className: `rounded-xl border px-3 py-3 text-left ${side === "no" ? "border-no bg-no-soft" : "border-line"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted",
						children: "No"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-lg font-semibold text-no-text tabular-nums",
						children: formatCents(noLabel)
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mb-3 block text-sm",
				children: ["Limit", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 1,
						max: 99,
						value: limit,
						onChange: (e) => setLimit(Number(e.target.value)),
						className: "w-full accent-no-text"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "w-12 font-mono tabular-nums",
						children: formatCents(limit)
					})]
				})]
			}),
			action === "buy" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mb-3 block text-sm",
				children: [
					"Bet (Macho Bucks)",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						inputMode: "numeric",
						pattern: "[0-9]*",
						autoComplete: "off",
						value: amountText,
						onChange: (e) => setAmountText(digitsOnlyInput(e.target.value, 9)),
						"aria-invalid": Boolean(inputProblem),
						"aria-describedby": "bet-hint",
						className: "mt-1 w-full rounded-lg border border-line px-3 py-2 font-mono tabular-nums"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						id: "bet-hint",
						className: `mt-1 block text-xs ${inputProblem ? "text-no-text" : "text-muted"}`,
						children: inputProblem ?? `Whole numbers only. Minimum bet is 1 Macho Buck.`
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mb-3 block text-sm",
				children: [
					"Contracts to sell",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						inputMode: "numeric",
						pattern: "[0-9]*",
						autoComplete: "off",
						value: qtyText,
						onChange: (e) => setQtyText(digitsOnlyInput(e.target.value, 9)),
						"aria-invalid": Boolean(inputProblem),
						"aria-describedby": "qty-hint",
						className: "mt-1 w-full rounded-lg border border-line px-3 py-2 font-mono tabular-nums"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						id: "qty-hint",
						className: `mt-1 block text-xs ${inputProblem ? "text-no-text" : "text-muted"}`,
						children: inputProblem ?? "Whole contracts only."
					})
				]
			}),
			action === "buy" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 space-y-1 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: "Contracts"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono tabular-nums",
							children: valid ? contracts : "—"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: "Max cost"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold tabular-nums",
							children: valid ? formatMb(cost) : "—"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted",
							children: [
								"Pays if ",
								side === "yes" ? "Yes" : "No",
								" wins"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold tabular-nums",
							children: valid ? formatMb(contracts) : "—"
						})]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center justify-between text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted",
					children: "Proceeds"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold tabular-nums",
					children: valid ? formatMb(cost) : "—"
				})]
			}),
			position ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 rounded-lg bg-surface-2 px-3 py-2 text-xs text-muted",
				children: [
					"Position: ",
					position.yes_contracts,
					" Yes · ",
					position.no_contracts,
					" No"
				]
			}) : null,
			tooSmall ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3 text-sm text-no-text",
				children: "That bet is too small at this price."
			}) : null,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3 text-sm text-no-text",
				children: error
			}) : null,
			notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3 text-sm text-yes-text",
				children: notice
			}) : null,
			signedIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: busy || !valid || market.status !== "open",
				onClick: submit,
				className: `min-h-11 w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50 ${side === "yes" ? "bg-yes-deep" : "bg-no-deep"}`,
				children: busy ? "Working…" : `${action === "buy" ? "Bet on" : "Sell"} ${side === "yes" ? "Yes" : "No"}`
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-xl border border-line bg-background p-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BankLoginForm, { compact: true })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs leading-5 text-muted",
				children: [
					"Winning contracts pay 1.00 Macho Buck. Prices are cents of one Macho Buck. Bets are whole Macho Bucks, minimum",
					" ",
					1,
					". You have to be signed in with a bank account number to place one."
				]
			})
		]
	});
}
function MarketPage() {
	const { market, position, related, user } = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6 lg:grid-cols-[1fr_320px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-line bg-surface p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-sm text-muted",
							children: [
								market.event.category,
								" · ",
								market.event.title
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-1 text-3xl font-semibold tracking-tight",
							children: market.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-4 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "rounded-full bg-yes-soft px-3 py-1 font-semibold text-yes-text tabular-nums",
									children: ["Yes ", formatCents(market.yes_price_cents)]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "rounded-full bg-no-soft px-3 py-1 font-semibold text-no-text tabular-nums",
									children: ["No ", formatCents(market.no_price_cents)]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted tabular-nums",
									children: [formatVolume(market.volume_macho_bucks), " vol"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-muted-2",
									children: market.ticker
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceChart, { history: market.history })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-line bg-surface p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 font-semibold",
						children: "Order book"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderBook, {
						yes: market.yes_bids,
						no: market.no_bids
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-line bg-surface p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-2 font-semibold",
							children: "Market rules"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-6 text-muted",
							children: market.rules
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-xs text-muted",
							children: [
								"Closes ",
								new Date(market.close_at).toLocaleString(),
								". Status: ",
								market.status,
								market.resolved_outcome ? ` · resolved ${market.resolved_outcome}` : "",
								"."
							]
						}),
						related.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 text-sm",
							children: [
								"Related:",
								" ",
								related.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/markets/$ticker",
									params: { ticker: r.ticker },
									className: "mr-3 text-yes-text underline",
									children: r.ticker
								}, r.ticker))
							]
						}) : null
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TradeTicket, {
			market,
			position,
			user
		})]
	});
}
//#endregion
export { MarketPage as component };
