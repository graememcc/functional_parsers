var requirejs = require('requirejs');

requirejs(['ParserCombinators.js', 'ParseResult.js', 'Utilities.js', 'chai'],
          function(ParserCombinators, ParseResult, Utilities, chai) {
  "use strict";

  var expect = chai.expect;
  var getResults = Utilities.getResults;


  describe('ParserCombinators exports', function() {
    it('ParserCombinators object has \'symbol\' property', function() {
      expect(ParserCombinators).to.have.property('symbol');
    });


    it('ParserCombinators object\'s symbol property is a function', function() {
      expect(ParserCombinators.symbol).to.be.a('function');
    });


    it('ParserCombinators object has \'token\' property', function() {
      expect(ParserCombinators).to.have.property('token');
    });


    it('ParserCombinators object\'s token property is a function', function() {
      expect(ParserCombinators.token).to.be.a('function');
    });


    it('ParserCombinators object has \'satisfy\' property', function() {
      expect(ParserCombinators).to.have.property('satisfy');
    });


    it('ParserCombinators object\'s satisfy property is a function', function() {
      expect(ParserCombinators.satisfy).to.be.a('function');
    });


    it('ParserCombinators object has \'succeed\' property', function() {
      expect(ParserCombinators).to.have.property('succeed');
    });


    it('ParserCombinators object\'s succeed property is a function', function() {
      expect(ParserCombinators.succeed).to.be.a('function');
    });


    it('ParserCombinators object has \'epsilon\' property', function() {
      expect(ParserCombinators).to.have.property('epsilon');
    });


    it('ParserCombinators object\'s epsilon property is a function', function() {
      expect(ParserCombinators.epsilon).to.be.a('function');
    });


    it('ParserCombinators object has \'fail\' property', function() {
      expect(ParserCombinators).to.have.property('fail');
    });


    it('ParserCombinators object\'s fail property is a function', function() {
      expect(ParserCombinators.fail).to.be.a('function');
    });


    it('ParserCombinators object has \'alt\' property', function() {
      expect(ParserCombinators).to.have.property('alt');
    });


    it('ParserCombinators object\'s alt property is a function', function() {
      expect(ParserCombinators.alt).to.be.a('function');
    });


    it('ParserCombinators object has \'strictAlt\' property', function() {
      expect(ParserCombinators).to.have.property('strictAlt');
    });


    it('ParserCombinators object\'s strictAlt property is a function', function() {
      expect(ParserCombinators.strictAlt).to.be.a('function');
    });
  });


  describe('Symbol combinator', function() {
    var symbol = ParserCombinators.symbol;


    it('Symbol returns a function', function() {
      expect(symbol()).to.be.a('function');
    });


    it('Returned function has length 1', function() {
      expect(symbol().length).to.equal(1);
    });


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


    // A basic Token constructor for the following tests
    var TokenMaker = function(value) {
      if (!(this instanceof TokenMaker))
        return new TokenMaker(value);

      this.value = value;
    };

    TokenMaker.prototype.equals = function(other) {
      return typeof(other) === 'object' && this.value === other.value;
    };


    it('Token returns a function', function() {
      expect(token()).to.be.a('function');
    });


    it('Returned function has length 1', function() {
      expect(token().length).to.equal(1);
    });


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


    // Predicates for use in the following tests
    var always = function(input) {return true;}
    var never = function(input) {return false;}


    it('Satisfy returns a function', function() {
      expect(satisfy()).to.be.a('function');
    });


    it('Returned function has length 1', function() {
      expect(satisfy().length).to.equal(1);
    });


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


    it('Succeed returns a function', function() {
      expect(succeed()).to.be.a('function');
    });


    it('Returned function has length 1', function() {
      expect(succeed().length).to.equal(1);
    });


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


    it('Epsilon is a function', function() {
      expect(epsilon).to.be.a('function');
    });


    it('Epsilon has length 1', function() {
      expect(epsilon.length).to.equal(1);
    });


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


    it('Fail is a function', function() {
      expect(fail).to.be.a('function');
    });


    it('Fail has length 1', function() {
      expect(fail.length).to.equal(1);
    });


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


    it('Alt returns a function', function() {
      var p1 = function(input) {};
      var p2 = function(input) {};
      var parser = alt(p1, p2);
      expect(parser).to.be.a('function');
    });


    it('Parser returned by alt has length 1', function() {
      var p1 = function(input) {};
      var p2 = function(input) {};
      var parser = alt(p1, p2);
      expect(parser.length).to.equal(1);
    });


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


    it('StrictAlt returns a function', function() {
      var p1 = function(input) {};
      var p2 = function(input) {};
      var parser = strictAlt(p1, p2);
      expect(parser).to.be.a('function');
    });


    it('Parser returned by strictAlt has length 1', function() {
      var p1 = function(input) {};
      var p2 = function(input) {};
      var parser = strictAlt(p1, p2);
      expect(parser.length).to.equal(1);
    });


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
});
