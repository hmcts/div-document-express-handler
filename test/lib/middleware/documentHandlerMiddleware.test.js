const documentHandlerMiddleware = require('../../../lib/middleware/documentHandlerMiddleware');
const sinon = require('sinon');
const request = require('request');
const { expect } = require('../../chai');
const config = require('../../../config');

describe('lib/middleware/documentHandlerMiddleware', () => {
  let pipe = {};
  let get = {};

  before(() => {
    pipe = sinon.stub();
    get = { pipe };
    get.on = sinon.stub().returns(get);
    sinon.stub(request, 'get').returns(get);
  });

  after(() => {
    request.get.restore();
  });

  describe('execute request', () => {
    const req = {
      params: { documentName: 'file-1' },
      cookies: { '__auth-token': 'some-token' },
      session: {
        files: [
          {
            id: '401ab79e-34cb-4570-9f2f-4cf9357dc1ec',
            value: { DocumentFileName: 'file-1' }
          },
          {
            id: '401ab79e-34cb-4570-9f2f-gsd7452sg211',
            value: { DocumentFileName: 'file-2' }
          }
        ]
      }
    };
    const res = sinon.stub();

    const options = Object.assign(
      {},
      config.documentHandlerDefaultArgs,
      config.defaultArgs,
      {
        documentServiceUrl: 'http://localhost9000',
        sessionFileCollectionsPaths: ['files']
      }
    );

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
      const path = `${options.documentServiceUrl}/${req.session.files[0].id}`;
      expect(request.get).calledWith(path);
    });
  });

  describe('find files in multiple locations', () => {
    const req = {
      params: { documentName: 'file-1' },
      cookies: { '__auth-token': 'some-token' },
      session: {
        files: [
          {
            id: '401ab79e-34cb-4570-9f2f-4cf9357dc1ec',
            value: { DocumentFileName: 'file-1' }
          }
        ],
        case: {
          files: [
            {
              id: '401ab79e-34cb-4570-9f2f-asgasg6532',
              value: { DocumentFileName: 'file-2' }
            }
          ]
        }
      }
    };
    const res = sinon.stub();

    const options = Object.assign(
      {},
      config.documentHandlerDefaultArgs,
      config.defaultArgs,
      {
        documentServiceUrl: 'http://localhost9000',
        sessionFileCollectionsPaths: ['files', 'case.files']
      }
    );

    const handler = documentHandlerMiddleware(options);

    it('file-1', () => {
      req.params.documentName = 'file-1';
      handler(req, res);
      const path = `${options.documentServiceUrl}/${req.session.files[0].id}`;
      expect(request.get).calledWith(path);
    });

    it('file-2', () => {
      req.params.documentName = 'file-2';
      handler(req, res);
      const path = `${options.documentServiceUrl}/${req.session.case.files[0].id}`;
      expect(request.get).calledWith(path);
    });
  });

  describe('config', () => {
    const req = {
      params: { documentName: 'file-1' },
      cookies: { '__custom-token-name': 'some-token' },
      session: {
        files: [
          {
            id: '401ab79e-34cb-4570-9f2f-4cf9357dc1ec',
            value: { DocumentFileName: 'file-1' }
          }
        ]
      }
    };
    const res = sinon.stub();

    const options = Object.assign(
      {},
      config.documentHandlerDefaultArgs,
      config.defaultArgs,
      {
        authorizationTokenCookieName: '__custom-token-name',
        documentServiceUrl: 'http://localhost9000',
        sessionFileCollectionsPaths: ['files']
      }
    );

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

    it('parses error to next if request fails', () => {
      const req = {
        params: { documentName: 'file-1' },
        cookies: { '__auth-token': 'some-token' },
        session: {
          files: [
            {
              id: '401ab79e-34cb-4570-9f2f-4cf9357dc1ec',
              value: { DocumentFileName: 'file-1' }
            }
          ]
        }
      };
      const res = sinon.stub();
      const next = sinon.stub();

      const options = Object.assign(
        {},
        config.documentHandlerDefaultArgs,
        config.defaultArgs,
        {
          authorizationTokenCookieName: '__custom-token-name',
          documentServiceUrl: 'http://localhost9000',
          sessionFileCollectionsPaths: ['files']
        }
      );
      const handler = documentHandlerMiddleware(options);

      handler(req, res, next);

      expect(get.on.calledWith('error', next)).to.eql(true);
    });

    it('if file not found calls next', () => {
      const req = {
        params: { documentName: 'file-2' },
        cookies: { '__auth-token': 'some-token' },
        session: {}
      };
      const res = sinon.stub();
      const next = sinon.stub();

      const options = Object.assign(
        {},
        config.documentHandlerDefaultArgs,
        config.defaultArgs,
        {
          authorizationTokenCookieName: '__custom-token-name',
          documentServiceUrl: 'http://localhost9000',
          sessionFileCollectionsPaths: ['files']
        }
      );
      const handler = documentHandlerMiddleware(options);

      handler(req, res, next);

      expect(next.calledOnce).to.eql(true);
    });
  });
});