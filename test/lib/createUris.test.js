const createUris = require('../../lib/createUris');
const { expect } = require('../chai');
const config = require('../../config');

const THREE = 3;

describe('lib/createUris', () => {
  describe('type and url', () => {
    let results = {};
    let files = [];
    before(() => {
      files = [
        {
          id: 'id1',
          value: { DocumentFileName: 'filename1234567890.pdf' }
        }, {
          id: 'id2',
          value: { DocumentFileName: 'filename!@£$%^&*(.jpg' }
        }, {
          id: 'id3',
          value: { DocumentFileName: 'filename_+":?|}{><.mp3' }
        }
      ];
      results = createUris(files);
    });

    it('returns a list urls, types, file extension', () => {
      expect(results.length).to.eql(THREE);
      results.forEach(result => {
        expect(result.hasOwnProperty('uri'));
        expect(result.hasOwnProperty('type'));
        expect(result.hasOwnProperty('fileType'));
      });
    });

    it('strips any non alphanumeric characters from value to form a type', () => {
      results.forEach(result => {
        expect(result.type).to.eql('filename');
      });
    });

    it('creates a url to access file', () => {
      results.forEach((result, index) => {
        const uri = config.defaultArgs.uri.replace(':documentName', `${files[index].value.DocumentFileName}`);
        expect(result.uri).to.eql(uri);
      });
    });

    it('parses the correct file type', () => {
      expect(results[0].fileType).to.eql('pdf');
      expect(results[1].fileType).to.eql('jpg');
      expect(results[2].fileType).to.eql('mp3');
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
      documentNamePath: 'name',
      uri: '/a/different/path/to/file/:documentName'
    };

    it('used custom uri to generate file uri', () => {
      results = createUris(files, args);
      const uri = args.uri.replace(':documentName', `${files[0].name}`);
      expect(results[0].uri).to.eql(uri);
    });

    it('used custom documentNamePath to get filename', () => {
      results = createUris(files, args);
      expect(results[0].type).to.eql('filename');
    });

    it('handles when no files or arguments parsed', () => {
      results = createUris();
      expect(results.length).to.eql(0);
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