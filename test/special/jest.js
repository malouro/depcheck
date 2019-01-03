/* global describe, it */

import 'should/as-function';
import path from 'path';
import fs from 'fs';
import parse from '../../src/special/jest';

const testConfigPath = path.join(__dirname, '../fake_modules/jest_config/jest.config.js');
const testPackagePath = path.join(__dirname, '../fake_modules/jest_config/package.json');

const testCases = [
  {
    name: 'ignore when no config is given',
    deps: [],
    content: undefined,
    expected: [],
  },
  {
    name: 'ignore when the given config is invalid',
    deps: [],
    content: {
      transform: null,
    },
    expected: [],
  },
  {
    name: 'ignore when the given config is empty',
    deps: [],
    content: '',
    expected: [],
  },
  {
    name: 'handle when there is a JSON parse error',
    deps: [],
    content: '{ json parse error',
    expected: [],
  },
  {
    name: 'recognize transforms',
    deps: ['test-dep'],
    content: {
      transform: {
        'some-regex': 'test-dep',
        'some-other-regex': 'unused-test-dep',
      },
    },
    expected: ['test-dep'],
  },
];

describe('jest special parser', () => {
  it('should ignore unsupported filenames', () => {
    const result = parse('dummy content', 'not-supported.filename', ['deps']);
    result.should.deepEqual([]);
  });

  testCases.forEach(({
    name, deps, content, expected,
  }) => {
    it(`should ${name} in the \`package.json\` Jest config`, () => {
      const result = parse(
        content,
        testPackagePath,
        deps,
      );

      result.should.deepEqual(expected);
    });
  });

  testCases.forEach(({
    name, deps, expected,
  }) => {
    it(`should ${name} in the \`jest.config.js\` config`, () => {
      const result = parse(
        fs.readFileSync(testConfigPath),
        testConfigPath,
        deps,
      );

      result.should.deepEqual(expected);
    });
  });

  it('should detect dependencies used in jest.config.js `transform` options', () => {
    const result = parse(
      fs.readFileSync(testConfigPath),
      testConfigPath,
      ['test-dep', 'unused-dep'],
    );

    result.should.deepEqual(['test-dep']);

    result.includes('missing-dep').should.be.exactly(false);
    result.includes('unused-dep').should.be.exactly(false);
  });

  it('should detect dependencies used in package.json `jest.transform` options', () => {
    const result = parse(
      fs.readFileSync(testPackagePath),
      testPackagePath,
      ['test-dep', 'unused-dep'],
    );

    result.should.deepEqual(['test-dep']);

    result.includes('missing-dep').should.be.exactly(false);
    result.includes('unused-dep').should.be.exactly(false);
  });

  it.skip('should detect custom config transform options from scripts', () => {

  });
});
