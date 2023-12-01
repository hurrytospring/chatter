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
};
