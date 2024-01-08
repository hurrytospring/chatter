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
  webpack(config,{isServer}) {
    // Support SVG (aviable )
    config.module.rules.push({
      test: /.md$/,
      use: ['raw-loader'],
    });
    config.browser=config.browser||{}
    config.browser.fs='empty'
    config.browser.crypto='empty'

    config.node = {
      fs: 'empty',
      crypto:'empty'
    }
    return config;
  },
};
