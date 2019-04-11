const { get } = require('lodash');

const applyDocumentFilter = (options = {}, files = []) => {
  const documentFilter = document => {
    const documentName = get(document, options.documentNamePath);
    return options.filterDocuments.find(filterDocument => {
      return documentName.includes(filterDocument);
    });
  };

  if (options.filterDocuments && options.filterDocuments.length) {
    return files.filter(documentFilter);
  }

  return files;
};

module.exports = applyDocumentFilter;