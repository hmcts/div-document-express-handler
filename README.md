# Divorce Document Express Handler

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A simple module to handle getting documents

## Getting started

### Attach document handler to express app

Attach the document get route to the app like so:
```javascript
const { initDocumentHandler } = require('@hmcts/div-document-express-handler');
const express = require('express');
const idam = require('services/idam');

const app = express();

const middleware = [ idam.protect() ];
const args = {
  // string to define path to attach document donwload handler, default: '/document-download/:documentId' *optional*
  uri: '/document-download/:documentId',
  // only allow files that include the following strings *optional*
  filterDocuments: ['fileName1IncludesString', 'fileName2IncludesString'],
  // string to specifiy auth token cookie, default: '__auth-token' *optional*
  authorizationTokenCookieName: '__auth-token',
  // string to specify the service to fetch the documents from *required*
  documentServiceUrl: 'service-url',
  // array to paths where file collections are stored *required*
  // this is used to get the file id from the session given the file name. all downloadable
  // files must be included in these paths
  sessionFileCollectionsPaths: ['case.data.d8', 'files']
};
initDocumentHandler(app, middleware, args);
```

### Generate urls and file types from file system

Here is an example how to generate file urls and types:
```javascript
const { Page } = require('@hmcts/one-per-page');
const { createUris } = require('@hmcts/div-document-express-handler');

class Step extends Page {
  static get path() {
    return 'some-path';
  }

  get downloadableFiles() {
    const args = {
      // string to define uri where document donwload handler is attached, default: '/document-download/:documentId' *optional*
      uri: 'some-url',
      // only allow files that include the following strings *optional*
      filterDocuments: ['someOtherFile']
    };
    // The first argument is an array of files expected the following format:
    // this.req.session.files = [
    //   {
    //     "id": "401ab79e-34cb-4570-9f2f-4cf9357dc1ec",
    //     "value": {
    //       "DocumentFileName" : "someOtherFile1552043698652633"
    //     }
    //   },
    //   {
    //     "id": "401ab79e-34cb-4570-9f2f-4cf9357dc1ec",
    //     "value": {
    //       "DocumentFileName" : "someFile1552043698652633"
    //     }
    //   }
    // ]
    return createUris(this.req.session.files, args);
  }
}

module.exports = Step;
```

#### To render output using look-and-feel:

template.html:
```HTML
{% from "look-and-feel/components/document-list.njk" import documentList %}

<h3 class="heading-small" id="subsection-title">Download your documents</h3>

{{ documentList(downloadableFiles, content.files) }}
```
main.scss:
```SCSS
@import 'look-and-feel/all';
```
or to import specific styles for document-list
```SCSS
@import 'look-and-feel/document-list';
```

content.json:
```JSON
  {
    "en": {
      "files": {
        "d8petition": "Original Petition",
        "aosinvitation": "Respondent Response",
        "co-respondentaosinvitation": "Co-Respondent Response"
      }
    }
  }
```
This will print the file list out.

## Versioning

We use [SemVer](http://semver.org/) for versioning.
For the versions available, see the tags on this repository.

## Standard API

We follow [RESTful API standards](https://hmcts.github.io/restful-api-standards/).

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

