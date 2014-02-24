define(['ParseResult.js'], function(ParseResult) {


  var Parser = function(f) {
    return f;
  };


  var symbol = function(symbol) {
    return Parser(function(input) {
      if (input[0] !== symbol)
        return [];

      return [ParseResult(input.slice(1), symbol)];
    });
  };


  return {
    symbol: symbol
  };
});
