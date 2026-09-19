import { o as __toESM } from "../_runtime.mjs";
import { H as require_jsx_runtime, V as require_react, b as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as validateBankAccountNumber, c as validateUsername, i as parseBankAccountNumber, r as digitsOnlyInput, t as NEW_ACCOUNT_MB } from "./rules-OkhjTODs.mjs";
import { m as openBettingAccount, p as loginBettor } from "./router-DiqUngFa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bank-login-CwCfkvpU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function pingRefresh() {
	window.dispatchEvent(new Event("cowshi:refresh"));
}
function BankLoginForm({ compact = false, onSuccess }) {
	const router = useRouter();
	const [mode, setMode] = (0, import_react.useState)("in");
	const [bankText, setBankText] = (0, import_react.useState)("");
	const [username, setUsername] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const bank = parseBankAccountNumber(bankText);
	const bankProblem = bankText === "" ? "Enter your bank account number." : validateBankAccountNumber(bank);
	const nameProblem = mode === "open" ? validateUsername(username) : null;
	const valid = !bankProblem && !nameProblem;
	async function submit() {
		if (!valid) return;
		setBusy(true);
		setError("");
		try {
			if (mode === "open") await openBettingAccount({ data: {
				username,
				bank_account_number: bank
			} });
			else await loginBettor({ data: { bank_account_number: bank } });
			pingRefresh();
			await router.invalidate();
			onSuccess?.();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not sign in");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: compact ? "space-y-3" : "space-y-3",
		onSubmit: (e) => {
			e.preventDefault();
			submit();
		},
		children: [
			!compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Bettors sign in with a ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
						className: "font-mono text-foreground",
						children: "User.bank_account_number"
					}),
					". You can't place a bet until that session is set."
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Log in with your bank account number to bet."
			}),
			mode === "open" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-sm",
				children: ["Handle", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "mt-1 w-full rounded-lg border border-line px-3 py-2",
					value: username,
					onChange: (e) => setUsername(e.target.value),
					placeholder: "cowboy",
					autoComplete: "username",
					"aria-invalid": Boolean(nameProblem && username)
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-sm",
				children: [
					"Bank account number",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						inputMode: "numeric",
						pattern: "[0-9]*",
						autoComplete: "off",
						value: bankText,
						onChange: (e) => setBankText(digitsOnlyInput(e.target.value)),
						placeholder: "1001",
						"aria-invalid": Boolean(bankProblem && bankText),
						"aria-describedby": "bank-hint",
						className: "mt-1 w-full rounded-lg border border-line px-3 py-2 font-mono tabular-nums"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						id: "bank-hint",
						className: `mt-1 block text-xs ${bankText && bankProblem ? "text-no-text" : "text-muted"}`,
						children: bankText && bankProblem ? bankProblem : "Whole numbers only, at least 4 digits. Demo: cowboy 1001 · milo 1002 · daisy 1003."
					})
				]
			}),
			mode === "open" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: [
					"New accounts start with ",
					NEW_ACCOUNT_MB,
					" Macho Bucks. The number has to be unique on the book."
				]
			}) : null,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-no-text",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "submit",
				disabled: busy || !valid,
				className: "min-h-11 w-full rounded-xl bg-yes-deep px-4 py-2 text-sm font-semibold text-white disabled:opacity-50",
				children: busy ? "Working…" : mode === "open" ? "Open account" : "Log in to bet"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "w-full text-center text-xs text-muted underline-offset-2 hover:text-foreground hover:underline",
				onClick: () => {
					setMode(mode === "in" ? "open" : "in");
					setError("");
				},
				children: mode === "in" ? "No account? Open one with a bank account number." : "Already on the book? Sign in instead."
			})
		]
	});
}
//#endregion
export { BankLoginForm as t };
