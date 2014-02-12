var requirejs = require('requirejs');

requirejs(['ParseResult.js', 'Utilities.js', 'chai'], function(ParseResult, Utilities, chai) {
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


    it('Utilities object has \'equalsArray\' property', function() {
      expect(Utilities).to.have.property('equalsArray');
    });


    it('Utilities object\'s equalsArray property is a function', function() {
      expect(Utilities.equalsArray).to.be.a('function');
    });


    it('Utilities object has \'containsResult\' property', function() {
      expect(Utilities).to.have.property('containsResult');
    });


    it('Utilities object\'s containsResult property is a function', function() {
      expect(Utilities.containsResult).to.be.a('function');
    });


    it('Utilities object has \'logFinalValue\' property', function() {
      expect(Utilities).to.have.property('logFinalValue');
    });


    it('Utilities object\'s logFinalValue property is a function', function() {
      expect(Utilities.logFinalValue).to.be.a('function');
    });


    it('Utilities object has \'printParses\' property', function() {
      expect(Utilities).to.have.property('printParses');
    });


    it('Utilities object\'s printParses property is a function', function() {
      expect(Utilities.printParses).to.be.a('function');
    });


    it('Utilities object has \'logAccepts\' property', function() {
      expect(Utilities).to.have.property('logAccepts');
    });


    it('Utilities object\'s logAccepts property is a function', function() {
      expect(Utilities.logAccepts).to.be.a('function');
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


  describe('equalsArray', function() {
    var equalsArray = Utilities.equalsArray;

    // Generate a whole bunch of tests
    var nonArrays = [{type: 'number', value: 1},
                     {type: 'function', value: function() {}},
                     {type: 'object', value: {}},
                     {type: 'null', value: null},
                     {type: 'undefined', value: undefined},
                     {type: 'boolean', value: false},
                     {type: 'string', value: ''}];


    var makeFailArrayTest = function(lhs, rhs) {
      return function() {
        expect(equalsArray(lhs, rhs)).to.equal(false);
      };
    };


    var rhsIterated = false;
    nonArrays.forEach(function(l) {
      var lhsType = l.type;
      var lhs = l.value;

      it('equalsArray returns false with ' + lhsType + ' on LHS, empty array on RHS',
         makeFailArrayTest(lhs, []));

      it('equalsArray returns false with ' + lhsType + ' on LHS, nonempty array on RHS',
         makeFailArrayTest(lhs, [1, 2, 3]));

      nonArrays.forEach(function(r, i) {
        var rhsType = r.type;
        var rhs = r.value;

        if (!rhsIterated) {
          it('equalsArray returns false with empty array on LHS, ' + rhsType + ' on RHS',
           makeFailArrayTest([], rhs));

          it('equalsArray returns false with nonempty array on LHS, ' + rhsType + ' on RHS',
             makeFailArrayTest([1, 2, 3], rhs));

          if (i === nonArrays.length - 1)
            rhsIterated = true;
        }

        it('equalsArray returns false with ' + lhsType + ' on LHS, ' + rhsType + ' on RHS',
           makeFailArrayTest(lhs, rhs));
      });
    });


    it('equalsArray false for arrays with different lengths (1)', makeFailArrayTest([1, 2], [1, 2, 3]));
    it('equalsArray false for arrays with different lengths (2)', makeFailArrayTest([1, 2, 3], [1, 2]));
    it('equalsArray false for arrays with different values', makeFailArrayTest([1, 2], [3, 2]));
    it('equalsArray false for arrays with different subarrays', makeFailArrayTest([1, 2, [3, 4]], [1, 2, [7, 8]]));


    var makePassArrayTest = function(lhs, rhs) {
      return function() {
        expect(equalsArray(lhs, rhs)).to.equal(true);
      };
    };


    it('equalsArray true for two empty arrays', makePassArrayTest([], []));
    it('equalsArray true for arrays with same values (1)', makePassArrayTest([1, 2], [1, 2]));
    it('equalsArray true for arrays with same values (2)', makePassArrayTest([3, 4, 5], [3, 4, 5]));
    it('equalsArray true for arrays with subarrays (1)', makePassArrayTest([1, 2, [3, 4]], [1, 2, [3, 4]] ));
    it('equalsArray true for arrays with subarrays (1)', makePassArrayTest([[7, 8], [9, 10]], [[7, 8], [9, 10]]));
  });


  describe('containsResult', function() {
    var containsResult = Utilities.containsResult;

    var makeContainsResultTest = function(r, v, input, expected) {
      return function() {
        var needle = ParseResult(r, v);
        expect(containsResult(needle, input)).to.equal(expected);
      };
    };


    var props = [{type: 'string', value: 'a'},
                 {type: 'array', value: ['b']},
                 {type: 'value', value: 7}];


    var nonEmpty = [ParseResult('c', 'd'), ParseResult('c', ['d']), ParseResult('c', 42),
                    ParseResult(['c'], 'd'), ParseResult(['c'], ['d']), ParseResult(['c'], 42)];

    props.forEach(function(remainingProp, i) {
      // The value type has no relevance for input
      if (i === props.length - 1)
        return;

      var rType = remainingProp.type;
      var rValue = remainingProp.value;

      props.forEach(function(valueProp) {
      var vType = valueProp.type;
      var vValue = valueProp.value;

        it('containsResult fails on empty list, when remaining has type ' + rType +
           ' and value has type ' + vType, makeContainsResultTest(rValue, vValue, [], false));

        it('containsResult fails on nonempty list without result, when remaining has type ' + rType +
           ' and value has type ' + vType, makeContainsResultTest(rValue, vValue, nonEmpty, false));

        it('containsResult passes on nonempty list with result, when remaining has type ' + rType +
           ' and value has type ' + vType, makeContainsResultTest(rValue, vValue, nonEmpty.concat(ParseResult(rValue, vValue)), true));
      });
    });
  });


  // Utility function for the next three test sequences
  var makeFakeLogger = function() {
    var flog = function() {
      flog.params += [].slice.call(arguments).join('');
    };
    flog.params = '';
    return flog;
  };


  describe('logFinalValue', function() {
    var logFinalValue = Utilities.logFinalValue;
    var equalsArray = Utilities.equalsArray;


    it('logFinalValue has \'parserFailed\' property', function() {
      expect(logFinalValue).to.have.property('parserFailed');
    });


    it('logFinalValue has \'noFinalValue\' property', function() {
      expect(logFinalValue).to.have.property('noFinalValue');
    });


    it('logFinalValue prints \'parser failed\' message for failure', function() {
      var fakeLogger = makeFakeLogger();
      var expected = logFinalValue.parserFailed;

      logFinalValue([], fakeLogger);
      expect(fakeLogger.params).to.equal(expected);
    });


    it('logFinalValue prints \'no final value\' message for array containing only partial results', function() {
      var fakeLogger = makeFakeLogger();
      var fakeResults = [ParseResult('a', 'b'), ParseResult('cd', 'e')];
      var expected = logFinalValue.noFinalValue;

      logFinalValue(fakeResults, fakeLogger);
      expect(fakeLogger.params).to.equal(expected);
    });


    it('logFinalValue prints final result if present', function() {
      var expected = 'mozilla';
      var fakeLogger = makeFakeLogger();
      var fakeResults = [ParseResult('a', 'b'), ParseResult('', expected)];

      logFinalValue(fakeResults, fakeLogger);
      expect(fakeLogger.params).to.equal(expected);
    });


    it('logFinalValue uses final result\'s toString method', function() {
      var expected = ['d', 'e', 'f'];
      var fakeLogger = makeFakeLogger();
      var fakeResults = [ParseResult('a', 'b'), ParseResult('', expected)];

      logFinalValue(fakeResults, fakeLogger);
      expect(fakeLogger.params).to.equal(expected.toString());
    });
  });


  describe('printParses', function() {
    var printParses = Utilities.printParses;
    var equalsArray = Utilities.equalsArray;


    it('printParses prints newline for parse failure', function() {
      var fakeLogger = makeFakeLogger();
      printParses([], fakeLogger);
      expect(fakeLogger.params).to.equal('\n');
    });


    it('printParses prints parse results', function() {
      var fakeLogger = makeFakeLogger();
      var fakeResults = [ParseResult('a', 'b'), ParseResult('cd', 'e')];
      var expected = fakeResults.map(function(r) {return r.toString();});
      expected = expected.join('\n') + '\n';

      printParses(fakeResults, fakeLogger);
      expect(fakeLogger.params).to.equal(expected);
    });
  });


  describe('logAccepts', function() {
    var makeFakeParser = function(result) {
      var fake = function(input) {
        fake.called = true;
        fake.args = [].slice.call(arguments);

        if (result)
          return [ParseResult('', null)];
        return [ParseResult('a', null)];
      };
      fake.called = false;
      fake.args = null;

      return fake;
    };


    var logAccepts = Utilities.logAccepts;
    var message1 = 'my message1';
    var message2 = 'my message2';
    var input1 = 'SOME INPUT';
    var input2 = 'SOME MORE INPUT';


    it('logAccepts calls accepts correctly', function() {
      var fakeParser = makeFakeParser(true);
      var fakeLogger = makeFakeLogger();
      logAccepts(message1, fakeParser, input1, fakeLogger);
      expect(fakeParser.called).to.equal(true);
      expect(fakeParser.args.length).to.equal(1);
      expect(fakeParser.args[0]).to.equal(input1);

      fakeParser = makeFakeParser(true);
      logAccepts(message1, fakeParser, input2, fakeLogger);
      expect(fakeParser.args.length).to.equal(1);
      expect(fakeParser.args[0]).to.equal(input2);
    });


    it('logAccepts logs the message', function() {
      var fakeParser = makeFakeParser(true);
      var fakeLogger = makeFakeLogger();
      logAccepts(message1, fakeParser, input1, fakeLogger);
      expect(fakeLogger.params.indexOf(message1)).to.be.greaterThan(-1);

      fakeLogger = makeFakeLogger();
      logAccepts(message2, fakeParser, input1, fakeLogger);
      expect(fakeLogger.params.indexOf(message2)).to.be.greaterThan(-1);
    });


    it('logAccepts logs the input', function() {
      var fakeParser = makeFakeParser(true);
      var fakeLogger = makeFakeLogger();
      logAccepts(message1, fakeParser, input1, fakeLogger);
      expect(fakeLogger.params.indexOf(input1)).to.be.greaterThan(-1);

      fakeLogger = makeFakeLogger();
      logAccepts(message1, fakeParser, input2, fakeLogger);
      expect(fakeLogger.params.indexOf(input2)).to.be.greaterThan(-1);
    });


    it('logAccepts logs the result', function() {
      var result = true;
      var fakeParser = makeFakeParser(result);
      var fakeLogger = makeFakeLogger();
      logAccepts(message1, fakeParser, input1, fakeLogger);
      expect(fakeLogger.params.indexOf(result)).to.be.greaterThan(-1);

      result = false;
      fakeParser = makeFakeParser(result);
      fakeLogger = makeFakeLogger();
      logAccepts(message1, fakeParser, input1, fakeLogger);
      expect(fakeLogger.params.indexOf(result)).to.be.greaterThan(-1);
    });



    it('logAccepts logs in the correct order', function() {
      var result = true;
      var fakeParser = makeFakeParser(result);
      var fakeLogger = makeFakeLogger();
      logAccepts(message1, fakeParser, input1, fakeLogger);
      expect(fakeLogger.params.indexOf(input1)).to.be.greaterThan(fakeLogger.params.indexOf(message1));
      expect(fakeLogger.params.indexOf(result)).to.be.greaterThan(fakeLogger.params.indexOf(input1));

      result = false;
      fakeParser = makeFakeParser(result);
      fakeLogger = makeFakeLogger();
      logAccepts(message2, fakeParser, input2, fakeLogger);
      expect(fakeLogger.params.indexOf(input2)).to.be.greaterThan(fakeLogger.params.indexOf(message2));
      expect(fakeLogger.params.indexOf(result)).to.be.greaterThan(fakeLogger.params.indexOf(input2));
    });
  });
});
