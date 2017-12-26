const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('../webpack/dev.conf');

console.log('[Webpack Dev]');
console.log('-'.repeat(80));
const devServer = new WebpackDevServer(webpack(config), {
  host: 'localhost',
  port: 3000,
});

devServer.listen(3000, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Starting the development server...');
  console.log();
});
