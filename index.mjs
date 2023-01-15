import fs from 'node:fs/promises';
import path from 'node:path';
const nodeModules = new RegExp(/^(?:.*[\\/])?node_modules(?:\/.*)?$/);
const onLoadFilter = /\.(ts|js|tsx|jsx|mjs|mts)/;
import { convert } from './src/babel.mjs';
/**
 * @type {() => import('esbuild').Plugin}
 */
export default function filename() {
  return {
    name: 'esbuild-plugin-filename',
    setup(build) {
      const { absWorkingDir, outfile } = build.initialOptions;
      const outfileDirPath = path.dirname(path.resolve(absWorkingDir ?? process.cwd(), outfile));

      build.onLoad({ filter: onLoadFilter }, async (args) => {
        const { path: filePath } = args;
        if (nodeModules.test(filePath)) {
          return;
        }

        // todo: support esm
        const moduleType = 'cjs';
        const contents = await convert(
          await fs.readFile(filePath, 'utf8'),
          getContent(moduleType, outfileDirPath, filePath),
        );
        return {
          contents,
          loader: path.extname(filePath).substring(1),
        };
      });
    },
  };
}

function getContent(moduleType, outfileDirPath, filePath) {
  const resolved = path.relative(outfileDirPath, filePath);
  switch (moduleType) {
    case 'cjs': {
      const filename = `require('path').resolve(__dirname, '${resolved}')`;
      const dirname = `require('path').dirname(require('path').resolve(__dirname, '${resolved}'))`;

      return { filename, dirname };
    }

    default:
      break;
  }
}
