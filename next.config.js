/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure Next.js traces from this project root in a multi-lockfile workspace
  outputFileTracingRoot: __dirname,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              frame-src 'self' https://widget.mtpelerin.com https://www.youtube.com/;
              child-src 'self' https://widget.mtpelerin.com https://www.youtube.com/ https://unpkg.com;
              worker-src 'self' blob: https://unpkg.com;
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://widget.mtpelerin.com https://unpkg.com;
              connect-src *;
              style-src 'self' 'unsafe-inline' https://widget.mtpelerin.com;
            `.replace(/\s{2,}/g, " ").trim()
          }
        ]
      }
    ];
  },
  //eslint-disable-next-line no-unused-vars
  webpack(config) {
    config.externals = config.externals || [];
    config.externals.push(({ request }, callback) => {
      // React's server.node is a JavaScript entry resolved by Next, not a native addon.
      if (request?.endsWith(".node") && request !== "react-server-dom-webpack/server.node") {
        return callback(null, "commonjs " + request);
      }
      callback();
    });

    return config;
  }
};

module.exports = nextConfig;
