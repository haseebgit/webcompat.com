/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'tests/functional/lib/helpers',
  'intern/dojo/node!leadfoot/keys'
], function (intern, registerSuite, assert, require, FunctionalHelpers, keys) {
  'use strict';

  var url = function(path) {
    return intern.config.siteRoot + path;
  };

  registerSuite({
    name: 'Search (auth)',

    setup: function () {
      return FunctionalHelpers.login(this);
    },

    teardown: function () {
      return FunctionalHelpers.logout(this);
    },

    'Search/filter interaction': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues')))
        .sleep(2000)
        .findByCssSelector('.wc-IssueSearch-form').click()
        .type('taco')
        .end()
        .findAllByCssSelector('button.wc-Filter--new').click()
        .end()
        .findByCssSelector('.wc-IssueSearch-form').getVisibleText()
        .then(function (text) {
          assert.equal(text, '', 'Clicking filter should empty search text');
        })
        .end()
        .findAllByCssSelector('button.wc-Filter--new').click()
        .end()
        .findByCssSelector('.wc-IssueSearch-form').click()
        .type('taco')
        .end()
        .findAllByCssSelector('button.wc-Filter--new').getAttribute('class')
        .then(function (className) {
          assert.notInclude(className, 'is-active', 'Searching should clear all filters');
        })
        .end();
    },

    'Results are loaded from the query params': function() {
      var params = '?q=vladvlad';
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues') + params))
        .findByCssSelector('.wc-IssueItem:nth-of-type(1) a').getVisibleText()
        .then(function(text){
          assert.include(text, 'vladvlad', 'The search query results show up on the page.');
        })
        .end()
        .getCurrentUrl()
        .then(function(currUrl){
          assert.include(currUrl, 'q=vladvlad', 'Our params didn\'t go anywhere.');
        })
        .end();
    },

    'Search from the homepage': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/')))
        .findByCssSelector('.js-SearchBarOpen').click()
        .end()
        .findByCssSelector('.js-SearchBar input').click()
        .type('vladvlad')
        .type(keys.ENTER)
        .end()
        .sleep(3000)
        .findByCssSelector('.wc-IssueItem:nth-of-type(1) a').getVisibleText()
        .then(function(text){
          assert.include(text, 'vladvlad', 'The search query results show up on the page.');
        })
        .end()
        .getCurrentUrl()
        .then(function(currUrl){
          assert.include(currUrl, 'page=1', 'Default params got merged.');
        })
        .end();
      }
  });
});
