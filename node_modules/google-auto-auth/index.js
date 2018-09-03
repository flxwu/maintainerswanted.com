'use strict';

var async = require('async');
var crypto = require('crypto');
var fs = require('fs');
var GoogleAuth = require('google-auth-library').GoogleAuth;
var gcpMetadata = require('gcp-metadata');
var path = require('path');
var request = require('request');

class Auth {
  constructor(config) {
    this.authClientPromise = null;
    this.authClient = null;
    this.googleAuthClient = null;
    this.config = config || {};
    this.credentials = null;
    this.environment = {};
    this.jwtClient = null;
    this.projectId = this.config.projectId;
    this.token = this.config.token;
  }

  authorizeRequest (reqOpts, callback) {
    this.getToken((err, token) => {
      if (err) {
        callback(err);
        return;
      }

      var authorizedReqOpts = Object.assign({}, reqOpts, {
        headers: Object.assign({}, reqOpts.headers, {
          Authorization: `Bearer ${token}`
        })
      });

      callback(null, authorizedReqOpts);
    });
  }

  getAuthClient (callback) {
    if (this.authClient) {
      // This code works around an issue with context loss with async-listener.
      // Strictly speaking, this should not be necessary as the call to
      // authClientPromise.then(..) below would resolve to the same value.
      // However, async-listener defaults to resuming the `then` callbacks with
      // the context at the point of resolution rather than the context from the
      // point where the `then` callback was added. In this case, the promise
      // will be resolved on the very first incoming http request, and that
      // context will become sticky (will be restored by async-listener) around
      // the `then` callbacks for all subsequent requests.
      //
      // This breaks APM tools like Stackdriver Trace & others and tools like
      // long stack traces (they will provide an incorrect stack trace).
      //
      // NOTE: this doesn't solve the problem generally. Any request concurrent
      // to the first call to this function, before the promise resolves, will
      // still lose context. We don't have a better solution at the moment :(.
      return setImmediate(callback.bind(null, null, this.authClient));
    }

    var createAuthClientPromise = (resolve, reject) => {
      var config = this.config;
      var keyFile = config.keyFilename || config.keyFile;

      this.googleAuthClient = new GoogleAuth();

      var addScope = (err, authClient, projectId) => {
        if (err) {
          reject(err);
          return;
        }

        if (authClient.createScopedRequired && authClient.createScopedRequired()) {
          if (!config.scopes || config.scopes.length === 0) {
            var scopeError = new Error('Scopes are required for this request.');
            scopeError.code = 'MISSING_SCOPE';
            reject(scopeError);
            return;
          }
        }

        authClient.scopes = config.scopes;
        this.authClient = authClient;
        this.projectId = config.projectId || projectId || authClient.projectId;

        if (!this.projectId) {
          this.googleAuthClient.getDefaultProjectId((err, projectId) => {
            // Ignore error, since the user might not require a project ID.

            if (projectId) {
              this.projectId = projectId;
            }

            resolve(authClient);
          });
          return;
        }

        resolve(authClient);
      };

      if (config.credentials) {
        try {
          var client = this.googleAuthClient.fromJSON(config.credentials);
          addScope(null, client);
        } catch (e) {
          addScope(e);
        }
      } else if (keyFile) {
        keyFile = path.resolve(process.cwd(), keyFile);

        fs.readFile(keyFile, (err, contents) => {
          if (err) {
            reject(err);
            return;
          }

          try {
            var client = this.googleAuthClient.fromJSON(JSON.parse(contents));
            addScope(null, client);
          } catch(e) {
            // @TODO Find a better way to do this.
            // Ref: https://github.com/googleapis/nodejs-storage/issues/147
            // Ref: https://github.com/google/google-auth-library-nodejs/issues/313
            var client = this.googleAuthClient.fromJSON({
              type: 'jwt-pem-p12',
              client_email: config.email,
              private_key: keyFile
            });
            delete client.key;
            client.keyFile = keyFile;
            this.jwtClient = client;
            addScope(null, client);
          }
        });
      } else {
        this.googleAuthClient.getApplicationDefault(addScope);
      }
    };

    if (!this.authClientPromise) {
      this.authClientPromise = new Promise(createAuthClientPromise);
    }

    this.authClientPromise.then((authClient) => {
      callback(null, authClient);
      // The return null is needed to avoid a spurious warning if the user is
      // using bluebird.
      // See: https://github.com/stephenplusplus/google-auto-auth/issues/28
      return null;
    }).catch(callback);
  }

  getCredentials (callback) {
    if (this.credentials) {
      setImmediate(() => {
        callback(null, this.credentials);
      });
      return;
    }

    this.getAuthClient((err) => {
      if (err) {
        callback(err);
        return;
      }

      this.googleAuthClient.getCredentials((err, credentials) => {
        if (err) {
          callback(err);
          return;
        }

        this.credentials = credentials;

        if (this.jwtClient) {
          this.jwtClient.authorize(err => {
            if (err) {
              callback(err);
              return;
            }

            this.credentials.private_key = this.jwtClient.key;

            callback(null, this.credentials);
          });
          return;
        }

        callback(null, this.credentials);
      });
    });
  }

