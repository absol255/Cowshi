import { H as require_jsx_runtime } from "./_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_ticker-DvbhahCJ.js
var import_jsx_runtime = require_jsx_runtime();
function MarketNotFound() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-line bg-surface p-10 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-semibold",
			children: "Market not found"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-muted",
			children: "That ticker is not on the Cowshi book."
		})]
	});
}
//#endregion
export { MarketNotFound as notFoundComponent };
