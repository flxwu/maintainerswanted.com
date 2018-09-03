5.13.0 / 2018-08-05
===================
  * Update Firebase Admin to 5.13.0
  * Add errorIfSessionNotFound configuration option

5.12.0 / 2018-07-07
==================
  * Update Firebase Admin to 5.12.0
  * Drop Node 4 support
  * Migrate tests from Mocha to Jest
  * Update linting to airbnb and prettier

5.11.0 / 2018-03-28
==================
  * Update Firebase Admin to 5.11.0

5.10.0 / 2018-03-14
==================
  * Update Firebase Admin to 5.10.0

5.9.0 / 2018-02-27
==================
  * Update Firebase Admin to 5.9.0

5.8.0 / 2018-02-01
==================
  * Update Firebase Admin to 5.8.0

5.7.0 / 2018-01-09
==================
  * Update Firebase Admin to 5.7.0

5.6.0 / 2017-12-23
==================
  * Update Firebase Admin to 5.6.0

5.5.0 / 2017-12-06
==================
  * Update Firebase Admin to 5.5.0

5.4.0 / 2017-10-04
==================
  * Update Firebase Admin to 5.4.0

5.3.0 / 2017-10-01
==================
  * Update Firebase Admin to 5.3.0

5.2.0 / 2017-09-24
==================
  * Update Firebase Admin to 5.2.0

5.1.0 / 2017-09-24
==================
  Found out I wasn't receiving Greenkeeper notifications for firebase-admin.
  This is an interstitial release to patch the jump from 5.0.0 to 5.2.0

  * Update Firebase Admin to 5.1.0

5.0.0 / 2017-06-24
==================
  * Update Firebase Admin to 5.0.0
  * Update Chai to 4.0.1

4.2.0 / 2017-04-08
==================
  * Update Firebase Admin to 4.2.0

4.1.0 / 2017-03-02
==================
  * Update Firebase Admin to 4.1.0
  * Add reapCallback function to constructor args object

4.0.1 / 2016-11-13
==================
  * Switch to firebase-admin dependency

3.6.0 / 2016-11-10
==================
  * Update Firebase dependency to v3.6.0

3.5.0 / 2016-10-15
==================
  * Update Firebase dependency to v3.5.0
  * Removed the functionality to pass a Firebase config object to FirebaseStore - a pre-initialised Firebase reference is now required

3.4.0 / 2016-09-16
==================
  * Update Firebase dependency to v3.4.0

3.3.0 / 2016-08-19
==================
  * Update Firebase dependency to v3.3.0

3.2.0 / 2016-07-19
==================
  * Update Firebase dependency to v3.2.0

3.1.1 / 2016-07-09
==================
  * Remove `serviceAccount` requirement because Firebase 3.1.0 doesn't need it either.

3.1.0 / 2016-07-01
==================
  * Support for [firebase@3.1.0](https://www.npmjs.com/package/firebase)

3.0.0 / 2016-06-11
==================
  * [connect-firebase](https://github.com/ca98am79/connect-firebase) forked to [connect-session-firebase](https://github.com/benweier/connect-session-firebase)
  * Support for [firebase@3.0.0](https://www.npmjs.com/package/firebase)

0.0.9 / 2015-12-21
==================
  * Add touch method to FirebaseStore (thanks brianneisler)

0.0.8 / 2015-07-07
==================
  * Fixed Firebase Warning auth is being deprecated (thanks acolby)

0.0.7 / 2014-12-05
==================
  * Implementation of reap method to clean up expired sessions (issue #5, thanks fpereira1)

0.0.5 / 2014-08-02
==================
  * Remove `connect` dependency. Now pass `session` to module (to be compatible with express 4.x)
  * Change option `firebase_url` to `host`
  * Change option `clean_sid` to `cleanSid`
  * Add `.jshintrc` + Code clean up

0.0.4 / 2013-08-20
==================

  * Add clear()

0.0.3 / 2013-08-20
==================

  * Fixes to session id characters, use Firebase.once() instead of Firebase.on() for get()

0.0.2 / 2013-08-11
==================

  * Add auth token support

0.0.1 / 2013-08-10
==================

  * Initial commit
