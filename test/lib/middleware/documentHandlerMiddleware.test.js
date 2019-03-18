const documentHandlerMiddleware = require('../../../lib/middleware/documentHandlerMiddleware');
const sinon = require('sinon');
const request = require('request');
const { expect } = require('../../chai');

describe('lib/middleware/documentHandlerMiddleware', () => {
  let pipe = {};

  before(() => {
    pipe = sinon.stub();
    sinon.stub(request, 'get').returns({ pipe });
  });

  after(() => {
    request.get.restore();
  });

  describe('execute request', () => {
    const req = {
      params: { documentId: '123' },
      cookies: { '__auth-token': 'some-token' }
    };
    const res = sinon.stub();

    const options = { documentServiceUrl: 'http://localhost9000' };

    before(() => {
      const handler = documentHandlerMiddleware(options);
      handler(req, res);
    });

    it('middleware pipes response from request', () => {
      expect(request.get.called).to.eql(true);
    });

    it('middleware pipes response from request', () => {
      expect(pipe).calledWith(res);
    });

    it('uses the correct url', () => {
      const path = `${options.documentServiceUrl}/${req.params.documentId}`;
      expect(request.get).calledWith(path, sinon.match.any);
    });
  });

  describe('config', () => {
    const req = {
      params: { documentId: '123' },
      cookies: { '__custom-token-name': 'some-token' }
    };
    const res = sinon.stub();

    const options = {
      authorizationTokenCookieName: '__custom-token-name',
      documentServiceUrl: 'http://localhost9000'
    };

    before(() => {
      const handler = documentHandlerMiddleware(options);
      handler(req, res);
    });

    it('uses a custom token name', () => {
      const headers = { Authorization: `Bearer ${req.cookies['__custom-token-name']}` };
      expect(request.get).calledWith(sinon.match.any, { headers });
    });

    it('uses the correct url', () => {
      expect(request.get.firstCall.args[0])
        .to.include(options.documentServiceUrl);
    });
  });

  describe('errors', () => {
    it('throws error if documentServiceUrl not specified', () => {
      const shouldThrowError = () => {
        documentHandlerMiddleware();
      };

      expect(shouldThrowError).throws('Document handler requires a document service url to retrieve the documents from');
    });
  });
});