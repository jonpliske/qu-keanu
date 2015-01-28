var midi = require('midi');

var input = new midi.input();
var output = new midi.output();

var CHAN_1_CC = 176;
var CHAN_2_CC = 177;

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

// DIRECT LED TOGGLE
// 240 0 1 95 122 30 0 1 0 2 80 3 84 124 0 16 247
var sysexToggleDirectLED = "240 0 1 95 122 30 0 1 0 2 80 3 84 124 0 16 247";
output.sendMessage(sysexToggleDirectLED.split(' '));


process.on('SIGINT', function(code) {
  input.closePort();

  output.sendMessage(sysexToggleDirectLED.split(' '));
  output.sendMessage(sysexTetherOff.split(' '));
  output.closePort();

  process.kill();
});


var GRID_ROWS = [
  [[0, 4], [1, 5], [8, 12], [9, 13] [16, 20], [17, 21], [24, 28], [25, 29]]
];

var rows = [];
for (var i = 0; i <= 96; i += 32) {
  var rowNum = i / 32;
  var topRowStartRed = i;
  var bottomRowStartRed = i + 2;
  var topRowStartGreen = i + 4;
  var bottomRowStartGreen = i + 5;

  rows[rowNum] = [];
  for (var x = topRowStartRed; x <= topRowStartRed + 25; x += 8) {
    // console.log(x, x + 4);
    // console.log(x + 1, x + 5);

    rows[rowNum].push([x, x + 4]);
    rows[rowNum].push([x + 1, x + 5]);
  };

  // console.log('------');

  rows[rowNum + 1] = [];
  for (var x = bottomRowStartRed; x <= bottomRowStartRed + 25; x += 8) {
    // console.log(x, x + 4);
    // console.log(x + 1, x + 5);

    rows[rowNum + 1].push([x, x + 4]);
    rows[rowNum + 1].push([x + 1, x + 5]);
  };

  // console.log('------');
};

// console.log(rows);

for (var i = 0; i < rows.length; i++) {
  console.log(i);
  for (var x = 0; x < rows[i].length; x++) {
    var r = rows[i][x][0], g = rows[i][x][1];
    process.stdout.write(JSON.stringify([CHAN_1_CC, r, 16]));
    process.stdout.write(JSON.stringify([CHAN_1_CC, g, 16]));
    console.log('');
    // output.sendMessage([CHAN_1_CC, r, 16]);
    // output.sendMessage([CHAN_1_CC, g, 16]);
    // rows[i][x]
  };
};
