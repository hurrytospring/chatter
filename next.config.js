/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '**',
      },
    ],
  },
  experimental: {
    turbo: {
      rules: {
        // Option format
        '*.md': ['raw-loader']
      },
    },
  },
  webpack(config) {
    // Support SVG (aviable )
    config.module.rules.push({
      test: /.md$/,
      use: ['raw-loader'],
    });
    return config;
  },
};
