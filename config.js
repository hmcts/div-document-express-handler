module.exports = {
  defaultArgs: {
    uri: '/document-download/:documentName',
    documentNamePath: 'value.DocumentFileName',
    documentWhiteList: []
  },
  documentHandlerDefaultArgs: { authorizationTokenCookieName: '__auth-token' },
  createUrisDefaultArgs: {}
};