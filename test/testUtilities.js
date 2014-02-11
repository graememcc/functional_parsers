var requirejs = require('requirejs');

requirejs(['Utilities.js', 'chai'], function(Utilities, chai) {
  "use strict";

  var expect = chai.expect;


  describe('Utilities exports', function() {
    it('Utilities object has \'accepts\' property', function() {
      expect(Utilities).to.have.property('accepts');
    });


    it('Utilities object\'s accepts property is a function', function() {
      expect(Utilities.accepts).to.be.a('function');
    });


    it('Utilities object has \'hasCompleteParse\' property', function() {
      expect(Utilities).to.have.property('hasCompleteParse');
    });


    it('Utilities object\'s hasCompleteParse property is a function', function() {
      expect(Utilities.hasCompleteParse).to.be.a('function');
    });


    it('Utilities object has \'getFinalValue\' property', function() {
      expect(Utilities).to.have.property('getFinalValue');
    });


    it('Utilities object\'s getFinalValue property is a function', function() {
      expect(Utilities.getFinalValue).to.be.a('function');
    });
  });


  // The tests for accepts and hasCompleteParse use the following for test-generation
  // For the incomplete parses, we don't really care what the final value is, so we leave the
  // second parameter to the makeElement helper undefined
  var makeElement = function(r, v) {return {remaining: r, value: v};};
  var tests = [
    {name: 'array', fail: [makeElement(['a']), makeElement(['b'])],
     pass: [makeElement(['a']), makeElement(['b']), makeElement([], 'result')], passValue: 'result'},
    {name: 'string', fail: [makeElement('a'), makeElement('b')],
     pass: [makeElement('a'), makeElement('b'), makeElement('', 7)], passValue: 7}
  ];


  // The next few tests have a common shape: factor out the boilerplate
  var makeCommonTests = function(fn, fnName, failTestMaker, successTestMaker) {
    it(fnName + ' behaves correctly for the empty list', failTestMaker([]));


    tests.forEach(function(test) {
      var name = test.name;

      it(fnName + ' fails if no element with \'remaining\' of length 0 (' + name + ')',
         failTestMaker(test.fail, test));

      it(fnName + ' succeeds if element with \'remaining\' of length 0 (' + name + ')',
        successTestMaker(test.pass, test));
    });
  };


  describe('getFinalValue', function() {
    var getFinalValue = Utilities.getFinalValue;


    var makeFailedParseTest = function(input, test) {
      return function() {
        var testFn = function() {
          getFinalValue(input);
        };
        expect(testFn).to.throw(Error);
      };
    };


    var makeSuccessParseTest = function(input, test) {
      return function() {
        expect(getFinalValue(input)).to.equal(test.passValue);
      };
    };


    makeCommonTests(getFinalValue, 'getFinalValue', makeFailedParseTest, makeSuccessParseTest);
  });


  describe('hasCompleteParse', function() {
    var hasCompleteParse = Utilities.hasCompleteParse;


    var makeParseTest = function(input, expectedValue) {
      return function() {
        expect(hasCompleteParse(input)).to.equal(expectedValue);
      };
    };


    var makeFailedParseTest = function(input, test) {
      return makeParseTest(input, false);
    };


    var makeSuccessParseTest = function(input, test) {
      return makeParseTest(input, true);
    };


    makeCommonTests(hasCompleteParse, 'hasCompleteParse', makeFailedParseTest, makeSuccessParseTest);
  });


  describe('accepts', function() {
    var accepts = Utilities.accepts;

    it('accepts takes two parameters', function() {
      expect(accepts.length).to.equal(2);
    });


    it('accepts calls the parser with the given input', function() {
      var fakeParser = function(s) {
        fakeParser.param = s;
        fakeParser.called = true;
        return [];
      };
      fakeParser.called = false;

      var input = 'mozilla';
      accepts(fakeParser, input);
      expect(fakeParser.called).to.equal(true);
      expect(fakeParser.param).to.equal(input);
    });


    var makeAcceptsTest = function(fakeParserOutput, expectedResult) {
      return function() {
        var fakeParser = function(s) {
          return fakeParserOutput;
        };

        var input = 'mozilla';
        expect(accepts(fakeParser, input)).to.equal(expectedResult);
      };
    };


    var makeFailedParseTest = function(input, test) {
      return makeAcceptsTest(input, false);
    };


    var makeSuccessParseTest = function(input, test) {
      return makeAcceptsTest(input, true);
    };


    makeCommonTests(accepts, 'accepts', makeFailedParseTest, makeSuccessParseTest);
  });
});

