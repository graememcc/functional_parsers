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
});
