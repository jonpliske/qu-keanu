var midi = require('midi');

var input = new midi.input();
var output = new midi.output();

function openMidiIO (io, name) {
  for (var i = 0; i < output.getPortCount(); i++) {
    console.log(i, output.getPortName(i));
  };
}

input.on('message', function(deltaTime, message) {
  var hexed = message.map(function(raw) {
    return raw.toString(16);
  });
  console.log('m: ' + message.join(' ') + ' | d:' + deltaTime);
  console.log('m: ' + hexed.join(' ') + ' | d:' + deltaTime);
  console.log('---');
});

input.openPort(findMidiIO(input, 'QUNEO'));
output.openPort(findMidiIO(output, 'QUNEO'));

input.ignoreTypes(false, false, false);

function findMidiIO (io, name) {
  var ioName;

  for (var i = 0; i < io.getPortCount(); i++) {
    ioName = io.getPortName(i);
    if (ioName === name) {
      return i;
    }
  };
}


// TETHER ON
// 0 240 0 1 95 122 30 0 1 0 2 64 1 119 77 0 16 247
var sysexTetherOn = "240 0 1 95 122 30 0 1 0 2 64 1 119 77 0 16 247";
output.sendMessage(sysexTetherOn.split(' '));

// TETHER OFF
// 0 240 0 1 95 122 30 0 1 0 2 64 0 103 108 0 16 16 247
var sysexTetherOff = "240 0 1 95 122 30 0 1 0 2 64 0 103 108 0 16 16 247";

process.on('SIGINT', function(code) {
  input.closePort();

  output.sendMessage(sysexTetherOff.split(' '));
  output.closePort();

  process.kill();
});
