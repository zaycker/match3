process.env.NODE_ENV = 'production';

const webpack = require('webpack');
const config = require('../webpack/prod.conf');

function build() {
  console.log('Creating an optimized production build...');
  webpack(config).run((err, stats) => {
    if (err) {
      console.error('Failed to compile.', [err]);
      process.exit(1);
    }

    if (stats.compilation.errors.length) {
      console.error('Failed to compile.', stats.compilation.errors);
      process.exit(1);
    }

    if (process.env.CI && stats.compilation.warnings.length) {
      console.error('Failed to compile.', stats.compilation.warnings);
      process.exit(1);
    }

    console.log('Compiled successfully.');
  });
}

build();
