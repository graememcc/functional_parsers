var requirejs = require('requirejs');

requirejs(['ParseResult.js', 'chai'], function(ParseResult, chai) {
  "use strict";

  var expect = chai.expect;


  describe('ParseResult constructor', function() {
    it('Returns object of correct type', function() {
      var p = new ParseResult(null, null);
      expect(p).to.be.instanceOf(ParseResult);
    });


    it('Constructor is new-agnostic', function() {
      var p = ParseResult(null, null);
      expect(p).to.be.instanceOf(ParseResult);
    });


    it('Created object has \'remaining\' property', function() {
      var p = new ParseResult(null, null);
      expect(p).to.have.property('remaining');
    });


    it('Created object\'s remaining property has correct value', function() {
      var remaining1 = 'mozilla';
      var remaining2 = 'firefox';
      var p = new ParseResult(remaining1, null);
      expect(p.remaining).to.equal(remaining1);
      var q = new ParseResult(remaining2, null);
      expect(q.remaining).to.equal(remaining2);
    });


    it('Created object has \'value\' property', function() {
      var p = new ParseResult(null, null);
      expect(p).to.have.property('value');
    });


    it('Created object\'s value property has correct value', function() {
      var value1 = 'gecko';
      var value2 = 'spidermonkey';
      var p = new ParseResult(null, value1);
      expect(p.value).to.equal(value1);
      var q = new ParseResult(null, value2);
      expect(q.value).to.equal(value2);
    });
  });


  describe('toString', function() {
    it('Overrides \'toString\'', function() {
      var p = new ParseResult(null, null);
      expect(Object.getPrototypeOf(p).hasOwnProperty('toString')).to.be.true;
    });


    it('toString works as expected', function() {
      var remaining1 = 'mozilla';
      var remaining2 = 'firefox';
      var value1 = 'gecko';
      var value2 = 'spidermonkey';
      var p1 = new ParseResult(remaining1, value1);
      var p2 = new ParseResult(remaining2, value2);
      expect(p1.toString()).to.equal('{ Remaining: mozilla | Value: gecko}');
      expect(p2.toString()).to.equal('{ Remaining: firefox | Value: spidermonkey}');
    });


    it('toString() uses remaining\'s toString', function() {
      var remaining = [1, 2];
      var value = 'mozilla';
      var p = new ParseResult(remaining, value);
      expect(p.toString()).to.equal('{ Remaining: ' + remaining.toString() + ' | Value: mozilla}');
    });


    it('toString() uses value\'s toString', function() {
      var remaining = 'mozilla';
      var value = [1, 2];
      var p = new ParseResult(remaining, value);
      expect(p.toString()).to.equal('{ Remaining: mozilla | Value: ' + value.toString() + '}');
    });
  });
});
