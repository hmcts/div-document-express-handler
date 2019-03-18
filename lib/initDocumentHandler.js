const config = require('config');
const documentHandler = require('./middleware/documentHandlerMiddleware');

const initDocumentHandler = (app = {}, middlware = [], args = {}) => {
  const documentHandlerOptions = Object.assign(
    {},
    config.documentHandlerDefaultArgs,
    config.defaultArgs,
    args
  );

  if (!documentHandlerOptions.uri.includes(':documentId')) {
    throw new Error('Document handler uri must include `:documentId` param');
  }

  if (!app.use) {
    throw new Error('Document handler first argument must be an express `app`');
  }

  const handler = documentHandler(documentHandlerOptions);
  app.use(documentHandlerOptions.uri, middlware, handler);
};

module.exports = initDocumentHandler;