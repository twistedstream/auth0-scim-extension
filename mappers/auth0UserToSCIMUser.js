function mapUser(auth0User) {
  if (!auth0User) {
    return null;
  }

  const scimUser = {
    id: auth0User.user_id,
    externalId: null,
    meta: auth0User.user_metadata,
    userName: auth0User.username,
    nickName: auth0User.nickname, // TODO We don't have this right now
    name: {
      givenName: auth0User.given_name,
      familyName: auth0User.family_name
    },
    displayName: auth0User.name,
    profileUrl: null, // TODO
    title: null, // TODO
    timezone: null, // TODO
    active: true, // TODO
    emails: [ auth0User.email ],
    photos: [{
      value: auth0User.picture,
      type: 'photo'
    }],
    groups: [] // TODO
  };

  return scimUser;
}

exports.map = mapUser;