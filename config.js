module.exports = {
  defaultArgs: {
    uri: '/document-download/:documentName',
    documentNamePath: 'value.DocumentFileName'
  },
  documentHandlerDefaultArgs: { authorizationTokenCookieName: '__auth-token' },
  createUrisDefaultArgs: {}
};