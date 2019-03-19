const config = require('../config');
const { get } = require('lodash');
const { parse } = require('path');

const createUris = (files, args = {}) => {
  const createUriOptions = Object.assign(
    {},
    config.createUrisDefaultArgs,
    config.defaultArgs,
    args
  );

  return files.map(file => {
    const fileName = get(file, createUriOptions.fileNamePath);
    if (!fileName) {
      throw new Error(`No file name found for file: ${JSON.stringify(file)}`);
    }

    const parsed = parse(fileName);
    return {
      uri: createUriOptions.uri.replace(':documentId', file.id),
      type: parsed.name.replace(/[^a-z]/gi, ''),
      fileType: parsed.ext.replace(/[^a-z]/gi, '').toUpperCase()
    };
  });
};

module.exports = createUris;