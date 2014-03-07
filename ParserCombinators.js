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

    f.thenConcat = function(p2) {
      return concatSeq(this, p2);
    };

    f.thenAppend = function(p2) {
      return plus(this, p2);
    };

    f.thenDrop = function(p2) {
      return takeFirstValueOfSeq(this, p2);
    };

    f.thenReturn = function(p2) {
      return takeSecondValueOfSeq(this, p2);
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


  var apply = function(f, parser) {
    return Parser(function(input) {
      var originalResults = parser(input);

      return originalResults.map(function(r) {
        return ParseResult(r.remaining, f(r.value));
      });
    });
  };


  var concatSeq = function(p1, p2) {
    var concat = function(v) {
      if (!Array.isArray(v))
        return v;

      var v0 = Array.isArray(v[0]) ? v[0] : [v[0]];
      var v1 = Array.isArray(v[1]) ? v[1] : [v[1]];
      return v0.concat(v1);
    };

    return apply(concat, seq(p1, p2));
  };


  var sequence = function() {
    var args = [].slice.call(arguments);
    return args.reduce(function(soFar, current) {
      return concatSeq(soFar, current);
    });
  };


  var plus = function() {
    var args = [].slice.call(arguments);
    var add = function(val) {return val[0] + val[1];};

    return args.reduce(function(soFar, current) {
      return apply(add, seq(soFar, current));
    });
  };


  var takeFirstValueOfSeq = function(p1, p2) {
    var first = function(value) {
      return value[0];
    };
    return apply(first, seq(p1, p2));
  };


  var takeSecondValueOfSeq = function(p1, p2) {
    var second = function(value) {
      return value[1];
    };
    return apply(second, seq(p1, p2));
  };


  var zeroOrMoreOf = function(p) {
    return Parser(function(input) {
      return p.thenConcat(zeroOrMoreOf(p)).or(succeed([]))(input);
    });
  };


  return {
    alt: alt,
    apply: apply,
    concatSeq: concatSeq,
    epsilon: epsilon,
    fail: fail,
    plus: plus,
    satisfy: satisfy,
    seq: seq,
    sequence: sequence,
    strictAlt: strictAlt,
    succeed: succeed,
    symbol: symbol,
    takeFirstValueOfSeq: takeFirstValueOfSeq,
    takeSecondValueOfSeq: takeSecondValueOfSeq,
    token: token,
    zeroOrMoreOf: zeroOrMoreOf
  };
});
