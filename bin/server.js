#!/usr/bin/env node
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('../webpack.config');
const port = 2345;
const host = 'localhost';

const serverConfig = {
  host,
  port,
  hot: false,
  liveReload: false,
  historyApiFallback: {
    // Allow loading urls like /pdf/sheet.pdf
    disableDotRule: true,
  },

  // TODO - Make this more secure.

  // headers: {
  //   'X-Content-Type-Options': 'nosniff',
  //   'X-XSS-Protection': '1; mode=block',
  //   'X-Frame-Options': 'SAMEORIGIN',
  //   'Referrer-Policy': 'same-origin',
  //   'Content-Security-Policy':
  //     "default-src 'self'; " +
  //     "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
  //     "font-src 'self' https://fonts.gstatic.com; " +
  //     'img-src http: https: data:; ' +
  //     "object-src 'none'; " +
  //     'connect-src *; ' +
  //     "frame-ancestors 'self'; " +
  //     "form-action 'none' ",
  // },
  static: false,
};

const server = new WebpackDevServer(serverConfig, webpack(config));
server.start().catch((err) => console.log(err));
