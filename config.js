module.exports = {
  defaultArgs: {
    uri: '/document-download/:documentName',
    documentNamePath: 'value.DocumentFileName',
    filterDocuments: []
  },
  documentHandlerDefaultArgs: { authorizationTokenCookieName: '__auth-token' },
  createUrisDefaultArgs: {}
};