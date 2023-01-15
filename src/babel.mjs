import traverse from '@babel/traverse';
import babelParser from '@babel/parser';

async function find(node) {
  /** @type{import('@babel/types').Identifier[]} */
  const nameNodes = [];
  traverse.default(node, {
    Identifier(nodePath) {
      const { node } = nodePath;
      if (node.name === '__dirname' || node.name === '__filename') nameNodes.push(node);
    },
  });

  return nameNodes.sort((a, b) => (b.start ?? 0) - (a.start ?? 0));
}

export async function convert(code, { filename, dirname }) {
  const node = babelParser.parse(code);
  const nameNodes = await find(node);
  if (nameNodes.length === 0) {
    return code;
  }

  let converted = code;
  for (const node of nameNodes) {
    converted = [
      converted.slice(0, node.start),
      node.name === '__dirname' ? dirname : filename,
      converted.slice(node.end),
    ].join('');
  }

  return converted;
}
