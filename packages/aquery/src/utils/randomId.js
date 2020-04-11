const generate = require('nanoid/generate');

module.exports = (length = 6) =>
  '__ampify__' +
  generate(
    '1234567890QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopaasdfghjklzxcvbnm_',
    length,
  );
