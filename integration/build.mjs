import esbuild from 'esbuild';
import filename from '../index.mjs';

/**
 * @type {import('esbuild')}
 */
await esbuild.build({
  entryPoints: ['./src/index.js'],
  outfile: 'out/bundle.js',
  plugins: [filename()],
});
