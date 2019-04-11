const request = require('request');
const { get } = require('lodash');
const applyDocumentFilter = require('../helpers/applyDocumentFilter');

const documentHandler = (options = {}) => {
  if (!options.documentServiceUrl) {
    throw new Error('Document handler requires a document service url to retrieve the documents from');
  }

  return (req, res, next) => {
    // set up args object so we can override option params
    const args = Object.assign(
      {},
      options
    );

    // if documentWhiteList is a function replace with result of function
    if (args.documentWhiteList instanceof Function) {
      args.documentWhiteList = args.documentWhiteList(req, res);
    }

    const documentName = req.params.documentName;
    const token = req.cookies[args.authorizationTokenCookieName];

    // collect all downloadable files
    let files = args.sessionFileCollectionsPaths
      .reduce((allFiles, path) => {
        const filesInSession = get(req.session, path) || [];
        return [...allFiles, ...filesInSession];
      }, []);

    // filter files if set in args
    files = applyDocumentFilter(args, files);

    const file = files.find(f => {
      const fileName = get(f, args.documentNamePath);
      return fileName === documentName;
    });

    // if no document Id found let the request fall through and be captured by OPP for 404
    if (!file) {
      return next();
    }

    const path = `${args.documentServiceUrl}/${file.id}`;
    const headers = { Authorization: `Bearer ${token}` };

    return request
      .get(path, { headers })
      .on('error', next)
      .pipe(res);
  };
};

module.exports = documentHandler;
