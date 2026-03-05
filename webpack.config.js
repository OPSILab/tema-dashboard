const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

function parseDotEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return fs.readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .reduce((acc, line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) {
        return acc;
      }

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) {
        return acc;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();

      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\''))) {
        value = value.slice(1, -1);
      }

      acc[key] = value;
      return acc;
    }, {});
}

const dotEnvValues = parseDotEnv(path.resolve(__dirname, '.env'));
const envKeys = [
  'APP_DASHBOARD_BASE_URL',
  'APP_IDM_BASE_URL',
  'APP_IDM_REALM_NAME',
  'APP_AUTH_PROFILE',
  'APP_CLIENT_ID',
  'APP_CLIENT_SECRET',
  'APP_ENABLE_AUTHENTICATION',
  'APP_IDRA_BASE_URL',
  'APP_MINIO_BASE_URL',
  'APP_ORION_LD_URL_SUBSCRIPTION',
  'APP_ORION_LD_URL_ENTITY',
  'APP_ORION_LD_URL_TYPE',
  'APP_MINIO_HOST',
  'APP_MINIO_PORT',
  'APP_ACCESS_KEY_MINIO',
  'APP_SECRET_KEY_MINIO',
  'APP_URL_AIRFLOW',
  'APP_URL_MINIO',
  'APP_GOOGLE_MAPS_API_KEY',
  'APP_NB_CHAT_GOOGLE_MAPS_API_KEY',
];
const envDefinePluginValues = envKeys.reduce((acc, key) => {
  const value = process.env[key] || dotEnvValues[key] || '';
  acc[`process.env.${key}`] = JSON.stringify(value);
  return acc;
}, {});

module.exports = {
 
  mode: 'development',
  entry: {
    polyfills: './src/polyfills.ts', 
    main: './src/main.ts'
  },  
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    sourcePrefix: '' // Necessario per Cesium
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  amd: {
    // Abilita il caricamento di AMD per Cesium
    toUrlUndefined: true
  },
  resolve: {
    fallback: {
      "buffer": require.resolve("buffer/"),
      "crypto": require.resolve("crypto-browserify"),
      "path": require.resolve("path-browserify"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "zlib": require.resolve("browserify-zlib"),
      "stream": require.resolve("stream-browserify"),
      "fs": require.resolve('browserify-fs'),
      "os": false,
      "timers": require.resolve("timers-browserify"),
      "vm": false,
      "url": false
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      CESIUM_BASE_URL: JSON.stringify('./assets/Cesium'),
      ...envDefinePluginValues,
    })
  ]

};
