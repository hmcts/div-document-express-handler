const request = require('request');
const { get } = require('lodash');
const applyDocumentFilter = require('../helpers/applyDocumentFilter');

const documentHandler = (options = {}) => {
  if (!options.documentServiceUrl) {
    throw new Error('Document handler requires a document service url to retrieve the documents from');
  }

  return (req, res, next) => {
    const documentName = req.params.documentName;
    const token = req.cookies[options.authorizationTokenCookieName];

    // collect all downloadable files
    let files = options.sessionFileCollectionsPaths
      .reduce((allFiles, path) => {
        const filesInSession = get(req.session, path) || [];
        return [...allFiles, ...filesInSession];
      }, []);

    // filter files if set in options
    files = applyDocumentFilter(options, files);

    const file = files.find(f => {
      const fileName = get(f, options.documentNamePath);
      return fileName === documentName;
    });

    // if no document Id found let the request fall through and be captured by OPP for 404
    if (!file) {
      return next();
    }

    const path = `${options.documentServiceUrl}/${file.id}`;
    const headers = { Authorization: `Bearer ${token}` };

    return request
      .get(path, { headers })
      .on('error', next)
      .pipe(res);
  };
};

module.exports = documentHandler;
