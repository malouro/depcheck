/**
 * @todo:
 *  - Possible Jest config options to consider are the following:
 *    1. jest.config.js
 */

import path from 'path';
import lodash from 'lodash';

function parse(content) {
  try {
    return JSON.parse(content);
  } catch (error) {
    return {}; // ignore parse error silently
  }
}

function importConfig(filePath) {
  try {
    return require(filePath) || {}; // eslint-disable-line global-require
  } catch (err) {
    console.error(err);
    return {}; // ignore error silently?
  }
}

function checkConfig(deps, options = {}) {
  if (options.transform) {
    return deps.filter(dep => Object.values(options.transform).indexOf(dep) !== -1);
  }

  return [];
}

export default function parseJest(content, filePath, deps) {
  const filename = path.basename(filePath);
  let results = [];

  if (filename === 'jest.config.js') {
    const options = importConfig(filePath);

    results = checkConfig(deps, options);
  }

  if (filename === 'package.json') {
    const options = parse(content);

    if (Object.hasOwnProperty.call(options, 'jest')) {
      results = checkConfig(deps, options.jest);
    }
  }

  return results;
}
