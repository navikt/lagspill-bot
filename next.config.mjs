/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    output: 'standalone',
    eslint: {
        ignoreDuringBuilds: true,
        dirs: ['src'],
    },
    serverExternalPackages: ['@navikt/next-logger', 'next-logger', '@slack/bolt'],
    typescript: {
        ignoreBuildErrors: true,
    },
}

export default nextConfig
