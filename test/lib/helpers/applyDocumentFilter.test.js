const applyDocumentFilter = require('../../../lib/helpers/applyDocumentFilter');
const { expect } = require('../../chai');
const config = require('../../../config');

const files = [
  {
    id: '401ab79e-34cb-4570-9f2f-4cf9357dc1ec',
    value: { DocumentFileName: 'document-one' }
  },
  {
    id: '401ab79e-34cb-4570-9f2f-gsd7452sg211',
    value: { DocumentFileName: 'document-two' }
  },
  {
    id: '401ab79e-34cb-4570-9f2f-gsd7452sg211',
    value: { DocumentFileName: 'document-three' }
  }
];

describe('lib/helpers/applyDocumentFilter', () => {
  it('filters documents if filterDocuments option supplied', () => {
    const options = Object.assign(
      {},
      config.documentHandlerDefaultArgs,
      config.defaultArgs,
      { filterDocuments: ['document-one', 'document-three'] }
    );

    const filteredFiles = applyDocumentFilter(options, files);

    expect(filteredFiles).to.eql([files[0], files[2]]);
  });

  it('doesnt filter documents if no filterDocuments supplied', () => {
    const options = Object.assign(
      {},
      config.documentHandlerDefaultArgs,
      config.defaultArgs
    );

    const filteredFiles = applyDocumentFilter(options, files);

    expect(filteredFiles).to.eql(files);
  });

  it('returns empty array with no options or files supplied', () => {
    const filteredFiles = applyDocumentFilter();

    expect(filteredFiles).to.eql([]);
  });
});