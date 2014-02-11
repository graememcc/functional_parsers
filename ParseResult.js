define([], function() {
  "use strict";


  var ParseResult = function(remaining, value) {
    if (!(this instanceof ParseResult))
      return new ParseResult(remaining, value);

    this.remaining = remaining;
    this.value = value;
  };


  ParseResult.prototype.toString = function() {
    return ['{ Remaining: ', this.remaining.toString(),
            ' | Value: ', this.value.toString(), '}'].join('');
  };


  return ParseResult;
});
