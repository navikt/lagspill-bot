/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    serverExternalPackages: ['@navikt/next-logger', 'next-logger', '@slack/bolt'],
    typescript: {
        ignoreBuildErrors: true,
    },
}

export default nextConfig
