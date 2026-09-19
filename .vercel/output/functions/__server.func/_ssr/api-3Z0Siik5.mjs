import { n as contractsForAmount, o as validateBetAmount, s as validateContracts } from "./rules-OkhjTODs.mjs";
import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-3Z0Siik5.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getBootstrap_createServerFn_handler = createServerRpc({
	id: "42528aca71c2d477dc5a0f7556d9211990eec7c46acfffeb923b567c06c04f73",
	name: "getBootstrap",
	filename: "src/lib/cowshi/api.ts"
}, (opts) => getBootstrap.__executeServer(opts));
var getBootstrap = createServerFn({ method: "GET" }).handler(getBootstrap_createServerFn_handler, async () => {
	const { currentUser } = await import("./session.server-DpNUwFrX.mjs");
	const { listMarketViews, withStore } = await import("./store.server-18l2BOsw.mjs");
	const user = await currentUser();
	return withStore((store) => ({
		user,
		markets: listMarketViews(store)
	}));
});
var getMarkets_createServerFn_handler = createServerRpc({
	id: "29686ce398e679867b90f64b27dbf65e3f7081ad6636f817831b8286256e57ae",
	name: "getMarkets",
	filename: "src/lib/cowshi/api.ts"
}, (opts) => getMarkets.__executeServer(opts));
var getMarkets = createServerFn({ method: "GET" }).handler(getMarkets_createServerFn_handler, async () => {
	const { listMarketViews, withStore } = await import("./store.server-18l2BOsw.mjs");
	return withStore((store) => listMarketViews(store));
});
var getMarketPage_createServerFn_handler = createServerRpc({
	id: "91025f8e4be307569aadcca7534ea224d57d4e68269a7eaf95f10f337dc578e8",
	name: "getMarketPage",
	filename: "src/lib/cowshi/api.ts"
}, (opts) => getMarketPage.__executeServer(opts));
var getMarketPage = createServerFn({ method: "GET" }).validator((data) => {
	if (typeof data !== "object" || data === null || !("ticker" in data) || typeof data.ticker !== "string") throw new Error("Missing ticker");
	return { ticker: data.ticker };
}).handler(getMarketPage_createServerFn_handler, async ({ data }) => {
	const { currentUser } = await import("./session.server-DpNUwFrX.mjs");
	const { toMarketView, withStore } = await import("./store.server-18l2BOsw.mjs");
	const user = await currentUser();
	return withStore((store) => {
		const market = toMarketView(store, data.ticker.toUpperCase());
		if (!market) return null;
		return {
			market,
			position: user ? store.positions.find((p) => p.user_id === user.id && p.ticker === market.ticker) ?? null : null,
			related: store.markets.filter((m) => m.event_id === market.event_id && m.ticker !== market.ticker),
			user
		};
	});
});
var getPortfolio_createServerFn_handler = createServerRpc({
	id: "1ef754767982814b93cfa4bcc621be42170eda12c8cd868101220d19836025d0",
	name: "getPortfolio",
	filename: "src/lib/cowshi/api.ts"
}, (opts) => getPortfolio.__executeServer(opts));
var getPortfolio = createServerFn({ method: "GET" }).handler(getPortfolio_createServerFn_handler, async () => {
	const { currentUser } = await import("./session.server-DpNUwFrX.mjs");
	const { withStore } = await import("./store.server-18l2BOsw.mjs");
	const session = await currentUser();
	if (!session) return {
		user: null,
		positions: [],
		openOrders: [],
		trades: [],
		markets: []
	};
	return withStore((store) => {
		const user = store.users.find((u) => u.id === session.id) ?? null;
		if (!user) return {
			user: null,
			positions: [],
			openOrders: [],
			trades: [],
			markets: store.markets
		};
		return {
			user,
			positions: store.positions.filter((p) => p.user_id === user.id && (p.yes_contracts > 0 || p.no_contracts > 0)),
			openOrders: store.orders.filter((o) => o.user_id === user.id && o.status === "open"),
			trades: store.trades.filter((t) => t.user_id === user.id).slice(-20).reverse(),
			markets: store.markets
		};
	});
});
var loginBettor_createServerFn_handler = createServerRpc({
	id: "bc4227999ec5fec980ffa9f1e4dde2a8c785e36a8ce576dd50b3c4cea0ae161c",
	name: "loginBettor",
	filename: "src/lib/cowshi/api.ts"
}, (opts) => loginBettor.__executeServer(opts));
var loginBettor = createServerFn({ method: "POST" }).validator((data) => {
	if (typeof data !== "object" || data === null || !("bank_account_number" in data) || typeof data.bank_account_number !== "number") throw new Error("Enter your bank account number.");
	return { bank_account_number: data.bank_account_number };
}).handler(loginBettor_createServerFn_handler, async ({ data }) => {
	const { loginWithBankAccount } = await import("./session.server-DpNUwFrX.mjs");
	return {
		ok: true,
		user: await loginWithBankAccount(data.bank_account_number)
	};
});
var openBettingAccount_createServerFn_handler = createServerRpc({
	id: "71492d9f91e5ab2e94872742508a0b9c6006eef8dc5426cddf5a3a13e28f7f52",
	name: "openBettingAccount",
	filename: "src/lib/cowshi/api.ts"
}, (opts) => openBettingAccount.__executeServer(opts));
var openBettingAccount = createServerFn({ method: "POST" }).validator((data) => {
	if (typeof data !== "object" || data === null) throw new Error("Invalid request");
	const rec = data;
	if (typeof rec.username !== "string" || typeof rec.bank_account_number !== "number") throw new Error("Handle and bank account number are required.");
	return {
		username: rec.username,
		bank_account_number: rec.bank_account_number
	};
}).handler(openBettingAccount_createServerFn_handler, async ({ data }) => {
	const { openAccount } = await import("./session.server-DpNUwFrX.mjs");
	return {
		ok: true,
		user: await openAccount(data.username, data.bank_account_number)
	};
});
var logoutBettorFn_createServerFn_handler = createServerRpc({
	id: "a4b48dc1b939ed4f2691f5d37046f9fdf8e2e9ca3e718588c7b445b198cc8919",
	name: "logoutBettorFn",
	filename: "src/lib/cowshi/api.ts"
}, (opts) => logoutBettorFn.__executeServer(opts));
var logoutBettorFn = createServerFn({ method: "POST" }).handler(logoutBettorFn_createServerFn_handler, async () => {
	const { logoutBettor } = await import("./session.server-DpNUwFrX.mjs");
	logoutBettor();
	return { ok: true };
});
var placeTrade_createServerFn_handler = createServerRpc({
	id: "73124f788bd18aaefe201d0ff9ecfd3a3495d99eac7bf4c99895af5eeafdc790",
	name: "placeTrade",
	filename: "src/lib/cowshi/api.ts"
}, (opts) => placeTrade.__executeServer(opts));
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
}).handler(placeTrade_createServerFn_handler, async ({ data }) => {
	const { requireBettor } = await import("./session.server-DpNUwFrX.mjs");
	const { matchBuy, matchSell } = await import("./engine-DMoMN_5H.mjs");
	const { toMarketView, withStore } = await import("./store.server-18l2BOsw.mjs");
	const user = await requireBettor();
	const { ticker, side, price_cents } = data;
	const action = data.action;
	if (!Number.isInteger(price_cents) || price_cents < 1 || price_cents > 99) throw new Error("Limit price must be a whole number of cents from 1 to 99");
	const limit = price_cents;
	let quantity;
	if (action === "buy") {
		const problem = validateBetAmount(data.amount);
		if (problem) throw new Error(problem);
		quantity = contractsForAmount(data.amount, limit);
		if (quantity < 1) throw new Error("That bet is too small at this price");
	} else {
		const problem = validateContracts(data.quantity);
		if (problem) throw new Error(problem);
		quantity = data.quantity;
	}
	return withStore((store) => {
		const outcome = action === "sell" ? matchSell(store, user.id, ticker, side, limit, quantity) : matchBuy(store, user.id, ticker, side, limit, quantity);
		const fresh = store.users.find((u) => u.id === user.id);
		const spent = "spent" in outcome ? outcome.spent : 0;
		const proceeds = "proceeds" in outcome ? outcome.proceeds : 0;
		return {
			filled: outcome.filled,
			spent,
			proceeds,
			last: outcome.last,
			user: fresh,
			market: toMarketView(store, ticker)
		};
	});
});
var getAdminStatus_createServerFn_handler = createServerRpc({
	id: "1216993d3c9d7f7313a219bc2d71281f1ec0d5565c752ede5992def21bebd9b9",
	name: "getAdminStatus",
	filename: "src/lib/cowshi/api.ts"
}, (opts) => getAdminStatus.__executeServer(opts));
var getAdminStatus = createServerFn({ method: "GET" }).handler(getAdminStatus_createServerFn_handler, async () => {
	const { isAdmin } = await import("./session.server-DpNUwFrX.mjs");
	return { admin: await isAdmin() };
});
var loginAdmin_createServerFn_handler = createServerRpc({
	id: "43bfb0f2d75431b109fad75ea5ea2cf930cbb27b5c82b1938d564006d48f552c",
	name: "loginAdmin",
	filename: "src/lib/cowshi/api.ts"
}, (opts) => loginAdmin.__executeServer(opts));
var loginAdmin = createServerFn({ method: "POST" }).validator((data) => {
	if (typeof data !== "object" || data === null) throw new Error("Invalid admin login");
	const rec = data;
	if (typeof rec.username !== "string" || typeof rec.password !== "string") throw new Error("Invalid admin login");
	return {
		username: rec.username,
		password: rec.password
	};
}).handler(loginAdmin_createServerFn_handler, async ({ data }) => {
	const { withStore } = await import("./store.server-18l2BOsw.mjs");
	const { verifyPassword } = await import("./password.server-CXPmV40H.mjs").then((n) => n.n).then((n) => n.n);
	const { setAdminCookie } = await import("./session.server-DpNUwFrX.mjs");
	const admin = await withStore((store) => store.admins.find((a) => a.username === data.username) ?? null);
	if (!Boolean(admin && data.password && verifyPassword(data.password, admin.password_hash)) || !admin) throw new Error("Invalid admin credentials");
	setAdminCookie(admin.id);
	return { ok: true };
});
var adminAction_createServerFn_handler = createServerRpc({
	id: "30267fc8a232162fa37d81dd1882fe82088ebd2e9a2cc4afc3f4ecd9d10a2a76",
	name: "adminAction",
	filename: "src/lib/cowshi/api.ts"
}, (opts) => adminAction.__executeServer(opts));
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
}).handler(adminAction_createServerFn_handler, async ({ data }) => {
	const { isAdmin } = await import("./session.server-DpNUwFrX.mjs");
	const { nextId, resolveMarket } = await import("./engine-DMoMN_5H.mjs");
	const { seedBook } = await import("./seed.server-DEfynell.mjs").then((n) => n.n).then((n) => n.n);
	const { withStore } = await import("./store.server-18l2BOsw.mjs");
	if (!await isAdmin()) throw new Error("Admin only");
	return withStore((store) => {
		if (data.action === "resolve") {
			if (!data.ticker || !data.outcome) throw new Error("Need ticker and outcome");
			resolveMarket(store, data.ticker, data.outcome);
			return { ok: true };
		}
		if (!data.title || !data.category || !data.rules) throw new Error("Missing market fields");
		const eventId = nextId(store);
		const ticker = `NEW-${eventId}`;
		store.events.push({
			id: eventId,
			slug: ticker.toLowerCase(),
			title: data.title,
			category: data.category,
			subtitle: "Listed by admin"
		});
		const yes = Math.min(90, Math.max(10, data.yes ?? 50));
		const close = /* @__PURE__ */ new Date();
		close.setDate(close.getDate() + 14);
		store.markets.push({
			id: nextId(store),
			ticker,
			event_id: eventId,
			title: data.title,
			rules: data.rules,
			status: "open",
			yes_price_cents: yes,
			volume_macho_bucks: 0,
			close_at: close.toISOString(),
			resolved_outcome: null,
			history: [{
				t: Date.now(),
				yes_cents: yes
			}]
		});
		const mm = store.users.find((u) => u.username === "market_maker");
		if (mm) seedBook(store, ticker, yes, mm.id);
		return {
			ok: true,
			ticker
		};
	});
});
//#endregion
export { adminAction_createServerFn_handler, getAdminStatus_createServerFn_handler, getBootstrap_createServerFn_handler, getMarketPage_createServerFn_handler, getMarkets_createServerFn_handler, getPortfolio_createServerFn_handler, loginAdmin_createServerFn_handler, loginBettor_createServerFn_handler, logoutBettorFn_createServerFn_handler, openBettingAccount_createServerFn_handler, placeTrade_createServerFn_handler };
