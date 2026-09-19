import { o as __toESM } from "../_runtime.mjs";
import { H as require_jsx_runtime, V as require_react, b as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as getBootstrap, f as loginAdmin, l as adminAction, u as getAdminStatus } from "./router-DiqUngFa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-DfHOUgCq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var categories = [
	"Politics",
	"Sports",
	"Culture",
	"Campus",
	"Economics",
	"Weather"
];
function AdminPage() {
	const router = useRouter();
	const [authed, setAuthed] = (0, import_react.useState)(false);
	const [username, setUsername] = (0, import_react.useState)("admin");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [markets, setMarkets] = (0, import_react.useState)([]);
	const [title, setTitle] = (0, import_react.useState)("");
	const [rules, setRules] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("Campus");
	async function load() {
		const data = await getBootstrap();
		setMarkets(data.markets ?? []);
	}
	(0, import_react.useEffect)(() => {
		getAdminStatus().then((data) => setAuthed(Boolean(data.admin))).catch(() => void 0);
		load().catch(() => void 0);
	}, []);
	async function login() {
		setError("");
		try {
			await loginAdmin({ data: {
				username,
				password
			} });
			setAuthed(true);
		} catch {
			setError("Invalid admin login");
		}
	}
	async function resolve(ticker, outcome) {
		try {
			await adminAction({ data: {
				action: "resolve",
				ticker,
				outcome
			} });
			await load();
			await router.invalidate();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Resolve failed");
		}
	}
	async function createMarket() {
		try {
			await adminAction({ data: {
				action: "create",
				title,
				rules,
				category,
				yes: 50
			} });
			setTitle("");
			setRules("");
			await load();
			await router.invalidate();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not list market");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl font-semibold",
			children: "Admin"
		}), !authed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "rounded-2xl border border-line bg-surface p-5",
			onSubmit: (e) => {
				e.preventDefault();
				login();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-4 text-sm text-muted",
					children: [
						"Sign in with an ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "font-mono",
							children: "Admin"
						}),
						" account. Bettors can't use this page."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "mb-2 w-full rounded-lg border border-line px-3 py-2",
					value: username,
					onChange: (e) => setUsername(e.target.value),
					placeholder: "username",
					autoComplete: "username"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "password",
					className: "mb-3 w-full rounded-lg border border-line px-3 py-2",
					value: password,
					onChange: (e) => setPassword(e.target.value),
					placeholder: "password",
					autoComplete: "current-password"
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-sm text-no-text",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "min-h-11 rounded-xl bg-yes-deep px-4 py-2 text-sm font-semibold text-white",
					type: "submit",
					children: "Sign in"
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-2xl border border-line bg-surface p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 font-semibold",
					children: "List a market"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "mb-2 w-full rounded-lg border border-line px-3 py-2",
					placeholder: "Will spicy nuggets return?",
					value: title,
					onChange: (e) => setTitle(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: "mb-2 w-full rounded-lg border border-line px-3 py-2",
					value: category,
					onChange: (e) => setCategory(e.target.value),
					children: categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: c }, c))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					className: "mb-3 min-h-24 w-full rounded-lg border border-line px-3 py-2",
					placeholder: "Resolution rules",
					value: rules,
					onChange: (e) => setRules(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => void createMarket(),
					className: "min-h-11 rounded-xl bg-no-deep px-4 py-2 text-sm font-semibold text-white",
					children: "List market"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-2xl border border-line bg-surface p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 font-semibold",
					children: "Resolve"
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-sm text-no-text",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: markets.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2 border-b border-line py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium",
							children: m.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-muted",
							children: [
								m.ticker,
								" · ",
								m.status
							]
						})] }), m.status === "open" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "rounded-lg bg-yes-soft px-3 py-2 text-sm text-yes-text",
								onClick: () => void resolve(m.ticker, "yes"),
								children: "Yes"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "rounded-lg bg-no-soft px-3 py-2 text-sm text-no-text",
								onClick: () => void resolve(m.ticker, "no"),
								children: "No"
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm capitalize text-muted",
							children: m.resolved_outcome
						})]
					}, m.ticker))
				})
			]
		})] })]
	});
}
//#endregion
export { AdminPage as component };
