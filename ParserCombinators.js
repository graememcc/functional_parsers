define(['ParseResult.js'], function(ParseResult) {


  var Parser = function(f) {
    f.or = function(p2) {
      return alt(this, p2);
    };

    f.orElse = function(p2) {
      return strictAlt(this, p2);
    };

    f.then = function(p2) {
      return seq(this, p2);
    };

    return f;
  };


  var satisfy = function(pred) {
    return Parser(function(input) {
      if (input.length > 0 && pred(input[0]))
        return [ParseResult(input.slice(1), input[0])];

      return [];
    });
  };


  var matchFirst = function(value, equals) {
    if (typeof(equals) !== 'function')
      equals = function(a, b) {return a === b};

    return satisfy(equals.bind(null, value));
  };


  var symbol = function(symbol) {
    return matchFirst(symbol);
  };


  var token = function(expectedToken) {
    var equals = function(a, b) {
      return a.equals(b);
    };

    return matchFirst(expectedToken, equals);
  };


  var succeed = function(value) {
    return Parser(function(input) {
      return [ParseResult(input, value)];
    });
  };


  var epsilon = succeed(null);


  var fail = Parser(function(input) {
    return [];
  });


  var alt = function(p1, p2) {
    return Parser(function(input) {
      return p1(input).concat(p2(input));
    });
  };


  var strictAlt = function(p1, p2) {
    return Parser(function(input) {
      var result = p1(input);
      if (result.length > 0)
        return result;

      return p2(input);
    });
  };


  var seq = function(p1, p2) {
    return Parser(function(input) {
      var firstResults = p1(input);

      var results = [];
      firstResults.forEach(function(res) {
        var secondResults = p2(res.remaining);
        secondResults.forEach(function(res2) {
          results.push(ParseResult(res2.remaining, [res.value, res2.value]));
        });
      });

      return results;
    });
  };


  return {
    alt: alt,
    epsilon: epsilon,
    fail: fail,
    satisfy: satisfy,
    seq: seq,
    strictAlt: strictAlt,
    succeed: succeed,
    symbol: symbol,
    token: token
  };
});
