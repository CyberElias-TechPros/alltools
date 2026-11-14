import type { NextConfig } from "next";

/**
 * Static-export configuration.
 *
 * The whole platform is designed to be host-agnostic: every tool runs in the
 * browser, so the build output is plain HTML/CSS/JS that can be served by any
 * static host (Cloudflare Pages, Netlify, GitHub Pages, an object bucket, …).
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
  /**
   * Dev-only: allow the sandbox preview host (and any e2b.app subdomain) to
   * load the dev server from a proxied origin. Has no effect on the exported
   * production build.
   */
  allowedDevOrigins: ["*.e2b.app", "localhost", "127.0.0.1"],
};

export default nextConfig;
