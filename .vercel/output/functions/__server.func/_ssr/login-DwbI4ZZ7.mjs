import { H as require_jsx_runtime, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as BankLoginForm } from "./bank-login-CwCfkvpU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-DwbI4ZZ7.js
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const navigate = useNavigate();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl font-semibold",
			children: "Log in to bet"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-2xl border border-line bg-surface p-5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BankLoginForm, { onSuccess: () => {
				navigate({ to: "/" });
			} })
		})]
	});
}
//#endregion
export { LoginPage as component };
