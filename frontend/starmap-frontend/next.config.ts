// next.config.ts
import { NextConfig } from 'next';
import { NextFederationPlugin } from '@module-federation/nextjs-mf';
import { Configuration } from 'webpack';

const nextConfig: NextConfig = {
  webpack: (config: Configuration, _options: any): Configuration => {
    config.plugins?.push(
      new NextFederationPlugin({
        name: 'starmapFrontend',
        filename: 'static/chunks/remoteEntry.js',
        exposes: {
          './StarMap': './components/StarMap',
          './SystemDetails': './components/SystemDetails',
          './JourneyPlanner': './components/JourneyPlanner',
        },
        remotes: {},
        shared: {
          react: {
            singleton: true,
            requiredVersion: false,
          },
          'react-dom': {
            singleton: true,
            requiredVersion: false,
          },
        },
        extraOptions: {},
      })
    );
    return config;
  },
};

export default nextConfig;