import { o as __toESM } from "../_runtime.mjs";
import { B as notFound, H as require_jsx_runtime, V as require_react, _ as createRootRoute, b as useRouter, d as useRouterState, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { t as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-wQ3IXKBF.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getBootstrap = createServerFn({ method: "GET" }).handler(createSsrRpc("42528aca71c2d477dc5a0f7556d9211990eec7c46acfffeb923b567c06c04f73"));
var getMarkets = createServerFn({ method: "GET" }).handler(createSsrRpc("29686ce398e679867b90f64b27dbf65e3f7081ad6636f817831b8286256e57ae"));
var getMarketPage = createServerFn({ method: "GET" }).validator((data) => {
	if (typeof data !== "object" || data === null || !("ticker" in data) || typeof data.ticker !== "string") throw new Error("Missing ticker");
	return { ticker: data.ticker };
}).handler(createSsrRpc("91025f8e4be307569aadcca7534ea224d57d4e68269a7eaf95f10f337dc578e8"));
var getPortfolio = createServerFn({ method: "GET" }).handler(createSsrRpc("1ef754767982814b93cfa4bcc621be42170eda12c8cd868101220d19836025d0"));
var loginBettor = createServerFn({ method: "POST" }).validator((data) => {
	if (typeof data !== "object" || data === null || !("bank_account_number" in data) || typeof data.bank_account_number !== "number") throw new Error("Enter your bank account number.");
	return { bank_account_number: data.bank_account_number };
}).handler(createSsrRpc("bc4227999ec5fec980ffa9f1e4dde2a8c785e36a8ce576dd50b3c4cea0ae161c"));
var openBettingAccount = createServerFn({ method: "POST" }).validator((data) => {
	if (typeof data !== "object" || data === null) throw new Error("Invalid request");
	const rec = data;
	if (typeof rec.username !== "string" || typeof rec.bank_account_number !== "number") throw new Error("Handle and bank account number are required.");
	return {
		username: rec.username,
		bank_account_number: rec.bank_account_number
	};
}).handler(createSsrRpc("71492d9f91e5ab2e94872742508a0b9c6006eef8dc5426cddf5a3a13e28f7f52"));
var logoutBettorFn = createServerFn({ method: "POST" }).handler(createSsrRpc("a4b48dc1b939ed4f2691f5d37046f9fdf8e2e9ca3e718588c7b445b198cc8919"));
var placeTrade = createServerFn({ method: "POST" }).validator((data) => {
	if (typeof data !== "object" || data === null) throw new Error("Invalid request");
	const rec = data;
	if (typeof rec.ticker !== "string" || rec.side !== "yes" && rec.side !== "no") throw new Error("Missing trade fields");
	if (typeof rec.price_cents !== "number") throw new Error("Limit price must be a whole number of cents from 1 to 99");
	return {
		ticker: rec.ticker,
		side: rec.side,
		action: rec.action === "sell" ? "sell" : "buy",
		price_cents: rec.price_cents,
		amount: typeof rec.amount === "number" ? rec.amount : void 0,
		quantity: typeof rec.quantity === "number" ? rec.quantity : void 0
	};
}).handler(createSsrRpc("73124f788bd18aaefe201d0ff9ecfd3a3495d99eac7bf4c99895af5eeafdc790"));
var getAdminStatus = createServerFn({ method: "GET" }).handler(createSsrRpc("1216993d3c9d7f7313a219bc2d71281f1ec0d5565c752ede5992def21bebd9b9"));
var loginAdmin = createServerFn({ method: "POST" }).validator((data) => {
	if (typeof data !== "object" || data === null) throw new Error("Invalid admin login");
	const rec = data;
	if (typeof rec.username !== "string" || typeof rec.password !== "string") throw new Error("Invalid admin login");
	return {
		username: rec.username,
		password: rec.password
	};
}).handler(createSsrRpc("43bfb0f2d75431b109fad75ea5ea2cf930cbb27b5c82b1938d564006d48f552c"));
var adminAction = createServerFn({ method: "POST" }).validator((data) => {
	if (typeof data !== "object" || data === null) throw new Error("Invalid request");
	const rec = data;
	return {
		action: rec.action === "create" ? "create" : "resolve",
		ticker: typeof rec.ticker === "string" ? rec.ticker : void 0,
		outcome: rec.outcome === "yes" || rec.outcome === "no" ? rec.outcome : void 0,
		title: typeof rec.title === "string" ? rec.title : void 0,
		category: typeof rec.category === "string" ? rec.category : void 0,
		rules: typeof rec.rules === "string" ? rec.rules : void 0,
		yes: typeof rec.yes === "number" ? rec.yes : void 0
	};
}).handler(createSsrRpc("30267fc8a232162fa37d81dd1882fe82088ebd2e9a2cc4afc3f4ecd9d10a2a76"));
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-DiqUngFa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function formatMb(amount) {
	return `${amount.toLocaleString(void 0, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	})} MB`;
}
function formatCents(cents) {
	return `${cents}¢`;
}
function formatVolume(amount) {
	if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)}M MB`;
	if (amount >= 1e3) return `${(amount / 1e3).toFixed(1)}K MB`;
	return `${Math.round(amount)} MB`;
}
function centsToMb(cents, qty) {
	return cents / 100 * qty;
}
var nav = [
	{
		to: "/",
		label: "Markets"
	},
	{
		to: "/portfolio",
		label: "Portfolio"
	},
	{
		to: "/admin",
		label: "Admin"
	}
];
function Header() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const router = useRouter();
	const [user, setUser] = (0, import_react.useState)(null);
	const [query, setQuery] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const load = () => getBootstrap().then((data) => setUser(data.user)).catch(() => void 0);
		load();
		window.addEventListener("cowshi:refresh", load);
		return () => window.removeEventListener("cowshi:refresh", load);
	}, [pathname]);
	async function signOut() {
		await logoutBettorFn();
		setUser(null);
		window.dispatchEvent(new Event("cowshi:refresh"));
		await router.invalidate();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-30 border-b border-line bg-background/90 backdrop-blur",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-[1280px] items-center gap-3 px-4 py-3 md:gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-center gap-2 font-semibold tracking-tight",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid h-8 w-8 place-items-center rounded-lg bg-linear-to-br from-yes to-no text-sm font-semibold text-background",
						children: "C"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Cowshi" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "hidden items-center gap-1 md:flex",
					children: nav.map((item) => {
						const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: item.to,
							className: `rounded-full px-3 py-1.5 text-sm ${active ? "bg-yes-soft text-yes-text" : "text-muted hover:bg-surface-2"}`,
							children: item.label
						}, item.to);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
					className: "ml-auto hidden min-w-[180px] flex-1 max-w-md md:block",
					onSubmit: (e) => {
						e.preventDefault();
						router.navigate({
							to: "/",
							search: {
								q: query,
								cat: "All"
							}
						});
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						suppressHydrationWarning: true,
						value: query,
						onChange: (e) => setQuery(e.target.value),
						placeholder: "Search markets, tickers, events",
						className: "w-full rounded-full border border-line bg-surface-2 px-4 py-2 text-sm outline-none focus:border-yes"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "ml-auto flex items-center gap-3 md:ml-0",
					children: user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] uppercase tracking-wide text-muted",
								children: "Macho Bucks"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-sm font-semibold tabular-nums",
								children: formatMb(user.macho_bucks)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hidden text-right sm:block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] uppercase tracking-wide text-muted",
								children: user.username
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-mono text-xs text-muted-2 tabular-nums",
								children: ["#", user.bank_account_number]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => void signOut(),
							className: "min-h-11 rounded-full border border-line bg-surface px-3 py-2 text-sm",
							children: "Sign out"
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						className: "inline-flex min-h-11 items-center rounded-full bg-yes-deep px-4 py-2 text-sm font-semibold text-white",
						children: "Log in to bet"
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "flex gap-1 overflow-x-auto border-t border-line px-4 py-1 md:hidden",
			children: nav.map((item) => {
				const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: item.to,
					className: `min-h-11 shrink-0 rounded-full px-3 py-2 text-sm ${active ? "bg-yes-soft text-yes-text" : "text-muted"}`,
					children: item.label
				}, item.to);
			})
		})]
	});
}
var styles_default = "/assets/styles-ChjmpHKh.css";
var APP_NAME = "Cowshi";
var Route$5 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "A Kalshi-style prediction market settled in Macho Bucks."
			},
			{
				name: "theme-color",
				content: "#0a1120"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: RootDocument
});
function RootDocument() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "h-full antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "min-h-full bg-background text-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "mx-auto w-full max-w-[1280px] px-4 pb-16 pt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	});
}
var $$splitComponentImporter$4 = () => import("./routes-BqHz8eAc.mjs");
var Route$4 = createFileRoute("/")({
	validateSearch: (search) => ({
		q: typeof search.q === "string" ? search.q : void 0,
		cat: typeof search.cat === "string" ? search.cat : void 0
	}),
	loader: () => getMarkets(),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./admin-DfHOUgCq.mjs");
var Route$3 = createFileRoute("/admin")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./login-DwbI4ZZ7.mjs");
var Route$2 = createFileRoute("/login")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./portfolio-Byxg9uEf.mjs");
var Route$1 = createFileRoute("/portfolio")({
	loader: () => getPortfolio(),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("../_ticker-OM48m9ww.mjs");
var $$splitNotFoundComponentImporter = () => import("../_ticker-DvbhahCJ.mjs");
var Route = createFileRoute("/markets/$ticker")({
	loader: async ({ params }) => {
		const data = await getMarketPage({ data: { ticker: params.ticker } });
		if (!data) throw notFound();
		return data;
	},
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent"),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var rootRouteChildren = {
	IndexRoute: Route$4.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$5
	}),
	AdminRoute: Route$3.update({
		id: "/admin",
		path: "/admin",
		getParentRoute: () => Route$5
	}),
	LoginRoute: Route$2.update({
		id: "/login",
		path: "/login",
		getParentRoute: () => Route$5
	}),
	PortfolioRoute: Route$1.update({
		id: "/portfolio",
		path: "/portfolio",
		getParentRoute: () => Route$5
	}),
	MarketsTickerRoute: Route.update({
		id: "/markets/$ticker",
		path: "/markets/$ticker",
		getParentRoute: () => Route$5
	})
};
var routeTree = Route$5._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { centsToMb as a, formatVolume as c, getBootstrap as d, loginAdmin as f, placeTrade as h, Route$4 as i, adminAction as l, openBettingAccount as m, Route as n, formatCents as o, loginBettor as p, Route$1 as r, formatMb as s, router_exports as t, getAdminStatus as u };
