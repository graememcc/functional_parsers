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


    it('Created object has \'equals\' property', function () {
      var p = new ParseResult(null, null);
      expect(p).to.have.property('equals');
    });


    it('Created object\'s equals property is a function', function () {
      var p = new ParseResult(null, null);
      expect(p.equals).to.be.a('function');
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


  describe('equals', function() {
    var failTests = [
      {name: 'different types', values: [['a'], 'a']},
      {name: 'different strings', values: ['a', 'b']},
      {name: 'different arrays', values: [['a', 'b'], ['c', 'd']]},
      {name: 'different values', values: [4, 5]}];


    var makeFailRemainingTest = function(values) {
      return function() {
        var p1 = new ParseResult(values[0], values[0]);
        var p2 = new ParseResult(values[1], values[0]);
        expect(p1.equals(p2)).to.equal(false);
        expect(p2.equals(p1)).to.equal(false);
      };
    };


    var makeFailValuesTest = function(values) {
      return function() {
        var p1 = new ParseResult(values[0], values[0]);
        var p2 = new ParseResult(values[0], values[1]);
        expect(p1.equals(p2)).to.equal(false);
        expect(p2.equals(p1)).to.equal(false);
      };
    };


    var makeFailBothTest = function(values) {
      return function() {
        var p1 = new ParseResult(values[0], values[0]);
        var p2 = new ParseResult(values[1], values[1]);
        expect(p1.equals(p2)).to.equal(false);
        expect(p2.equals(p1)).to.equal(false);
      };
    };


    failTests.forEach(function(test, i) {
      it('ParseResults are not equal when \'remaining\' property has ' + test.name,
         makeFailRemainingTest(test.values));

      it('ParseResults are not equal when \'value\' property has ' + test.name,
         makeFailValuesTest(test.values));

      it('ParseResults are not equal when both properties have ' + test.name,
         makeFailBothTest(test.values));
    });


    var passTests = [
      {name: 'same strings', value: 'a'},
      {name: 'same arrays', value: ['a', 'b']},
      {name: 'same values', value: 4}];


    var makePassTest = function(r, v) {
      return function() {
        var p1 = new ParseResult(r, v);
        var p2 = new ParseResult(r, v);
        expect(p1.equals(p2)).to.equal(true);
        expect(p2.equals(p1)).to.equal(true);
      };
    };


    passTests.forEach(function(remainingTest, i) {
      // The 'values' test isn't applicable to the input
      if (i === passTests.length - 1)
        return;

      passTests.forEach(function(valuesTest, j) {
        it('ParseResults are equal when \'remaining\' properties have ' + remainingTest.name +
           ' and \'values\' properties have ' + valuesTest.name,
           makePassTest(remainingTest.value, valuesTest.value));
      });
    });
  });
});
