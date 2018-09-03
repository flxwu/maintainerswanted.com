# Connect Session Firebase

[![Travis](https://img.shields.io/travis/benweier/connect-session-firebase.svg?maxAge=2592000&style=flat-square)](https://travis-ci.org/benweier/connect-session-firebase)
[![Coverage](https://img.shields.io/coveralls/github/benweier/connect-session-firebase.svg?maxAge=2592000&style=flat-square)](https://coveralls.io/github/benweier/connect-session-firebase)
[![Greenkeeper badge](https://img.shields.io/badge/greenkeeper-enabled-brightgreen.svg?style=flat-square)](https://greenkeeper.io/)

`connect-session-firebase` is a Connect/Express compatible session store backed by the [Firebase SDK](https://firebase.google.com/docs/admin/setup).

## Installation

`firebase-admin` must be added as a peer dependency, or you're gonna have a bad time. `connect-session-firebase` expects a matching `major.minor` version of Firebase.

    $ npm install firebase-admin connect-session-firebase --save

## Options

  - `database` A pre-initialized Firebase Database app instance.
  - `sessions` (optional) A child reference string for session storage. (defaults to "sessions")
  - `reapInterval` (optional) How often expired sessions should be cleaned up. (defaults to `21600000`, 6 hours in milliseconds)
  - `reapCallback` (optional) A callback function to execute whenever a session clean up occurs.
  - `errorIfSessionNotFound` (optional) Return an error object to the callback if a session doesn't exist. Only useful if you want to log when a session is no longer available. (defaults to `false`)

## Usage

Initialize `firebase-admin` database and pass the instance to `FirebaseStore`. Connecting to the database requires a credential cert via a JSON file from the [Firebase IAM & Admin Console](https://console.firebase.google.com/iam-admin/projects).

* [Connect](http://senchalabs.github.io/connect)

```js
const connect = require('connect');
const FirebaseStore = require('connect-session-firebase')(connect);
const firebase = require('firebase-admin');
const ref = firebase.initializeApp({
  credential: firebase.credential.cert('path/to/serviceAccountCredentials.json'),
  databaseURL: 'https://databaseName.firebaseio.com'
});

connect()
  .use(connect.cookieParser())
  .use(connect.session({
    store: new FirebaseStore({
      database: ref.database()
    }),
    secret: 'keyboard cat'
  }));
```

* [Express](http://expressjs.com)

  **NOTE:** In Express 4 `express-session` must be passed to the function `connect-session-firebase` exports in order to extend `express-session.Store`:

```js
const express = require('express');
const session = require('express-session');
const FirebaseStore = require('connect-session-firebase')(session);
const firebase = require('firebase-admin');
const ref = firebase.initializeApp({
  credential: firebase.credential.cert('path/to/serviceAccountCredentials.json'),
  databaseURL: 'https://databaseName.firebaseio.com'
});

express()
  .use(session({
    store: new FirebaseStore({
      database: ref.database()
    }),
    secret: 'keyboard cat'
    resave: true,
    saveUninitialized: true
  }));
```

## Security

If you use a publicly available Firebase Database, please set proper rules:

```json
{
  "rules": {
    ".read": "false",
    ".write": "false",
    "sessions": {
      ".read": "false",
      ".write": "false"
    },
    "some_public_data": {
      ".read": "true",
      ".write": "auth !== null"
    }
  }
}
```

Learn more about Firebase rules: https://firebase.google.com/docs/database/security/

## Tests

To run tests against `connect-session-firebase` you will need your own Firebase Database app available.

Checkout the repo locally and create two files in the project root:
- .env
- serviceAccountCredentials.json

With the content:

*.env*
```
FIREBASE_SERVICE_ACCOUNT=./serviceAccountCredentials.json
FIREBASE_DATABASE_URL=https://[databaseName].firebaseio.com
```

*serviceAccountCredentials.json*
```
{
  "type": "service_account",
  "project_id": "",
  "private_key_id": "",
  "private_key": "",
  "client_email": "",
  "client_id": "",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://accounts.google.com/o/oauth2/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": ""
}
```

Install the dev dependencies:

    $ npm install

Run the tests:

    $ npm test

## License

`connect-session-firebase` is licensed under the [MIT license](https://github.com/benweier/connect-session-firebase/blob/master/LICENSE).
