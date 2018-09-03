/*! firebase-admin v6.0.0 */
"use strict";
/*!
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var user_record_1 = require("./user-record");
var token_generator_1 = require("./token-generator");
var auth_api_request_1 = require("./auth-api-request");
var error_1 = require("../utils/error");
var utils = require("../utils/index");
var validator = require("../utils/validator");
var token_verifier_1 = require("./token-verifier");
/**
 * Internals of an Auth instance.
 */
var AuthInternals = /** @class */ (function () {
    function AuthInternals() {
    }
    /**
     * Deletes the service and its associated resources.
     *
     * @return {Promise<()>} An empty Promise that will be fulfilled when the service is deleted.
     */
    AuthInternals.prototype.delete = function () {
        // There are no resources to clean up
        return Promise.resolve(undefined);
    };
    return AuthInternals;
}());
/**
 * Auth service bound to the provided app.
 */
var Auth = /** @class */ (function () {
    /**
     * @param {object} app The app for this Auth service.
     * @constructor
     */
    function Auth(app) {
        this.INTERNAL = new AuthInternals();
        if (typeof app !== 'object' || app === null || !('options' in app)) {
            throw new error_1.FirebaseAuthError(error_1.AuthClientErrorCode.INVALID_ARGUMENT, 'First argument passed to admin.auth() must be a valid Firebase app instance.');
        }
        this.app_ = app;
        this.tokenGenerator = new token_generator_1.FirebaseTokenGenerator(token_generator_1.cryptoSignerFromApp(app));
        var projectId = utils.getProjectId(app);
        this.sessionCookieVerifier = token_verifier_1.createSessionCookieVerifier(projectId);
        this.idTokenVerifier = token_verifier_1.createIdTokenVerifier(projectId);
        // Initialize auth request handler with the app.
        this.authRequestHandler = new auth_api_request_1.FirebaseAuthRequestHandler(app);
    }
    Object.defineProperty(Auth.prototype, "app", {
        /**
         * Returns the app associated with this Auth instance.
         *
         * @return {FirebaseApp} The app associated with this Auth instance.
         */
        get: function () {
            return this.app_;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Creates a new custom token that can be sent back to a client to use with
     * signInWithCustomToken().
     *
     * @param {string} uid The uid to use as the JWT subject.
     * @param {object=} developerClaims Optional additional claims to include in the JWT payload.
     *
     * @return {Promise<string>} A JWT for the provided payload.
     */
    Auth.prototype.createCustomToken = function (uid, developerClaims) {
        return this.tokenGenerator.createCustomToken(uid, developerClaims);
    };
    /**
     * Verifies a JWT auth token. Returns a Promise with the tokens claims. Rejects
     * the promise if the token could not be verified. If checkRevoked is set to true,
     * verifies if the session corresponding to the ID token was revoked. If the corresponding
     * user's session was invalidated, an auth/id-token-revoked error is thrown. If not specified
     * the check is not applied.
     *
     * @param {string} idToken The JWT to verify.
     * @param {boolean=} checkRevoked Whether to check if the ID token is revoked.
     * @return {Promise<DecodedIdToken>} A Promise that will be fulfilled after a successful
     *     verification.
     */
    Auth.prototype.verifyIdToken = function (idToken, checkRevoked) {
        var _this = this;
        if (checkRevoked === void 0) { checkRevoked = false; }
        return this.idTokenVerifier.verifyJWT(idToken)
            .then(function (decodedIdToken) {
            // Whether to check if the token was revoked.
            if (!checkRevoked) {
                return decodedIdToken;
            }
            return _this.verifyDecodedJWTNotRevoked(decodedIdToken, error_1.AuthClientErrorCode.ID_TOKEN_REVOKED);
        });
    };
    /**
     * Looks up the user identified by the provided user id and returns a promise that is
     * fulfilled with a user record for the given user if that user is found.
     *
     * @param {string} uid The uid of the user to look up.
     * @return {Promise<UserRecord>} A promise that resolves with the corresponding user record.
     */
    Auth.prototype.getUser = function (uid) {
        return this.authRequestHandler.getAccountInfoByUid(uid)
            .then(function (response) {
            // Returns the user record populated with server response.
            return new user_record_1.UserRecord(response.users[0]);
        });
    };
    /**
     * Looks up the user identified by the provided email and returns a promise that is
     * fulfilled with a user record for the given user if that user is found.
     *
     * @param {string} email The email of the user to look up.
     * @return {Promise<UserRecord>} A promise that resolves with the corresponding user record.
     */
    Auth.prototype.getUserByEmail = function (email) {
        return this.authRequestHandler.getAccountInfoByEmail(email)
            .then(function (response) {
            // Returns the user record populated with server response.
            return new user_record_1.UserRecord(response.users[0]);
        });
    };
    /**
     * Looks up the user identified by the provided phone number and returns a promise that is
     * fulfilled with a user record for the given user if that user is found.
     *
     * @param {string} phoneNumber The phone number of the user to look up.
     * @return {Promise<UserRecord>} A promise that resolves with the corresponding user record.
     */
    Auth.prototype.getUserByPhoneNumber = function (phoneNumber) {
        return this.authRequestHandler.getAccountInfoByPhoneNumber(phoneNumber)
            .then(function (response) {
            // Returns the user record populated with server response.
            return new user_record_1.UserRecord(response.users[0]);
        });
    };
    /**
     * Exports a batch of user accounts. Batch size is determined by the maxResults argument.
     * Starting point of the batch is determined by the pageToken argument.
     *
     * @param {number=} maxResults The page size, 1000 if undefined. This is also the maximum
     *     allowed limit.
     * @param {string=} pageToken The next page token. If not specified, returns users starting
     *     without any offset.
     * @return {Promise<{users: UserRecord[], pageToken?: string}>} A promise that resolves with
     *     the current batch of downloaded users and the next page token. For the last page, an
     *     empty list of users and no page token are returned.
     */
    Auth.prototype.listUsers = function (maxResults, pageToken) {
        return this.authRequestHandler.downloadAccount(maxResults, pageToken)
            .then(function (response) {
            // List of users to return.
            var users = [];
            // Convert each user response to a UserRecord.
            response.users.forEach(function (userResponse) {
                users.push(new user_record_1.UserRecord(userResponse));
            });
            // Return list of user records and the next page token if available.
            var result = {
                users: users,
                pageToken: response.nextPageToken,
            };
            // Delete result.pageToken if undefined.
            if (typeof result.pageToken === 'undefined') {
                delete result.pageToken;
            }
            return result;
        });
    };
    /**
     * Creates a new user with the properties provided.
     *
     * @param {CreateRequest} properties The properties to set on the new user record to be created.
     * @return {Promise<UserRecord>} A promise that resolves with the newly created user record.
     */
    Auth.prototype.createUser = function (properties) {
        var _this = this;
        return this.authRequestHandler.createNewAccount(properties)
            .then(function (uid) {
            // Return the corresponding user record.
            return _this.getUser(uid);
        })
            .catch(function (error) {
            if (error.code === 'auth/user-not-found') {
                // Something must have happened after creating the user and then retrieving it.
                throw new error_1.FirebaseAuthError(error_1.AuthClientErrorCode.INTERNAL_ERROR, 'Unable to create the user record provided.');
            }
            throw error;
        });
    };
    /**
     * Deletes the user identified by the provided user id and returns a promise that is
     * fulfilled when the user is found and successfully deleted.
     *
     * @param {string} uid The uid of the user to delete.
     * @return {Promise<void>} A promise that resolves when the user is successfully deleted.
     */
    Auth.prototype.deleteUser = function (uid) {
        return this.authRequestHandler.deleteAccount(uid)
            .then(function (response) {
            // Return nothing on success.
        });
    };
    /**
     * Updates an existing user with the properties provided.
     *
     * @param {string} uid The uid identifier of the user to update.
     * @param {UpdateRequest} properties The properties to update on the existing user.
     * @return {Promise<UserRecord>} A promise that resolves with the modified user record.
     */
    Auth.prototype.updateUser = function (uid, properties) {
        var _this = this;
        return this.authRequestHandler.updateExistingAccount(uid, properties)
            .then(function (existingUid) {
            // Return the corresponding user record.
            return _this.getUser(existingUid);
        });
    };
    /**
     * Sets additional developer claims on an existing user identified by the provided UID.
     *
     * @param {string} uid The user to edit.
     * @param {object} customUserClaims The developer claims to set.
     * @return {Promise<void>} A promise that resolves when the operation completes
     *     successfully.
     */
    Auth.prototype.setCustomUserClaims = function (uid, customUserClaims) {
        return this.authRequestHandler.setCustomUserClaims(uid, customUserClaims)
            .then(function (existingUid) {
            // Return nothing on success.
        });
    };
    /**
     * Revokes all refresh tokens for the specified user identified by the provided UID.
     * In addition to revoking all refresh tokens for a user, all ID tokens issued before
     * revocation will also be revoked on the Auth backend. Any request with an ID token
     * generated before revocation will be rejected with a token expired error.
     *
     * @param {string} uid The user whose tokens are to be revoked.
     * @return {Promise<void>} A promise that resolves when the operation completes
     *     successfully.
     */
    Auth.prototype.revokeRefreshTokens = function (uid) {
        return this.authRequestHandler.revokeRefreshTokens(uid)
            .then(function (existingUid) {
            // Return nothing on success.
        });
    };
    /**
     * Imports the list of users provided to Firebase Auth. This is useful when
     * migrating from an external authentication system without having to use the Firebase CLI SDK.
     * At most, 1000 users are allowed to be imported one at a time.
     * When importing a list of password users, UserImportOptions are required to be specified.
     *
     * @param {UserImportRecord[]} users The list of user records to import to Firebase Auth.
     * @param {UserImportOptions=} options The user import options, required when the users provided
     *     include password credentials.
     * @return {Promise<UserImportResult>} A promise that resolves when the operation completes
     *     with the result of the import. This includes the number of successful imports, the number
     *     of failed uploads and their corresponding errors.
     */
    Auth.prototype.importUsers = function (users, options) {
        return this.authRequestHandler.uploadAccount(users, options);
    };
    /**
     * Creates a new Firebase session cookie with the specified options that can be used for
     * session management (set as a server side session cookie with custom cookie policy).
     * The session cookie JWT will have the same payload claims as the provided ID token.
     *
     * @param {string} idToken The Firebase ID token to exchange for a session cookie.
     * @param {SessionCookieOptions} sessionCookieOptions The session cookie options which includes
     *     custom session duration.
     *
     * @return {Promise<string>} A promise that resolves on success with the created session cookie.
     */
    Auth.prototype.createSessionCookie = function (idToken, sessionCookieOptions) {
        // Return rejected promise if expiresIn is not available.
        if (!validator.isNonNullObject(sessionCookieOptions) ||
            !validator.isNumber(sessionCookieOptions.expiresIn)) {
            return Promise.reject(new error_1.FirebaseAuthError(error_1.AuthClientErrorCode.INVALID_SESSION_COOKIE_DURATION));
        }
        return this.authRequestHandler.createSessionCookie(idToken, sessionCookieOptions.expiresIn);
    };
    /**
     * Verifies a Firebase session cookie. Returns a Promise with the tokens claims. Rejects
     * the promise if the token could not be verified. If checkRevoked is set to true,
     * verifies if the session corresponding to the session cookie was revoked. If the corresponding
     * user's session was invalidated, an auth/session-cookie-revoked error is thrown. If not
     * specified the check is not performed.
     *
     * @param {string} sessionCookie The session cookie to verify.
     * @param {boolean=} checkRevoked Whether to check if the session cookie is revoked.
     * @return {Promise<DecodedIdToken>} A Promise that will be fulfilled after a successful
     *     verification.
     */
    Auth.prototype.verifySessionCookie = function (sessionCookie, checkRevoked) {
        var _this = this;
        if (checkRevoked === void 0) { checkRevoked = false; }
        return this.sessionCookieVerifier.verifyJWT(sessionCookie)
            .then(function (decodedIdToken) {
            // Whether to check if the token was revoked.
            if (!checkRevoked) {
                return decodedIdToken;
            }
            return _this.verifyDecodedJWTNotRevoked(decodedIdToken, error_1.AuthClientErrorCode.SESSION_COOKIE_REVOKED);
        });
    };
    /**
     * Verifies the decoded Firebase issued JWT is not revoked. Returns a promise that resolves
     * with the decoded claims on success. Rejects the promise with revocation error if revoked.
     *
     * @param {DecodedIdToken} decodedIdToken The JWT's decoded claims.
     * @param {ErrorInfo} revocationErrorInfo The revocation error info to throw on revocation
     *     detection.
     * @return {Promise<DecodedIdToken>} A Promise that will be fulfilled after a successful
     *     verification.
     */
    Auth.prototype.verifyDecodedJWTNotRevoked = function (decodedIdToken, revocationErrorInfo) {
        // Get tokens valid after time for the corresponding user.
        return this.getUser(decodedIdToken.sub)
            .then(function (user) {
            // If no tokens valid after time available, token is not revoked.
            if (user.tokensValidAfterTime) {
                // Get the ID token authentication time and convert to milliseconds UTC.
                var authTimeUtc = decodedIdToken.auth_time * 1000;
                // Get user tokens valid after time in milliseconds UTC.
                var validSinceUtc = new Date(user.tokensValidAfterTime).getTime();
                // Check if authentication time is older than valid since time.
                if (authTimeUtc < validSinceUtc) {
                    throw new error_1.FirebaseAuthError(revocationErrorInfo);
                }
            }
            // All checks above passed. Return the decoded token.
            return decodedIdToken;
        });
    };
    return Auth;
}());
exports.Auth = Auth;
