const config = {
  apiKey: process.env.API_KEY,
  authDomain: "looking-for-maintainers.firebaseapp.com",
  databaseURL: "https://looking-for-maintainers.firebaseio.com",
  projectId: "looking-for-maintainers",
  storageBucket: "looking-for-maintainers.appspot.com",
  messagingSenderId: process.env.SENDER_ID
};

module.exports = config;
