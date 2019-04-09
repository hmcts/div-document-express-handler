const config = require('../config');
const documentHandler = require('./middleware/documentHandlerMiddleware');

const initDocumentHandler = (app = {}, middlware = [], args = {}) => {
  const documentHandlerOptions = Object.assign(
    {},
    config.documentHandlerDefaultArgs,
    config.defaultArgs,
    args
  );

  if (!documentHandlerOptions.uri || !documentHandlerOptions.uri.includes(':documentName')) {
    throw new Error('Document handler uri must include `:documentName` param');
  }

  if (!documentHandlerOptions.sessionFileCollectionsPaths || !documentHandlerOptions.sessionFileCollectionsPaths.length) {
    throw new Error('Document handler sessionFileCollectionsPaths must be included in configuration');
  }

  if (!app.use) {
    throw new Error('Document handler first argument must be an express `app`');
  }

  const handler = documentHandler(documentHandlerOptions);
  app.use(documentHandlerOptions.uri, middlware, handler);
};

module.exports = initDocumentHandler;