  getEnvironment (callback) {
    async.parallel([
      cb => this.isAppEngine(cb),
      cb => this.isCloudFunction(cb),
      cb => this.isComputeEngine(cb),
      cb => this.isContainerEngine(cb)
    ], () => {
      callback(null, this.environment);
    });
  }

  getProjectId (callback) {
    if (this.projectId) {
      setImmediate(() => {
        callback(null, this.projectId);
      });
      return;
    }

    this.getAuthClient(err => {
      if (err) {
        callback(err);
        return;
      }

      callback(null, this.projectId);
    });
  }

  getToken (callback) {
    if (this.token) {
      setImmediate(callback, null, this.token);
      return;
    }

    this.getAuthClient((err, client) => {
      if (err) {
        callback(err);
        return;
      }

      client.getAccessToken(callback);
    });
  }

  isAppEngine (callback) {
    setImmediate(() => {
      var env = this.environment;

      if (typeof env.IS_APP_ENGINE === 'undefined') {
        env.IS_APP_ENGINE = !!(process.env.GAE_SERVICE || process.env.GAE_MODULE_NAME);
      }

      callback(null, env.IS_APP_ENGINE);
    });
  }

  isCloudFunction (callback) {
    setImmediate(() => {
      var env = this.environment;

      if (typeof env.IS_CLOUD_FUNCTION === 'undefined') {
        env.IS_CLOUD_FUNCTION = !!process.env.FUNCTION_NAME;
      }

      callback(null, env.IS_CLOUD_FUNCTION);
    });
  }

  isComputeEngine (callback) {
    var env = this.environment;

    if (typeof env.IS_COMPUTE_ENGINE !== 'undefined') {
      setImmediate(() => {
        callback(null, env.IS_COMPUTE_ENGINE);
      });
      return;
    }

    request('http://metadata.google.internal', (err, res) => {
      env.IS_COMPUTE_ENGINE = !err && res.headers['metadata-flavor'] === 'Google';

      callback(null, env.IS_COMPUTE_ENGINE);
    });
  }

  isContainerEngine (callback) {
    var env = this.environment;

    if (typeof env.IS_CONTAINER_ENGINE !== 'undefined') {
      setImmediate(() => {
        callback(null, env.IS_CONTAINER_ENGINE);
      });
      return;
    }

    gcpMetadata.instance('/attributes/cluster-name')
      .then(() => {
        env.IS_CONTAINER_ENGINE = true;
        callback(null, env.IS_CONTAINER_ENGINE);
      })
      .catch(() => {
        env.IS_CONTAINER_ENGINE = false
        callback(null, env.IS_CONTAINER_ENGINE);
      });
  }

  sign (data, callback) {
    this.getCredentials((err, credentials) => {
      if (err) {
        callback(err);
        return;
      }

      if (credentials.private_key) {
        this._signWithPrivateKey(data, callback);
      } else {
        this._signWithApi(data, callback);
      }
    });
  }

  // `this.getCredentials()` will always have been run by this time
  _signWithApi (data, callback) {
    if (!this.projectId) {
      callback(new Error('Cannot sign data without a project ID.'));
      return;
    }

    var client_email = this.credentials.client_email;

    if (!client_email) {
      callback(new Error('Cannot sign data without `client_email`.'));
      return;
    }

    var idString = `projects/${this.projectId}/serviceAccounts/${client_email}`;

    var reqOpts = {
      method: 'POST',
      uri: `https://iam.googleapis.com/v1/${idString}:signBlob`,
      json: {
        bytesToSign: Buffer.from(data).toString('base64')
      }
    };

    this.authorizeRequest(reqOpts, (err, authorizedReqOpts) => {
      if (err) {
        callback(err);
        return;
      }

      request(authorizedReqOpts, function (err, resp, body) {
        var response = resp.toJSON();

        if (!err && response.statusCode < 200 || response.statusCode >= 400) {
          if (typeof response.body === 'object') {
            var apiError = response.body.error;
            err = new Error(apiError.message);
            Object.assign(err, apiError);
          } else {
            err = new Error(response.body);
            err.code = response.statusCode;
          }
        }

        callback(err, body && body.signature);
      });
    });
  }

  // `this.getCredentials()` will always have been run by this time
  _signWithPrivateKey (data, callback) {
    var sign = crypto.createSign('RSA-SHA256');
    sign.update(data);
    callback(null, sign.sign(this.credentials.private_key, 'base64'));
  }
}

module.exports = config => {
  return new Auth(config);
};
