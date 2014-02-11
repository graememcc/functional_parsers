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
  });


  describe('accepts', function() {
    var accepts = Utilities.accepts;

    it('Accepts takes two parameters', function() {
      expect(accepts.length).to.equal(2);
    });


    it('Accepts calls the parser with the given input', function() {
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


    // The next few tests have a common shape: factor out the boilerplate
    var makeAcceptsTest = function(fakeParserOutput, expectedResult) {
      return function() {
        var fakeParser = function(s) {
          return fakeParserOutput;
        };

        var input = 'mozilla';
        expect(accepts(fakeParser, input)).to.equal(expectedResult);
      };
    };


    it('Accepts returns false if the parser fails', makeAcceptsTest([], false));


    var makeElement = function(r) {return {remaining: r, value: null};};
    var tests = [
      {name: 'array', fail: [makeElement(['a']), makeElement(['b'])], pass: [makeElement(['a']), makeElement(['b']), makeElement([])]},
      {name: 'string', fail: [makeElement('a'), makeElement('b')], pass: [makeElement('a'), makeElement('b'), makeElement('')]}
    ];


    tests.forEach(function(test) {
      var name = test.name;

      it('Accepts fails if no element with \'remaining\' of length 0 (' + name + ')',
         makeAcceptsTest(test.fail, false));

      it('Accepts succeeds if element with \'remaining\' of length 0 (' + name + ')',
         makeAcceptsTest(test.pass, true));
    });
  });
});

