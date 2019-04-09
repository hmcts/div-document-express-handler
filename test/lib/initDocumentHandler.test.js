const documentHandler = require('../../lib/middleware/documentHandlerMiddleware');
const initDocumentHandler = require('../../lib/initDocumentHandler');
const { expect, sinon } = require('../chai');
const config = require('../../config');
const request = require('request');

describe('lib/initDocumentHandler', () => {
  describe('create and attach handler to specific route', () => {
    const app = { use: sinon.stub() };
    const middleware = sinon.stub();

    before(() => {
      initDocumentHandler(app, [ middleware ], {
        documentServiceUrl: 'http://localhost9000',
        sessionFileCollectionsPaths: ['files']
      });
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
      uri: '/custom/url/for/documents/:documentName',
      authorizationTokenCookieName: '__custom-cookie-name',
      documentServiceUrl: 'some/url',
      sessionFileCollectionsPaths: ['files']
    };

    before(() => {
      initDocumentHandler(app, [], args);
    });

    it('uses cutom path for route', () => {
      expect(app.use)
        .calledWith(args.uri, sinon.match.any, sinon.match.any);
    });

    it('attaches any middlware passed', () => {
      const get = { pipe: sinon.stub() };
      get.on = sinon.stub().returns(get);
      sinon.stub(request, 'get').returns(get);

      const req = {
        params: { documentName: 'file-name' },
        cookies: { '__custom-cookie-name': 'the-auth-token' },
        session: {
          files: [
            {
              id: 'id1',
              value: { DocumentFileName: 'file-name' }
            }
          ]
        }
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
    it('throws error if sessionFileCollectionsPaths not configured properly', () => {
      const shouldThrowError = () => {
        initDocumentHandler();
      };

      expect(shouldThrowError).throws('Document handler sessionFileCollectionsPaths must be included in configuration');
    });

    it('throws error if app.use not available', () => {
      const app = {};
      const shouldThrowError = () => {
        initDocumentHandler(app, [], { sessionFileCollectionsPaths: ['files'], uri: '/some/:documentName' });
      };

      expect(shouldThrowError).throws('Document handler first argument must be an express `app`');
    });

    it('throws error if documentHandlerOptions does not include `:documentName` param', () => {
      const app = { use: sinon.stub() };
      const shouldThrowError = () => {
        initDocumentHandler(app, [], { uri: '/some/url', sessionFileCollectionsPaths: ['files'] });
      };

      expect(shouldThrowError).throws('Document handler uri must include `:documentName` param');
    });
  });
});