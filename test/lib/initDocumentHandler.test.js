const documentHandler = require('../../lib/middleware/documentHandlerMiddleware');
const initDocumentHandler = require('../../lib/initDocumentHandler');
const { expect, sinon } = require('../chai');
const config = require('config');
const request = require('request');

describe('lib/initDocumentHandler', () => {
  describe('create and attach handler to specific route', () => {
    const app = { use: sinon.stub() };
    const middleware = sinon.stub();

    before(() => {
      initDocumentHandler(app, [ middleware ], { documentServiceUrl: 'http://localhost9000' });
    });

    it('attaches a route to the express app', () => {
      expect(app.use)
        .calledWith(config.defaultArgs.uri, sinon.match.any, sinon.match.any);
    });

    it('attaches any middlware passed', () => {
      expect(app.use)
        .calledWith(sinon.match.any, [ middleware ], sinon.match.any);
    });

    it('attaches any handler passed', () => {
      const handler = app.use.firstCall.args[2];
      expect(handler.toString()).to.eql(documentHandler({ documentServiceUrl: 'http://localhost9000' }).toString());
    });
  });

  describe('config', () => {
    const app = { use: sinon.stub() };
    const args = {
      uri: '/custom/url/for/documents/:documentId',
      authorizationTokenCookieName: '__custom-cookie-name',
      documentServiceUrl: 'some/url'
    };

    before(() => {
      initDocumentHandler(app, [], args);
    });

    it('uses cutom path for route', () => {
      expect(app.use)
        .calledWith(args.uri, sinon.match.any, sinon.match.any);
    });

    it('attaches any middlware passed', () => {
      sinon.stub(request, 'get').returns({ pipe: sinon.stub() });

      const req = {
        params: { documentId: '123' },
        cookies: { '__custom-cookie-name': 'the-auth-token' }
      };
      const res = sinon.stub();
      const handler = app.use.firstCall.args[2];
      handler(req, res);

      const headers = { Authorization: `Bearer ${req.cookies['__custom-cookie-name']}` };
      expect(request.get).calledWith(sinon.match.any, { headers });

      request.get.restore();
    });
  });

  describe('errors', () => {
    it('throws error if app.use not available', () => {
      const shouldThrowError = () => {
        initDocumentHandler();
      };

      expect(shouldThrowError).throws('Document handler first argument must be an express `app`');
    });

    it('throws error if documentHandlerOptions does not include `:documentId` param', () => {
      const app = { use: sinon.stub() };
      const shouldThrowError = () => {
        initDocumentHandler(app, [], { uri: '/some/url' });
      };

      expect(shouldThrowError).throws('Document handler uri must include `:documentId` param');
    });
  });
});