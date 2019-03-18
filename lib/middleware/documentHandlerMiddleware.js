const request = require('request');

const documentHandler = (options = {}) => {
  if (!options.documentServiceUrl) {
    throw new Error('Document handler requires a document service url to retrieve the documents from');
  }

  return (req, res) => {
    const documentId = req.params.documentId;
    const token = req.cookies[options.authorizationTokenCookieName];

    const path = `${options.documentServiceUrl}/${documentId}`;
    const headers = { Authorization: `Bearer ${token}` };

    request
      .get(path, { headers })
      .pipe(res);
  };
};

module.exports = documentHandler;
