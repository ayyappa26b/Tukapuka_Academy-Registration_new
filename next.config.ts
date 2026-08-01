import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // This site is intentionally tiny — no custom server. It only ever
  // creates a Tenant + the first Tuka User row, then hands the person off
  // to the main TukaPuka app. It does use socket.io-client (browser-only,
  // see hooks/useAcademySocket.ts) to get live updates from the main
  // app's already-running /academy namespace, but never hosts a socket
  // server itself.
}

export default nextConfig
