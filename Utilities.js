define([], function() {
  "use strict";


  var accepts = function(parser, input) {
    return hasCompleteParse(parser(input));
  };


  var containsResult = function(needle, results) {
    return results.some(function(result) {
      return result.equals(needle);
    });
  };


  var equalsArray = function(l, r) {
    if (!Array.isArray(l) || !Array.isArray(r))
      return false;

    if (l.length !== r.length)
      return false;

    for (var i = 0, len = l.length; i < len; i++) {
      var left = l[i];
      var right = r[i];

      var equal = Array.isArray(left) ? equalsArray(left, right) : left === right;
      if (!equal)
        return false;
    }

    return true;
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
    containsResult: containsResult,
    equalsArray: equalsArray,
    getFinalValue: getFinalValue,
    hasCompleteParse: hasCompleteParse
  };
});
