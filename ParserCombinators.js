define(['ParseResult.js'], function(ParseResult) {


  var Parser = function(f) {
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


  return {
    epsilon: epsilon,
    satisfy: satisfy,
    succeed: succeed,
    symbol: symbol,
    token: token
  };
});
