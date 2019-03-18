const config = require('config');
const { get } = require('lodash');

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

    return {
      uri: createUriOptions.uri.replace(':documentId', file.id),
      type: fileName.replace(/[^a-z]/gi, '')
    };
  });
};

module.exports = createUris;