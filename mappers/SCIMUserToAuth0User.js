const _ = require('lodash');

function scimToAuth0 (input) {
  return {
    // 'connection': 'Initial-Connection',
    'email': input.emails && input.emails.filter(e => e.primary)[0].value,
    'username': input.userName,
    'password': '',
    'email_verified': false,
    'app_metadata': _.pick(input, ['name', 'displayName', 'timezone', 'photos' ])
  };
}

exports.map = scimToAuth0;