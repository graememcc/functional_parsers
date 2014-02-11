define(['Utilities.js'], function(Utilities) {
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


  var equalsArray = Utilities.equalsArray;
  ParseResult.prototype.equals = function(other) {
    var remainingEqual = Array.isArray(this.remaining) ? equalsArray(this.remaining, other.remaining) : this.remaining === other.remaining;
    if (!remainingEqual)
      return false;

    var valueEqual = Array.isArray(this.value) ? equalsArray(this.value, other.value) : this.value === other.value;
    return valueEqual;
  };


  return ParseResult;
});
