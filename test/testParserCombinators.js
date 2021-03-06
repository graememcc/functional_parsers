var requirejs = require('requirejs');

requirejs(['ParserCombinators.js', 'ParseResult.js', 'Utilities.js', 'chai'],
          function(ParserCombinators, ParseResult, Utilities, chai) {
  "use strict";

  var expect = chai.expect;
  var getResults = Utilities.getResults;


  // Generator functions for the property existence tests
  var makePropertyTest = function(obj, prop) {
    return function() {
      expect(obj).to.have.property(prop);
    };
  };


  var makeFunctionTest = function(obj, prop) {
    return function() {
      expect(obj[prop]).to.be.a('function');
    };
  };


  describe('ParserCombinators exports', function() {
    var props = ['symbol', 'token', 'satisfy', 'succeed', 'epsilon', 'fail',
                 'alt', 'strictAlt', 'seq', 'apply', 'concatSeq', 'sequence',
                 'plus', 'takeFirstValueOfSeq', 'takeSecondValueOfSeq', 'zeroOrMoreOf',
                 'oneOrMoreOf', 'optional', 'zeroOrMoreCharacters', 'oneOrMoreCharacters'];

    props.forEach(function(p) {
      it('ParserCombinator object has \'' + p + '\' property', makePropertyTest(ParserCombinators, p));
      it('ParserCombinator object\'s ' + p + ' property is a function', makeFunctionTest(ParserCombinators, p));
    });
  });


  // Generator functions for the combinator tests
  var makeParserIsAFunctionTest = function(parserMaker) {
    return function() {
      var parser = parserMaker();
      expect(parser).to.be.a('function');
    };
  };


  var makeParserHasCorrectLengthTest = function(parserMaker) {
    return function() {
      var parser = parserMaker();
      expect(parser.length).to.equal(1);
    };
  };


  var makeBasicParserTests = function(name, parserMaker) {
    it(name + ' returns a function', makeParserIsAFunctionTest(parserMaker));
    it(name + ' returns a function of length 1', makeParserHasCorrectLengthTest(parserMaker));
  };


  // Bogus parser for the generator tests
  var fakeParser = function(input) {
    return [ParseResult(input.slice(1), input[0])];
  };


  var makeDecoratorExistenceTest = function(parserMaker, prop) {
    return function() {
      var parser = parserMaker();
      makePropertyTest(parser, prop)();
    };
  };


  var makeDecoratorFunctionTest = function(parserMaker, prop) {
    return function() {
      var parser = parserMaker();
      makeFunctionTest(parser, prop)();
    };
  };


  // Generate tests for the properties installed by the Parser decorator,
  // checking that all the expected properties are installed, that they too
  // return Parser-wrapped functions, and that they work as expected
  var makeDecoratorPropertyTests = function(name, parserMaker, recurring) {
    var props = ['or', 'orElse', 'then', 'thenConcat', 'thenAppend', 'thenDrop', 'thenReturn'];
    props.forEach(function(p) {
      it(name + ' parser has \'' + p + '\' property', makeDecoratorExistenceTest(parserMaker, p));
      it(name + ' parser\'s \'' + p + '\' property is a function', makeDecoratorFunctionTest(parserMaker, p));

      // Make a new parser maker out of old, and perhaps recur
      if (recurring)
        return;

      var newParserMaker = function() {
        var original = parserMaker();
        return original[p](fakeParser);
      };
      var newName = name + ' parser\'s \'' + p + '\'';

      makeStandardParserTests(newName, newParserMaker, true);
    });
  };


  var makeDecoratorTests = function(name, parserMaker) {
    // Just have to guess at appropriate input
    var input = 'abcdef';

    it(name + '\'s \'or\' parser works as expected', function() {
      var parser = parserMaker();
      var orResults = getResults(parser.or(fakeParser), input);
      var altResults = getResults(ParserCombinators.alt(parser, fakeParser), input);
      expect(orResults).to.deep.equal(altResults);
    });


    it(name + '\'s \'orElse\' parser works as expected', function() {
      var parser = parserMaker();
      var orElseResults = getResults(parser.orElse(fakeParser), input);
      var strictAltResults = getResults(ParserCombinators.strictAlt(parser, fakeParser), input);
      expect(orElseResults).to.deep.equal(strictAltResults);
    });


    it(name + '\'s \'then\' parser works as expected', function() {
      var parser = parserMaker();
      var thenResults = getResults(parser.then(fakeParser), input);
      var seqResults = getResults(ParserCombinators.seq(parser, fakeParser), input);
      expect(thenResults).to.deep.equal(seqResults);
    });


    it(name + '\'s \'thenConcat\' parser works as expected', function() {
      var parser = parserMaker();
      var thenConcatResults = getResults(parser.thenConcat(fakeParser), input);
      var concatSeqResults = getResults(ParserCombinators.concatSeq(parser, fakeParser), input);
      expect(thenConcatResults).to.deep.equal(concatSeqResults);
    });


    it(name + '\'s \'thenAppend\' parser works as expected', function() {
      var parser = parserMaker();
      var thenAppendResults = getResults(parser.thenAppend(fakeParser), input);
      var plusResults = getResults(ParserCombinators.plus(parser, fakeParser), input);
      expect(thenAppendResults).to.deep.equal(plusResults);
    });


    it(name + '\'s \'thenDrop\' parser works as expected', function() {
      var parser = parserMaker();
      var thenDropResults = getResults(parser.thenDrop(fakeParser), input);
      var takeFirstResults = getResults(ParserCombinators.takeFirstValueOfSeq(parser, fakeParser), input);
      expect(thenDropResults).to.deep.equal(takeFirstResults);
    });


    it(name + '\'s \'thenReturn\' parser works as expected', function() {
      var parser = parserMaker();
      var thenDropResults = getResults(parser.thenReturn(fakeParser), input);
      var takeSecondResults = getResults(ParserCombinators.takeSecondValueOfSeq(parser, fakeParser), input);
      expect(thenDropResults).to.deep.equal(takeSecondResults);
    });
  };


  // One more test generator
  var makeStandardParserTests = function(name, parserMaker, recurring) {
    // 'Recurring' prevents infinite recursion on testing the decorator properties
    var recurring = recurring || false;
    makeBasicParserTests(name, parserMaker);
    makeDecoratorPropertyTests(name, parserMaker, recurring);
    if (!recurring)
      makeDecoratorTests(name, parserMaker);
  };


  describe('Symbol combinator', function() {
    var symbol = ParserCombinators.symbol;
    var makeSymbol = function() {return symbol('a');};
    makeStandardParserTests('symbol', makeSymbol);


    it('Returned parser fails if input doesn\'t match', function() {
      var parser = symbol('a');
      var parseResult = getResults(parser, 'b');
      expect(parseResult).to.deep.equal([]);

      parser = symbol('b');
      parseResult = getResults(parser, 'a');
      expect(parseResult).to.deep.equal([]);
    });


    it('Returned parser fails if input is empty', function() {
      var sym = 'a';
      var parser = symbol(sym);
      var parseResult = getResults(parser, '');
      expect(parseResult).to.deep.equal([]);
    });


    it('Returned parser succeeds if input completely matches (1)', function() {
      var sym = 'a';
      var parser = symbol(sym);
      var parseResult = getResults(parser, sym);
      expect(Utilities.hasCompleteParse(parseResult)).to.be.true;
    });


    it('Returned parser succeeds if input completely matches (2)', function() {
      var sym = 'b';
      var parser = symbol(sym);
      var parseResult = getResults(parser, sym);
      expect(Utilities.hasCompleteParse(parseResult)).to.be.true;
    });


    it('Returned parser returns single result for complete match', function() {
      var sym = 'a';
      var parser = symbol(sym);
      var parseResult = getResults(parser, sym);
      expect(parseResult.length).to.equal(1);
    });


    it('Returned parser succeeds consuming relevant input if start matches (1)', function() {
      var sym = 'a';
      var remainder = 'b';
      var parser = symbol(sym);
      var parseResult = getResults(parser, sym + remainder);
      expect(Utilities.containsResult(ParseResult(remainder, sym), parseResult)).to.be.true;
    });


    it('Returned parser succeeds consuming relevant input if start matches (2)', function() {
      var sym = 'b';
      var remainder = 'c';
      var parser = symbol(sym);
      var parseResult = getResults(parser, sym + remainder);
      expect(Utilities.containsResult(ParseResult(remainder, sym), parseResult)).to.be.true;
    });


    it('Returned parser returns single result for partial match', function() {
      var aParser = symbol('a');
      var parseResult = getResults(aParser, 'ab');
      expect(parseResult.length).to.equal(1);
    });
  });


  describe('Token combinator', function() {
    var token = ParserCombinators.token;
    var makeToken = function() {
      var fakeToken = {equals: function(a) {return a === 'a';}};
      return token(fakeToken);
    };
    makeStandardParserTests('token', makeToken);


    // A basic Token constructor for the following tests
    var TokenMaker = function(value) {
      if (!(this instanceof TokenMaker))
        return new TokenMaker(value);

      this.value = value;
    };

    TokenMaker.prototype.equals = function(other) {
      return typeof(other) === 'object' && this.value === other.value;
    };


    it('Returned parser fails if input doesn\'t match', function() {
      var expectedToken = TokenMaker('a');
      var actualToken = TokenMaker('b');
      var parser = token(expectedToken);
      var parseResult = getResults(parser, [actualToken]);
      expect(parseResult).to.deep.equal([]);

      expectedToken = TokenMaker('b');
      actualToken = TokenMaker('a');
      parser = token(expectedToken);
      parseResult = getResults(parser, [actualToken]);
      expect(parseResult).to.deep.equal([]);
    });


    it('Returned parser fails if input is empty', function() {
      var expectedToken = TokenMaker('a');
      var parser = token(expectedToken);
      var parseResult = getResults(parser, []);
      expect(parseResult).to.deep.equal([]);
    });


    it('Returned parser succeeds if input completely matches (1)', function() {
      var expectedToken = TokenMaker('a');
      var parser = token(expectedToken);
      var parseResult = getResults(parser, [expectedToken]);
      expect(Utilities.hasCompleteParse(parseResult)).to.be.true;
    });


    it('Returned parser succeeds if input completely matches (2)', function() {
      var expectedToken = TokenMaker('b');
      var parser = token(expectedToken);
      var parseResult = getResults(parser, [expectedToken]);
      expect(Utilities.hasCompleteParse(parseResult)).to.be.true;
    });


    it('Returned parser returns single result for complete match', function() {
      var expectedToken = TokenMaker('a');
      var parser = token(expectedToken);
      var parseResult = getResults(parser, [expectedToken]);
      expect(parseResult.length).to.equal(1);
    });


    it('Returned parser succeeds consuming relevant input if start matches (1)', function() {
      var expectedToken = TokenMaker('a');
      var nextToken = TokenMaker('b');
      var parser = token(expectedToken);
      var parseResult = getResults(parser, [expectedToken, nextToken]);
      expect(Utilities.containsResult(ParseResult([nextToken], expectedToken), parseResult)).to.be.true;
    });


    it('Returned parser succeeds consuming relevant input if start matches (2)', function() {
      var expectedToken = TokenMaker('b');
      var nextToken = TokenMaker('c');
      var parser = token(expectedToken);
      var parseResult = getResults(parser, [expectedToken, nextToken]);
      expect(Utilities.containsResult(ParseResult([nextToken], expectedToken), parseResult)).to.be.true;
    });


    it('Returned parser returns single result for partial match', function() {
      var expectedToken = TokenMaker('a');
      var nextToken = TokenMaker('b');
      var parser = token(expectedToken);
      var parseResult = getResults(parser, [expectedToken, nextToken]);
      expect(parseResult.length).to.equal(1);
    });
  });


  describe('Satisfy combinator', function() {
    var satisfy = ParserCombinators.satisfy;
    var makeSatisfy = function() {
      var fakePredicate = function(s) {return s === 'a';};
      return satisfy(fakePredicate);
    };
    makeStandardParserTests('satisfy', makeSatisfy);


    // Predicates for use in the following tests
    var always = function(input) {return true;}
    var never = function(input) {return false;}


    it('Returned parser calls predicate function', function() {
      var pred = function(input) {
        pred.called = true;
        return true;
      };
      pred.called = false;

      var predParser = satisfy(pred);
      // Sanity check
      expect(pred.called).to.equal(false);

      getResults(predParser, 'a');
      expect(pred.called).to.equal(true);
    });


    it('Returned parser calls predicate function with first element of input (1)', function() {
      var pred = function(input) {
        pred.calledWith = input;
        return true;
      };
      pred.calledWith = null;

      var predParser = satisfy(pred);
      // Sanity check
      expect(pred.calledWith).to.equal(null);

      var input = 'abc';
      getResults(predParser, input);
      expect(pred.calledWith).to.equal(input[0]);
    });


    it('Returned parser calls predicate function with first element of input (2)', function() {
      var pred = function(input) {
        pred.calledWith = input;
        return true;
      };
      pred.calledWith = null;

      var predParser = satisfy(pred);
      // Sanity check
      expect(pred.calledWith).to.equal(null);

      var input = ['d', 'e', 'f'];
      getResults(predParser, input);
      expect(pred.calledWith).to.equal(input[0]);
    });


    it('Returned parser fails if input doesn\'t match', function() {
      var input = 'abc';
      var parser = satisfy(never);
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([]);
    });


    it('Returned parser fails if input is empty', function() {
      var input = '';
      var parser = satisfy(always);
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([]);
    });


    it('Returned parser succeeds if input completely matches (1)', function() {
      var expected = 'a';
      var parser = satisfy(always);
      var parseResult = getResults(parser, expected);
      expect(Utilities.hasCompleteParse(parseResult)).to.be.true;
    });


    it('Returned parser succeeds if input completely matches (2)', function() {
      var expected = ['d'];
      var parser = satisfy(always);
      var parseResult = parser(expected);
      expect(Utilities.hasCompleteParse(parseResult)).to.be.true;
    });


    it('Returned parser returns single result for complete match', function() {
      var expected = 'a';
      var parser = satisfy(always);
      var parseResult = getResults(parser, expected);
      expect(parseResult.length).to.equal(1);
    });


    it('Returned parser succeeds consuming relevant input if start matches (1)', function() {
      var expected = 'a';
      var remainder = 'bc';
      var parser = satisfy(always);
      var parseResult = getResults(parser, expected.concat(remainder));
      expect(Utilities.containsResult(ParseResult(remainder, expected), parseResult)).to.be.true;
    });


    it('Returned parser succeeds consuming relevant input if start matches (2)', function() {
      var expected = 'd';
      var remainder = 'ef';
      var parser = satisfy(always);
      var parseResult = getResults(parser, expected.concat(remainder));
      expect(Utilities.containsResult(ParseResult(remainder, expected), parseResult)).to.be.true;
    });


    it('Returned parser returns single result for partial match', function() {
      var expected = 'a';
      var remainder = 'bc';
      var parser = satisfy(always);
      var parseResult = getResults(parser, expected.concat(remainder));
      expect(parseResult.length).to.equal(1);
    });
  });


  describe('Succeed combinator', function() {
    var succeed = ParserCombinators.succeed;
    var makeSucceed = function() {return succeed(1);};
    makeStandardParserTests('succeed', makeSucceed);


    it('Returned parser succeeds with supplied value (1)', function() {
      var value = 1;
      var parser = succeed(value);
      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(Utilities.containsResult(ParseResult(input, value), parseResult)).to.be.true;
    });


    it('Returned parser succeeds with supplied value (2)', function() {
      var value = 'a';
      var parser = succeed(value);
      var input = ['d', 'e', 'f'];
      var parseResult = getResults(parser, input);
      expect(Utilities.containsResult(ParseResult(input, value), parseResult)).to.be.true;
    });


    it('Returned parser succeeds with empty input (1)', function() {
      var value = 1;
      var parser = succeed(value);
      var input = '';
      var parseResult = getResults(parser, input);
      expect(Utilities.containsResult(ParseResult(input, value), parseResult)).to.be.true;
    });


    it('Returned parser succeeds with supplied value (2)', function() {
      var value = 'a';
      var parser = succeed(value);
      var input = [];
      var parseResult = getResults(parser, input);
      expect(Utilities.containsResult(ParseResult(input, value), parseResult)).to.be.true;
    });


    it('Returned parser returns single result', function() {
      var value = 1;
      var parser = succeed(value);
      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult.length).to.equal(1);
    });
  });


  describe('Epsilon', function() {
    var epsilon = ParserCombinators.epsilon;
    var makeEpsilon = function() {return epsilon;};
    makeStandardParserTests('epsilon', makeEpsilon);


    it('Epsilon succeeds with null', function() {
      var input = 'abc';
      var parseResult = getResults(epsilon, input);
      expect(Utilities.containsResult(ParseResult(input, null), parseResult)).to.be.true;
    });


    it('Epsilon succeeds with null (2)', function() {
      var input = ['d', 'e', 'f'];
      var parseResult = getResults(epsilon, input);
      expect(Utilities.containsResult(ParseResult(input, null), parseResult)).to.be.true;
    });


    it('Epsilon succeeds with empty input (1)', function() {
      var input = '';
      var parseResult = getResults(epsilon, input);
      expect(Utilities.containsResult(ParseResult(input, null), parseResult)).to.be.true;
    });


    it('Returned parser epsilons with supplied value (2)', function() {
      var input = [];
      var parseResult = getResults(epsilon, input);
      expect(Utilities.containsResult(ParseResult(input, null), parseResult)).to.be.true;
    });


    it('Returned parser returns single result', function() {
      var input = 'abc';
      var parseResult = getResults(epsilon, input);
      expect(parseResult.length).to.equal(1);
    });
  });


  describe('Fail', function() {
    var fail = ParserCombinators.fail;
    var makeFail = function() {return fail;};
    makeStandardParserTests('fail', makeFail);


    it('Fail fails with input (1)', function() {
      var input = 'abc';
      var parseResult = getResults(fail, input);
      expect(parseResult).to.deep.equal([]);
    });


    it('Fail fails with input (2)', function() {
      var input = ['d', 'e', 'f'];
      var parseResult = getResults(fail, input);
      expect(parseResult).to.deep.equal([]);
    });


    it('Fail fails with empty input', function() {
      var input = '';
      var parseResult = getResults(fail, input);
      expect(parseResult).to.deep.equal([]);
    });
  });


  describe('Alt combinator', function() {
    var alt =  ParserCombinators.alt;
    var makeAlt = function() {return alt(fakeParser, fakeParser);};
    makeStandardParserTests('alt', makeAlt);


    it('Parser returned by alt fails if both alternatives fail', function() {
      var p1 = ParserCombinators.fail;
      var p2 = ParserCombinators.fail;
      var parser = alt(p1, p2);
      var result = getResults(parser, 'abc');
      expect(result).to.deep.equal([]);
    });


    it('Parser returned by alt returns first parser\'s results if second parser fails', function() {
      var result = [ParseResult('a', 'b')];
      var p1 = function(input) {return result;};
      var p2 = ParserCombinators.fail;

      var parser = alt(p1, p2);
      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal(p1(input));
    });


    it('Parser returned by alt returns second parser\'s results if first parser fails', function() {
      var result = [ParseResult('a', 'b')];
      var p1 = ParserCombinators.fail;
      var p2 = function(input) {return result;};

      var parser = alt(p1, p2);
      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal(p2(input));
    });


    it('Parser returned by alt returns both parsers\' results if both parsers succeed', function() {
      var result1 = [ParseResult('a', 'b')];
      var result2 = [ParseResult('c', 'd')];
      var p1 = function(input) {return result1;};
      var p2 = function(input) {return result2;};

      var parser = alt(p1, p2);
      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal(p1(input).concat(p2(input)));
    });
  });


  describe('StrictAlt combinator', function() {
    var strictAlt =  ParserCombinators.strictAlt;
    var empty = function(input) {};
    var makeStrictAlt = function() {return strictAlt(fakeParser, fakeParser);};
    makeStandardParserTests('strictAlt', makeStrictAlt);


    it('Parser returned by strictAlt fails if both alternatives fail', function() {
      var p1 = ParserCombinators.fail;
      var p2 = ParserCombinators.fail;
      var parser = strictAlt(p1, p2);
      var result = getResults(parser, 'abc');
      expect(result).to.deep.equal([]);
    });


    it('Parser returned by strictAlt returns first parser\'s results if second parser fails', function() {
      var result = [ParseResult('a', 'b')];
      var p1 = function(input) {return result;};
      var p2 = ParserCombinators.fail;

      var parser = strictAlt(p1, p2);
      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal(p1(input));
    });


    it('Parser returned by strictAlt returns second parser\'s results if first parser fails', function() {
      var result = [ParseResult('a', 'b')];
      var p1 = ParserCombinators.fail;
      var p2 = function(input) {return result;};

      var parser = strictAlt(p1, p2);
      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal(p2(input));
    });


    it('Parser returned by strictAlt returns first parser\'s results if both parsers succeed', function() {
      var result1 = [ParseResult('a', 'b')];
      var result2 = [ParseResult('c', 'd')];
      var p1 = function(input) {return result1;};
      var p2 = function(input) {return result2;};

      var parser = strictAlt(p1, p2);
      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal(p1(input));
    });
  });


  describe('Seq combinator', function() {
    var seq =  ParserCombinators.seq;
    var empty = function(input) {};
    var makeSeq = function() {return seq(fakeParser, fakeParser);};
    makeStandardParserTests('seq', makeSeq);


    it('Parser returned by seq fails if both alternatives fail', function() {
      var p1 = ParserCombinators.fail;
      var p2 = ParserCombinators.fail;
      var parser = seq(p1, p2);
      var result = getResults(parser, 'abc');
      expect(result).to.deep.equal([]);
    });


    it('Parser returned by seq fails if first parser fails', function() {
      var result = [ParseResult('a', 'b')];
      var p1 = ParserCombinators.fail;
      var p2 = function(input) {return result;};

      var parser = seq(p1, p2);
      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([]);
    });


    it('Parser returned by seq fails if second parser fails', function() {
      var result = [ParseResult('a', 'b')];
      var p1 = function(input) {return result;};
      var p2 = ParserCombinators.fail;

      var parser = seq(p1, p2);
      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([]);
    });


    it('Parser returned by seq succeeds if both parsers succeed', function() {
      var result1 = [ParseResult('a', 'b')];
      var result2 = [ParseResult('c', 'd')];
      var p1 = function(input) {return result1;};
      var p2 = function(input) {return result2;};

      var parser = seq(p1, p2);
      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.not.deep.equal([]);
    });


    it('Returned parser calls second parser with results of first parser', function() {
      var results = [ParseResult('a', 'b'), ParseResult('c', 'd'), ParseResult('e', 'f')];
      var p1 = function(input) {return results;};
      var p2 = function(input) {
        p2.inputs.push(input);
        return [input];
      };
      p2.inputs = [];

      var parser = seq(p1, p2);
      getResults(parser, '');
      results.forEach(function(r) {
        expect(p2.inputs.indexOf(r.remaining)).to.not.equal(-1);
      });
    });


    it('Returned parser correctly combines values', function() {
      var result1 = [ParseResult('a', 'b'), ParseResult('c', 'd'), ParseResult('e', 'f')];
      var result2 = [ParseResult('g', 1), ParseResult('h', 2)];
      var p1 = function(input) {return result1;};
      var p2 = function(input) {return result2;};

      var parser = seq(p1, p2);
      var result = getResults(parser, '');
      result1.forEach(function(r) {
        result2.forEach(function(s) {
          expect(Utilities.containsResult(ParseResult(s.remaining, [r.value, s.value]), result)).to.be.true;
        });
      });
    });


    it('Returned parser returns correct number of results', function() {
      var results1 = [ParseResult('a', 'b'), ParseResult('c', 'd'), ParseResult('e', 'f')];
      var results2 = {
        'a': [ParseResult('g', 1), ParseResult('h', 2)],
        'c': [ParseResult('i', 3)],
        'e': [ParseResult('j', 4), ParseResult('k', 5), ParseResult('l', 6), ParseResult('m', 7)]
      };
      var p1 = function(input) {return results1;};
      var p2 = function(input) {return results2[input];};

      var resultCount = 0;
      results1.forEach(function(r) {
        resultCount += p2(r.remaining).length;
      });

      var parser = seq(p1, p2);
      expect(getResults(parser, 'abc').length).to.equal(resultCount);
    });
  });


  describe('Apply combinator', function() {
    var apply =  ParserCombinators.apply;
    var id = function(i) {return i;};
    var makeApply = function() {return apply(id, fakeParser);};
    makeStandardParserTests('apply', makeApply);


    it('Parser returned by apply fails if wrapped parser fails', function() {
      var p1 = ParserCombinators.fail;
      var f = function(input) {return 1;};
      var parser = apply(f, p1);
      var result = getResults(parser, 'abc');
      expect(result).to.deep.equal([]);
    });


    it('Parser returned by apply correctly transforms results', function() {
      var originalResult = [ParseResult('a', 'a'), ParseResult('b', 'ab'), ParseResult('b', 'abc')];
      var p1 = function(input) {return originalResult;};
      var f = function(input) {return input.length;};
      var expectedResults = originalResult.map(function(p) {
        return ParseResult(p.remaining, p.value.length);
      });

      var parser = apply(f, p1);
      var parseResult = getResults(parser, 'a');
      expect(parseResult).to.deep.equal(expectedResults);
    });
  });


  describe('concatSeq combinator', function() {
    var concatSeq = ParserCombinators.concatSeq;
    var makeConcatSeq = function() {return concatSeq(fakeParser, fakeParser);};
    makeStandardParserTests('concatSeq', makeConcatSeq);


    it('Parser returned by concatSeq fails if first parser fails', function() {
      var result = [ParseResult('a', 'b')];
      var p1 = ParserCombinators.fail;
      var p2 = function(input) {return result;};

      var parser = concatSeq(p1, p2);
      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([]);
    });


    it('Parser returned by concatSeq fails if second parser fails', function() {
      var result = [ParseResult('a', 'b')];
      var p1 = function(input) {return result;};
      var p2 = ParserCombinators.fail;

      var parser = concatSeq(p1, p2);
      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([]);
    });


    it('Parser returned by concatSeq fails if both parsers fail', function() {
      var p1 = ParserCombinators.fail;
      var p2 = ParserCombinators.fail;

      var parser = concatSeq(p1, p2);
      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([]);
    });


    it('ConcatSeq isomorphic to seq if parse results do not have array values', function() {
      var result = [ParseResult('a', 'b')];
      var p = function(input) {return result;};
      var parser = concatSeq(p, p);

      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal(getResults(ParserCombinators.seq(p, p), input));
    });


    it('ConcatSeq concats if first ParseResult\'s value is an array', function() {
      var firstResult = [ParseResult('a', ['b'])];
      var secondResult = [ParseResult('', 'c')];
      var p1 = function(input) {return firstResult;};
      var p2 = function(input) {return secondResult;};
      var parser = concatSeq(p1, p2);

      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([ParseResult('', ['b', 'c'])]);
    });


    it('ConcatSeq concats if second ParseResult\'s value is an array', function() {
      var firstResult = [ParseResult('a', 'e')];
      var secondResult = [ParseResult('', ['f'])];
      var p1 = function(input) {return firstResult;};
      var p2 = function(input) {return secondResult;};
      var parser = concatSeq(p1, p2);

      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([ParseResult('', ['e', 'f'])]);
    });


    it('ConcatSeq concats if both ParseResult\'s values are arrays', function() {
      var firstResult = [ParseResult('a', ['g'])];
      var secondResult = [ParseResult('', ['h'])];
      var p1 = function(input) {return firstResult;};
      var p2 = function(input) {return secondResult;};
      var parser = concatSeq(p1, p2);

      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([ParseResult('', ['g', 'h'])]);
    });
  });


  describe('Sequence combinator', function() {
    var sequence =  ParserCombinators.sequence;
    var makeSequence = function() {return sequence(fakeParser, fakeParser);};
    makeStandardParserTests('sequence', makeSequence);


    it('Sequence parser is isomorphic to wrapped parser if called with only 1 parser (1)', function() {
      var p = ParserCombinators.succeed('a');
      var parser = sequence(p);

      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal(getResults(p, input));
    });


    it('Sequence parser is isomorphic to wrapped parser if called with only 1 parser (2)', function() {
      var p = ParserCombinators.succeed(42);
      var parser = sequence(p);

      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal(getResults(p, input));
    });


    it('Sequence parser is isomorphic to concatSeq if called with only 2 parsers (1)', function() {
      var p = ParserCombinators.succeed('a');
      var parser = sequence(p, fakeParser);

      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal(getResults(ParserCombinators.concatSeq(p, fakeParser), input));
    });


    it('Sequence parser is isomorphic to concatSeq if called with only 2 parsers (2)', function() {
      var p1 = ParserCombinators.succeed(['a']);
      var p2 = ParserCombinators.succeed(['b']);
      var parser = sequence(p1, p2);

      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal(getResults(ParserCombinators.concatSeq(p1, p2), input));
    });


    it('Sequence parser fails if first parser fails', function() {
      var p1 = ParserCombinators.succeed('a');
      var p2 = ParserCombinators.succeed('b');
      var parser = sequence(ParserCombinators.fail, p1, p2, fakeParser);

      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([]);
    });


    it('Sequence parser fails if mid parser fails', function() {
      var p1 = ParserCombinators.succeed('a');
      var p2 = ParserCombinators.succeed('b');
      var parser = sequence(p1, ParserCombinators.fail, p2, fakeParser);

      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([]);
    });


    it('Sequence parser fails if last parser fails', function() {
      var p1 = ParserCombinators.succeed('a');
      var p2 = ParserCombinators.succeed('b');
      var parser = sequence(p2, fakeParser, p1, ParserCombinators.fail);

      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([]);
    });


    it('Sequence parser works correctly (1)', function() {
      var p1 = ParserCombinators.succeed('a');
      var p2 = ParserCombinators.succeed('b');
      var p3 = ParserCombinators.succeed('c');
      var parser = sequence(p1, p2, p3);

      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([ParseResult('abc', ['a', 'b', 'c'])]);
    });
  });


  describe('Plus combinator', function() {
    var plus =  ParserCombinators.plus;
    var makePlus = function() {return plus(fakeParser, fakeParser);};
    makeStandardParserTests('seqeunce', makePlus);


    it('Plus parser is isomorphic to wrapped parser if called with only one parser (1)', function() {
      var p = ParserCombinators.succeed('a');
      var parser = plus(p);

      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal(getResults(p, input));
    });


    it('Plus parser is isomorphic to wrapped parser if called with only one parser (2)', function() {
      var p = ParserCombinators.succeed(42);
      var parser = plus(p);

      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal(getResults(p, input));
    });


    it('Plus parser fails if first parser fails', function() {
      var p1 = ParserCombinators.fail;
      var p2 = ParserCombinators.succeed('b');
      var p3 = ParserCombinators.succeed('c');
      var parser = plus(p1, p2, p3);

      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([]);
    });


    it('Plus parser fails if mid parser fails', function() {
      var p1 = ParserCombinators.succeed('a');
      var p2 = ParserCombinators.succeed('b');
      var p3 = ParserCombinators.fail;
      var p4 = ParserCombinators.succeed('d');
      var parser = plus(p1, p2, p3, p4);

      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([]);
    });


    it('Plus parser fails if second parser fails', function() {
      var p1 = ParserCombinators.succeed('a');
      var p2 = ParserCombinators.succeed('b');
      var p3 = ParserCombinators.fail;
      var parser = plus(p1, p2, p3);

      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([]);
    });


    it('Plus parser fails if both parsers fail', function() {
      var p1 = ParserCombinators.fail;
      var p2 = ParserCombinators.fail;
      var parser = plus(p1, p2);

      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([]);
    });


    it('Plus parser concatenates results correctly', function() {
      var p = ParserCombinators.succeed('a');
      var parser = plus(p, p);

      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([ParseResult('abc', 'aa')]);
    });


    it('Plus parser concatenates in correct order', function() {
      var p1 = ParserCombinators.succeed('a');
      var p2 = ParserCombinators.succeed('b');
      var p3 = ParserCombinators.succeed('d');
      var parser = plus(p1, p2, p3);

      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([ParseResult('abc', 'abd')]);
    });


    it('Plus parser does not act only on strings', function() {
      var p1 = ParserCombinators.succeed(2);
      var p2 = ParserCombinators.succeed(3);
      var parser = plus(p1, p2);

      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([ParseResult('abc', 5)]);
    });
  });


  describe('takeFirstValueOfSeq Combinator', function() {
    var takeFirstValueOfSeq =  ParserCombinators.takeFirstValueOfSeq;
    var makeFirstOf = function() {return takeFirstValueOfSeq(fakeParser, fakeParser);};
    makeStandardParserTests('takeFirstValueOfSeq', makeFirstOf);


    it('Parser returned by takeFirstValueOfSeq fails if first parser fails', function() {
      var p1 = ParserCombinators.fail;
      var p2 = ParserCombinators.succeed('a');

      var parser = takeFirstValueOfSeq(p1, p2);
      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([]);
    });


    it('Parser returned by takeFirstValueOfSeq fails if second parser fails', function() {
      var p1 = ParserCombinators.succeed('a');
      var p2 = ParserCombinators.fail;

      var parser = takeFirstValueOfSeq(p1, p2);
      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([]);
    });


    it('Parser returned by takeFirstValueOfSeq fails if both alternatives fail', function() {
      var p1 = ParserCombinators.fail;
      var p2 = ParserCombinators.fail;

      var parser = takeFirstValueOfSeq(p1, p2);
      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([]);
    });


    it('Parser returned by takeFirstValueOfSeq works correctly (1)', function() {
      var p1 = ParserCombinators.succeed('e');
      var p2 = ParserCombinators.succeed('f');

      var parser = takeFirstValueOfSeq(p1, p2);
      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([ParseResult(input, 'e')]);
    });


    it('Parser returned by takeFirstValueOfSeq works correctly (2)', function() {
      var p1 = ParserCombinators.succeed('g');
      var p2 = ParserCombinators.succeed('h');

      var parser = takeFirstValueOfSeq(p1, p2);
      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([ParseResult(input, 'g')]);
    });


    it('Parser returned by takeFirstValueOfSeq returns correct value for remaining', function() {
      var p1 = ParserCombinators.symbol('a');
      var p2 = ParserCombinators.symbol('b');

      var input = 'abc';
      var parser = takeFirstValueOfSeq(p1, p2);
      var expectedRemaining = getResults(p1.then(p2), input)[0].remaining;
      var parseResult = getResults(parser, input);
      expect(parseResult[0].remaining).to.equal(expectedRemaining);
    });
  });


  describe('takeSecondValueOfSeq Combinator', function() {
    var takeSecondValueOfSeq =  ParserCombinators.takeSecondValueOfSeq;
    var makeSecondOf = function() {return takeSecondValueOfSeq(fakeParser, fakeParser);};
    makeStandardParserTests('takeSecondValueOfSeq', makeSecondOf);


    it('Parser returned by takeSecondValueOfSeq fails if first parser fails', function() {
      var p1 = ParserCombinators.fail;
      var p2 = ParserCombinators.succeed('a');

      var parser = takeSecondValueOfSeq(p1, p2);
      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([]);
    });


    it('Parser returned by takeSecondValueOfSeq fails if second parser fails', function() {
      var p1 = ParserCombinators.succeed('a');
      var p2 = ParserCombinators.fail;

      var parser = takeSecondValueOfSeq(p1, p2);
      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([]);
    });


    it('Parser returned by takeSecondValueOfSeq fails if both alternatives fail', function() {
      var p1 = ParserCombinators.fail;
      var p2 = ParserCombinators.fail;

      var parser = takeSecondValueOfSeq(p1, p2);
      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([]);
    });


    it('Parser returned by takeSecondValueOfSeq works correctly (1)', function() {
      var p1 = ParserCombinators.succeed('e');
      var p2 = ParserCombinators.succeed('f');

      var parser = takeSecondValueOfSeq(p1, p2);
      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([ParseResult(input, 'f')]);
    });


    it('Parser returned by takeSecondValueOfSeq works correctly (2)', function() {
      var p1 = ParserCombinators.succeed('g');
      var p2 = ParserCombinators.succeed('h');

      var parser = takeSecondValueOfSeq(p1, p2);
      var input = 'abc';
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([ParseResult(input, 'h')]);
    });


    it('Parser returned by takeSecondValueOfSeq returns correct value for remaining', function() {
      var p1 = ParserCombinators.symbol('a');
      var p2 = ParserCombinators.symbol('b');

      var input = 'abc';
      var parser = takeSecondValueOfSeq(p1, p2);
      var expectedRemaining = getResults(p1.then(p2), input)[0].remaining;
      var parseResult = getResults(parser, input);
      expect(parseResult[0].remaining).to.equal(expectedRemaining);
    });
  });


  // The next three functions are helpers for the Kleene tests
  var duplicate = function(text, times, leaveAsArray) {
    leaveAsArray = leaveAsArray || false;
    var s = [];

    for (var i = 0; i < times; i++)
      s.push(text);
    if (typeof(text) === 'string' && !leaveAsArray)
      s = s.join('')
    return s;
  };


  var checkLength = function(parser, text, times, isOneOrMore) {
    return function() {
      isOneOrMore = isOneOrMore || false;
      var input = duplicate(text, times);
      var parseResult = getResults(parser, input);
      var expectedLength = isOneOrMore ? times : times + 1;
      expect(parseResult.length).to.equal(expectedLength);
    };
  };


  var checkOccurences = function(parser, text, times, isOneOrMore) {
    return function() {
      isOneOrMore = isOneOrMore || false;
      var input = duplicate(text, times);
      var parseResult = getResults(parser, input);
      var start = isOneOrMore ? 1 : 0;

      for (var i = start; i <= times; i++) {
        var expectedRemaining = duplicate(text, times - i, Array.isArray(text));
        var expectedConsumed = duplicate(text, i, true);
        expect(Utilities.containsResult(ParseResult(expectedRemaining, expectedConsumed), parseResult)).to.be.true;
      };
    };
  };


  var makeKleeneTests = function(desc, isOneOrMore, parser, text, times) {
    it(desc + ' returns correct number of results for input of length ' + times,
       checkLength(parser, text, times, isOneOrMore));
    it(desc + ' returns correct results for input of length ' + times,
       checkOccurences(parser, text, times, isOneOrMore));
  };


  describe('zeroOrMoreOf Combinator', function() {
    var zeroOrMoreOf =  ParserCombinators.zeroOrMoreOf;
    var makeZeroOrMoreOf = function() {return zeroOrMoreOf(ParserCombinators.symbol('a'));};
    makeStandardParserTests('zeroOrMoreOf', makeZeroOrMoreOf);


    it('zeroOrMoreOf returns correct ParseResult for no matches (1)', function() {
      var p1 = ParserCombinators.fail;
      var input = 'a';
      var parser = zeroOrMoreOf(p1);
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([ParseResult(input, [])]);
    });


    it('zeroOrMoreOf returns correct ParseResult for no matches (2)', function() {
      var p1 = ParserCombinators.symbol('a');
      var input = 'b';
      var parser = zeroOrMoreOf(p1);
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([ParseResult(input, [])]);
    });


    it('zeroOrMoreOf accepts zero from empty input', function() {
      var p1 = ParserCombinators.symbol('b');
      var input = '';
      var parser = zeroOrMoreOf(p1);
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([ParseResult(input, [])]);
    });


    var a = zeroOrMoreOf(ParserCombinators.symbol('a'));
    for (var i = 0; i < 5; i++)
      makeKleeneTests('zeroOrMore', false, a, 'a', i);

    var digit = zeroOrMoreOf(ParserCombinators.satisfy(function(c) {return c >= '0' && c <= '9';}));
    for (var i = 5; i < 10; i++)
      makeKleeneTests('zeroOrMore', false, digit, ['0', '1', '2', '3', '4'][i - 5], i);
  });


  describe('oneOrMoreOf Combinator', function() {
    var oneOrMoreOf =  ParserCombinators.oneOrMoreOf;
    var makeOneOrMoreOf = function() {return oneOrMoreOf(ParserCombinators.symbol('a'));};
    makeStandardParserTests('oneOrMoreOf', makeOneOrMoreOf);


    it('oneOrMoreOf fails for no matches (1)', function() {
      var p1 = ParserCombinators.symbol('b');
      var input = 'a';
      var parser = oneOrMoreOf(p1);
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([]);
    });


    it('oneOrMoreOf fails for no matches (2)', function() {
      var p1 = ParserCombinators.symbol('a').then(ParserCombinators.symbol('b'));
      var input = 'ac';
      var parser = oneOrMoreOf(p1);
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([]);
    });


    var a = oneOrMoreOf(ParserCombinators.symbol('a'));
    for (var i = 1; i < 5; i++)
      makeKleeneTests('oneOrMore', true, a, 'a', i);

    var digit = oneOrMoreOf(ParserCombinators.satisfy(function(c) {return c >= '0' && c <= '9';}));
    for (var i = 5; i < 10; i++)
      makeKleeneTests('oneOrMore', true, digit, ['0', '1', '2', '3', '4'][i - 5], i);
  });


  describe('optional Combinator', function() {
    var optional =  ParserCombinators.optional;
    var makeOptional = function() {return optional(ParserCombinators.symbol('a'));};
    makeStandardParserTests('optional', makeOptional);
    var containsResult = Utilities.containsResult;


    it('optional returns correct ParseResult for no matches (1)', function() {
      var p1 = ParserCombinators.fail;
      var input = 'a';
      var parser = optional(p1);
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([ParseResult(input, [])]);
    });


    it('optional returns correct ParseResult for no matches (2)', function() {
      var p1 = ParserCombinators.symbol('a');
      var input = 'b';
      var parser = optional(p1);
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([ParseResult(input, [])]);
    });


    it('optional accepts zero from empty input', function() {
      var p1 = ParserCombinators.symbol('a');
      var input = '';
      var parser = optional(p1);
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([ParseResult(input, [])]);
    });


    it('optional returns both results for a single match (1)', function() {
      var p1 = ParserCombinators.symbol('a');
      var input = 'a';
      var parser = optional(p1);
      var parseResult = getResults(parser, input);
      expect(parseResult.length).to.equal(2);
      expect(containsResult(ParseResult(input, []), parseResult)).to.be.true;
      expect(containsResult(ParseResult('', [input]), parseResult)).to.be.true;
    });


    it('optional returns both results for a single match (2)', function() {
      var p1 = ParserCombinators.symbol('b').then(ParserCombinators.symbol('c'));
      var input = 'bc';
      var parser = optional(p1);
      var parseResult = getResults(parser, input);
      expect(parseResult.length).to.equal(2);
      expect(containsResult(ParseResult(input, []), parseResult)).to.be.true;
      expect(containsResult(ParseResult('', [input.split('')]), parseResult)).to.be.true;
    });


    it('optional consumes at most one match', function() {
      var p1 = ParserCombinators.symbol('a');
      var input = 'aa';
      var parser = optional(p1);
      var parseResult = getResults(parser, input);
      expect(parseResult.length).to.equal(2);
      expect(containsResult(ParseResult(input, []), parseResult)).to.be.true;
      expect(containsResult(ParseResult('a', ['a']), parseResult)).to.be.true;
    });
  });


  describe('zeroOrMoreCharacters Combinator', function() {
    var containsResult = Utilities.containsResult;
    var zeroOrMoreCharacters =  ParserCombinators.zeroOrMoreCharacters;
    var makeZeroOrMoreOf = function() {return zeroOrMoreCharacters(ParserCombinators.symbol('a'));};
    makeStandardParserTests('zeroOrMoreCharacters', makeZeroOrMoreOf);


    it('zeroOrMoreCharacters returns correct ParseResult for no matches (1)', function() {
      var p1 = ParserCombinators.fail;
      var input = 'a';
      var parser = zeroOrMoreCharacters(p1);
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([ParseResult(input, '')]);
    });


    it('zeroOrMoreCharacters returns correct ParseResult for no matches (2)', function() {
      var p1 = ParserCombinators.symbol('a');
      var input = 'b';
      var parser = zeroOrMoreCharacters(p1);
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([ParseResult(input, '')]);
    });


    it('zeroOrMoreCharacters accepts zero from empty input', function() {
      var p1 = ParserCombinators.symbol('b');
      var input = '';
      var parser = zeroOrMoreCharacters(p1);
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([ParseResult(input, '')]);
    });


    it('zeroOrMoreCharacters returns string containing matched input (1)', function() {
      var parser = zeroOrMoreCharacters(ParserCombinators.symbol('a'));
      var input = 'aa';
      var parseResult = getResults(parser, input);
      expect(parseResult.length).to.equal(3);
      expect(containsResult(ParseResult(input, ''), parseResult)).to.be.true;
      expect(containsResult(ParseResult('a', 'a'), parseResult)).to.be.true;
      expect(containsResult(ParseResult('', input), parseResult)).to.be.true;
    });


    it('zeroOrMoreCharacters returns string containing matched input (2)', function() {
      var parser = zeroOrMoreCharacters(ParserCombinators.symbol('a'));
      var input = 'aab';
      var parseResult = getResults(parser, input);
      expect(parseResult.length).to.equal(3);
      expect(containsResult(ParseResult(input, ''), parseResult)).to.be.true;
      expect(containsResult(ParseResult('ab', 'a'), parseResult)).to.be.true;
      expect(containsResult(ParseResult('b', 'aa'), parseResult)).to.be.true;
    });
  });


  describe('oneOrMoreCharacters Combinator', function() {
    var containsResult = Utilities.containsResult;
    var oneOrMoreCharacters =  ParserCombinators.oneOrMoreCharacters;
    var makeOneOrMoreOf = function() {return oneOrMoreCharacters(ParserCombinators.symbol('a'));};
    makeStandardParserTests('oneOrMoreCharacters', makeOneOrMoreOf);


    it('oneOrMoreCharacters fails for no matches (1)', function() {
      var p1 = ParserCombinators.symbol('b');
      var input = 'a';
      var parser = oneOrMoreCharacters(p1);
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([]);
    });


    it('oneOrMoreCharacters fails for no matches (2)', function() {
      var p1 = ParserCombinators.symbol('a').then(ParserCombinators.symbol('b'));
      var input = 'ac';
      var parser = oneOrMoreCharacters(p1);
      var parseResult = getResults(parser, input);
      expect(parseResult).to.deep.equal([]);
    });


    it('oneOrMoreCharacters returns string containing matched input (1)', function() {
      var parser = oneOrMoreCharacters(ParserCombinators.symbol('a'));
      var input = 'aa';
      var parseResult = getResults(parser, input);
      expect(parseResult.length).to.equal(2);
      expect(containsResult(ParseResult('a', 'a'), parseResult)).to.be.true;
      expect(containsResult(ParseResult('', input), parseResult)).to.be.true;
    });


    it('oneOrMoreCharacters returns string containing matched input (2)', function() {
      var parser = oneOrMoreCharacters(ParserCombinators.symbol('a'));
      var input = 'aab';
      var parseResult = getResults(parser, input);
      expect(parseResult.length).to.equal(2);
      expect(containsResult(ParseResult('ab', 'a'), parseResult)).to.be.true;
      expect(containsResult(ParseResult('b', 'aa'), parseResult)).to.be.true;
    });
  });
});
