import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

// Set by the Pages workflow to '/<repo>'; empty everywhere else, so local dev
// and a custom domain both serve from the root unchanged.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  // Static export: the whole site is pre-rendered HTML, deployable to GitHub
  // Pages, Netlify, Vercel or any static host. Keeps SEO/metadata per route
  // (PRD FR-12) without running a server.
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  // Pin the workspace root: the project sits under the home directory, and
  // without this Turbopack walks up and adopts ~ as the root.
  turbopack: { root: dirname(fileURLToPath(import.meta.url)) },
};

export default nextConfig;
