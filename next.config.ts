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
};

export default nextConfig;
