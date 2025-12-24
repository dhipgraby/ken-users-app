import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // In a multi-repo workspace, prevent Next from picking the wrong root
  // and silence the lockfile warning. Point tracing to this project.
  outputFileTracingRoot: path.join(__dirname),

  webpack: (
    config,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    // Avoid bundling optional Node dependency required by pdfjs in browser builds.
    // Mark 'canvas' as unavailable so Webpack doesn't try to resolve it.
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      canvas: false
    };
    return config;
  }
};

export default nextConfig;
