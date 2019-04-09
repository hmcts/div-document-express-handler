const config = require('../config');
const { get } = require('lodash');
const { parse } = require('path');

const createUris = (files = [], args = {}) => {
  const createUriOptions = Object.assign(
    {},
    config.createUrisDefaultArgs,
    config.defaultArgs,
    args
  );

  return files.map(file => {
    const documentName = get(file, createUriOptions.documentNamePath);
    if (!documentName) {
      throw new Error(`No file name found for file: ${JSON.stringify(file)}`);
    }

    const parsed = parse(documentName);
    return {
      uri: createUriOptions.uri.replace(':documentName', documentName),
      type: parsed.name.replace(/[^a-z]/gi, ''),
      fileType: parsed.ext.replace('.', '')
    };
  });
};

module.exports = createUris;