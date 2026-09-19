import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the Postgres driver out of the bundle; it is loaded at runtime on the server.
  serverExternalPackages: ["pg"],
};

export default nextConfig;
