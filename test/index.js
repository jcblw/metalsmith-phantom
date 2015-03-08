var test = require('tape')
var Phantom = require('..')

test('the Phantom contructor', function (t) {
  t.equals(typeof Phantom({}), 'function', 'calling Phantom should return a function')
  t.equals(Phantom({ debug: true }) instanceof Phantom, true, 'calling Phantom with the key debug as true in the first argument will return an instance of Phantom')
  t.equals(typeof Phantom({ debug: true }).options, 'object', 'Phantom.options will be an object after calling the Phantom constructor')
  t.end()
}) // need moar test plz
