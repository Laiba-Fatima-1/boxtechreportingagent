/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /* Emits a self-contained server bundle in .next/standalone, so the runtime
     image doesn't need node_modules. Required by the Dockerfile. */
  output: "standalone",
  poweredByHeader: false,
};
export default nextConfig;
