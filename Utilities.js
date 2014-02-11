define([], function() {
  "use strict";


  var accepts = function(parser, input) {
    return hasCompleteParse(parser(input));
  };


  var getFinalValue = function(results) {
    var resultFound = false;
    var finalResult = null;

    // Use some to terminate as quickly as possible
    var findResult = results.some(function(result) {
      if (result.remaining.length === 0) {
        resultFound = true;
        finalResult = result;
      }
    });

    if (!resultFound)
      throw new Error('No result - parse incomplete/failed!');
    return finalResult.value;
  };


  var hasCompleteParse = function(results) {
    return results.some(function(result) {
      return result.remaining.length === 0;
    });
  };


  return {
    accepts: accepts,
    getFinalValue: getFinalValue,
    hasCompleteParse: hasCompleteParse
  };
});
