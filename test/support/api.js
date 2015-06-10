'use strict';

var request = require('supertest'),
  app = require('../../app');

const ROUTE = '/api/v1';

module.exports = {
  login: function(user={}) {
    return request(app)
    .post(`${ROUTE}/auth/login`)
    .field('email', user.email || '')
    .field('password', user.password || '');
  },
  authGitHub: function() {
    return request(app)
    .get(`${ROUTE}/auth/github`);
  },
  getProfile: function(user) {
    return request(app)
    .get(`${ROUTE}/account/profile`)
    .set('Authorization', `JWT ${user.token}`);
  },
  updateProfile: function(user) {
    return request(app)
    .patch(`${ROUTE}/account/profile`)
    .set('Authorization', `JWT ${user.token}`);
  },
  changePassword: function(user) {
    return request(app)
    .patch(`${ROUTE}/account/change_password`)
    .set('Authorization', `JWT ${user.token}`);
  },
  changeEmail: function(user) {
    return request(app)
    .patch(`${ROUTE}/account/change_email`)
    .set('Authorization', `JWT ${user.token}`);
  },
  cancelAccount: function(user) {
    return request(app)
    .delete(`${ROUTE}/account/cancel`)
    .set('Authorization', `JWT ${user.token}`);
  },
  newToken: function(user) {
    return request(app)
    .get(`${ROUTE}/account/new_token`)
    .set('Authorization', `JWT ${user.token}`);
  },
  callWithAttributes: function(attributes, reference, action) {
    attributes.forEach(attribute => {
      action = action.field(attribute, reference.dataValues[attribute]);
    });
    return action;
  }
};
