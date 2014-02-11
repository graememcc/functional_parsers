define([], function() {
  "use strict";


  var accepts = function(parser, input) {
    var results = parser(input);

    return results.some(function(result) {
      return result.remaining.length === 0;
    });
  };


  return {
    accepts: accepts
  };
});
