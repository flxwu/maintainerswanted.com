/**
 * @file Exports the FirebaseStore class
 * @copyright 2018 Ben Weier <ben.weier@gmail.com>
 * @license MIT
 */

/**
 * Default session key.
 * @private
 */
const SESSION_KEY = 'sessions'

/**
 * Default session reap interval in milliseconds.
 * @private
 */
const REAP_INTERVAL = 21600000

/**
 * Default session reap callback.
 * @return {void}
 * @private
 */
const REAP_CALLBACK = () => {}

/**
 * Get a Firebase session store extending the Connect/Express session store.
 *
 * @param  {Object} session Connect/Express Session Store
 * @return {Function}       FirebaseStore class
 */
const connectSessionFirebase = function connectSessionFirebase({ Store }) {
  /**
   * Create a new FirebaseStore.
   *
   * @param {Object}   args                FirebaseStore settings
   * @param {Object}   args.database       The Firebase application reference
   * @param {String}   [args.sessions]     The session store key
   * @param {Number}   [args.reapInterval] Callback interval for session reaping
   * @param {Function} [args.reapCallback] Callback function for session reaping
   */
  const FirebaseStore = function FirebaseStore(args = {}) {
    const {
      database = null,
      sessions = SESSION_KEY,
      reapInterval = REAP_INTERVAL,
      reapCallback = REAP_CALLBACK,
      errorIfSessionNotFound = false,
    } = args

    Store.call(args)

    /**
     * Replace disallowed characters in a Firebase reference key.
     *
     * @param  {String} str A child reference key
     * @return {String}     A valid child reference key
     */
    this.cleanRef = function cleanRef(str) {
      return str.replace(/\.|\$|#|\[|\]|\//g, '_')
    }

    if (database && typeof database === 'object') {
      if (database.ref) {
        this.database = database
      } else if (database.database) {
        this.database = database.database()
      } else {
        throw new Error('Invalid Firebase reference')
      }
    } else {
      throw new Error('Invalid FirebaseStore argument')
    }

    this.sessions = this.cleanRef(sessions)
    this.reapInterval = typeof reapInterval === 'number' && reapInterval > 60000 ? reapInterval : REAP_INTERVAL
    this.reapCallback = typeof reapCallback === 'function' ? reapCallback : REAP_CALLBACK
    this.errorIfSessionNotFound = errorIfSessionNotFound

    setInterval(this.reap.bind(this, this.reapCallback), this.reapInterval)
  }

  /**
   * Inherit from `Store`
   * @private
   */
  // FirebaseStore.prototype.__proto__ = Store.prototype;
  FirebaseStore.prototype = Object.create(Store.prototype)

  /**
   * Fetch a keyed session reference.
   *
   * @param {String} sid  The session key
   * @param {Function} fn OnComplete callback function
   * @return {Promise}    A thenable Firebase reference
   */
  FirebaseStore.prototype.get = function get(sid, fn) {
    const key = this.cleanRef(sid)
    const now = Date.now()
    const session = this.database.ref(this.sessions).child(key)

    return session
      .once('value')
      .then(snapshot => {
        if (!snapshot.exists()) {
          const err = this.errorIfSessionNotFound ? new Error(`Session '${key}' does not exist`) : null

          return fn(err)
        }

        if (snapshot.val().expires < now) {
          return this.destroy(sid, fn)
        }

        const sess = snapshot.val().sess.toString()

        return fn(null, JSON.parse(sess))
      })
      .catch(fn)
  }

  /**
   * Save a keyed session reference.
   *
   * @param  {String} sid  The session key
   * @param  {Object} sess The session data
   * @param  {Function} fn OnComplete callback function
   * @return {Promise}     A thenable Firebase reference
   */
  FirebaseStore.prototype.set = function set(sid, sess, fn) {
    const key = this.cleanRef(sid)
    const now = Date.now()
    const expires =
      sess.cookie && typeof sess.cookie.maxAge === 'number' ? now + sess.cookie.maxAge : now + this.reapInterval
    const session = this.database.ref(this.sessions).child(key)

    const data = {
      expires,
      sess: JSON.stringify(sess),
      type: 'connect-session',
    }

    return session
      .set(data)
      .then(fn)
      .catch(fn)
  }

  /**
   * Remove a keyed session reference.
   *
   * @param  {String} sid  The session key
   * @param  {Function} fn OnComplete callback function
   * @return {Promise}     A thenable Firebase reference
   */
  FirebaseStore.prototype.destroy = function destroy(sid, fn) {
    const key = this.cleanRef(sid)
    const session = this.database.ref(this.sessions).child(key)

    return session
      .remove()
      .then(fn)
      .catch(fn)
  }

  /**
   * Remove all session references.
   *
   * @param  {Function} fn OnComplete callback function
   * @return {Promise}     A thenable Firebase reference
   */
  FirebaseStore.prototype.clear = function clear(fn) {
    return this.database
      .ref(this.sessions)
      .remove()
      .then(fn)
      .catch(fn)
  }

  /**
   * Remove all expired session references.
   *
   * @return {Promise} A thenable Firebase reference
   */
  FirebaseStore.prototype.reap = function reap() {
    const now = Date.now()
    const sessions = this.database.ref(this.sessions)

    return sessions
      .once('value')
      .then(snapshot => {
        const remove = []

        snapshot.forEach(session => {
          if (session.val().expires < now) {
            remove.push(sessions.child(session.key).remove())
          }
        })

        return Promise.all(remove)
          .then(this.reapCallback)
          .catch(this.reapCallback)
      })
      .catch(this.reapCallback)
  }

  /**
   * Update a keyed session reference.
   *
   * @param  {String} sid  The session key
   * @param  {Object} sess The session data
   * @param  {Function} fn OnComplete callback function
   * @return {Promise}     A thenable Firebase reference
   */
  FirebaseStore.prototype.touch = function touch(sid, sess, fn) {
    const key = this.cleanRef(sid)
    const session = this.database.ref(this.sessions).child(key)

    return session
      .once('value')
      .then(snapshot => {
        if (!snapshot.exists()) {
          const err = this.errorIfSessionNotFound ? new Error(`Session '${key}' does not exist`) : null

          return fn(err)
        }

        const touched = Object.assign({}, JSON.parse(snapshot.val().sess), { cookie: sess.cookie })

        return this.set(sid, touched, fn)
      })
      .catch(fn)
  }

  return FirebaseStore
}

module.exports = connectSessionFirebase
