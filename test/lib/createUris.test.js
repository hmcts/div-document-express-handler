const createUris = require('../../lib/createUris');
const { expect } = require('../chai');
const config = require('../../config');

const THREE = 3;

describe('lib/createUris', () => {
  describe('type and url', () => {
    let results = {};
    before(() => {
      const files = [
        {
          id: 'id1',
          value: { DocumentFileName: 'filename1234567890' }
        }, {
          id: 'id2',
          value: { DocumentFileName: 'filename!@£$%^&*(' }
        }, {
          id: 'id3',
          value: { DocumentFileName: 'filename_+":?|}{><' }
        }
      ];
      results = createUris(files);
    });

    it('returns a list urls and types', () => {
      expect(results.length).to.eql(THREE);
      results.forEach(result => {
        expect(result.hasOwnProperty('uri'));
        expect(result.hasOwnProperty('type'));
      });
    });

    it('strips any non alphanumeric characters from value to form a type', () => {
      results.forEach(result => {
        expect(result.type).to.eql('filename');
      });
    });

    it('creates a url to access file', () => {
      results.forEach((result, index) => {
        const uri = config.defaultArgs.uri.replace(':documentId', `id${index + 1}`);
        expect(result.uri).to.eql(uri);
      });
    });
  });

  describe('config', () => {
    let results = {};
    const files = [
      {
        id: 'id1',
        name: 'filename_+":?|}{><'
      }
    ];
    const args = {
      fileNamePath: 'name',
      uri: '/a/different/path/to/file/:documentId'
    };

    before(() => {
      results = createUris(files, args);
    });

    it('used custom uri to generate file uri', () => {
      const uri = args.uri.replace(':documentId', 'id1');
      expect(results[0].uri).to.eql(uri);
    });

    it('used custom fileNamePath to get filename', () => {
      expect(results[0].type).to.eql('filename');
    });
  });

  describe('errors', () => {
    const files = [ { id: 'id1' } ];

    it('throws an error if cannot find file name', () => {
      const shouldThrowError = () => {
        return createUris(files);
      };
      expect(shouldThrowError).throws('No file name found for file: {"id":"id1"}');
    });
  });
});