define([], function() {
  "use strict";


  var accepts = function(parser, input) {
    return hasCompleteParse(parser(input));
  };


  var hasCompleteParse = function(results) {
    return results.some(function(result) {
      return result.remaining.length === 0;
    });
  };


  return {
    accepts: accepts,
    hasCompleteParse: hasCompleteParse
  };
});
