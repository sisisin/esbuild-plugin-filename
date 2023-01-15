import fs from 'node:fs';
import path from 'node:path';
const nodeModules = new RegExp(/^(?:.*[\\/])?node_modules(?:\/.*)?$/);
const onLoadFilter = /\.(ts|js|tsx|jsx|mjs|mts)/;

/**
 * @type {() => import('esbuild').Plugin}
 */
export default function filename() {
  return {
    name: 'esbuild-plugin-filename',
    setup(build) {
      const { absWorkingDir, outfile } = build.initialOptions;
      console.log({ absWorkingDir, outfile });
      const outfileDirPath = path.dirname(path.resolve(absWorkingDir ?? process.cwd(), outfile));

      build.onLoad({ filter: onLoadFilter }, (args) => {
        const { path: filePath } = args;
        if (nodeModules.test(filePath)) {
          return;
        }

        const resolved = path.relative(outfileDirPath, filePath);
        const resolvedFilenameContent = `path.resolve(__dirname, '${resolved}')`;
        const resolvedDirnameContent = `path.dirname(path.resolve(__dirname, '${resolved}'))`;

        console.log({ outfilePath: outfileDirPath, filePath, resolved });

        const contents = fs
          .readFileSync(filePath, 'utf8')
          .replaceAll('__dirname', `${resolvedDirnameContent}`)
          .replaceAll('__filename', `${resolvedFilenameContent}`);
        return {
          contents,
          loader: path.extname(filePath).substring(1),
        };
      });
    },
  };
}
