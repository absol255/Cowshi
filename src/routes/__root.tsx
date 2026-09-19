import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { Header } from "@/components/header";
import appCss from "../styles.css?url";

const APP_NAME = "Cowshi";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "description", content: "A Kalshi-style prediction market settled in Macho Bucks." },
      { name: "theme-color", content: "#0a1120" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <PreviewHostBridge />
        <AuthProvider>
          <Header />
          <main className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-4">
            <Outlet />
          </main>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
