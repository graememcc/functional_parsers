// Mocha and requirejs define don't play well together.
// Thanks to rcjara for this hack!
// http://rcjara.github.io/programming/2013/05/14/requirejs-mocha-hack/
describe('Some hacky nonsense', function() {
  it('enables the tests to run with requirejs', function(done) {
    setTimeout(done, 10);
  });
});
