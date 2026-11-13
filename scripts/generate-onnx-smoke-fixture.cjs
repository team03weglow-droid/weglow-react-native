// Minimal ONNX protobuf encoder; no generator/runtime dependency is required.
// Model: float32[3] Y = Add(X, bias), bias = [1, 2, 3], opset 13 / IR 8.
/* global __dirname */
const { Buffer } = require('node:buffer');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function varint(value) {
  const bytes = [];
  do {
    bytes.push((value & 127) | (value > 127 ? 128 : 0));
    value >>>= 7;
  } while (value);
  return Buffer.from(bytes);
}
const integer = (field, value) =>
  Buffer.concat([varint(field * 8), varint(value)]);
const message = (field, value) => {
  const bytes = Buffer.from(value);
  return Buffer.concat([varint(field * 8 + 2), varint(bytes.length), bytes]);
};
const join = (...parts) => Buffer.concat(parts);
const valueInfo = (name) =>
  join(
    message(1, name),
    message(
      2,
      message(1, join(integer(1, 1), message(2, message(1, integer(1, 3))))),
    ),
  );
const bias = Buffer.alloc(12);
[1, 2, 3].forEach((value, index) => bias.writeFloatLE(value, index * 4));
const graph = join(
  message(
    1,
    join(
      message(1, 'X'),
      message(1, 'bias'),
      message(2, 'Y'),
      message(4, 'Add'),
    ),
  ),
  message(2, 'weglow_smoke_add'),
  message(
    5,
    join(integer(1, 3), integer(2, 1), message(8, 'bias'), message(9, bias)),
  ),
  message(11, valueInfo('X')),
  message(12, valueInfo('Y')),
);
const model = join(
  integer(1, 8),
  message(2, 'weglow-dev-smoke'),
  message(7, graph),
  message(8, integer(2, 13)),
);
const directory = path.resolve(__dirname, '../src/dev/onnx-smoke');
fs.mkdirSync(directory, { recursive: true });
fs.writeFileSync(path.join(directory, 'add-bias.onnx'), model);
fs.writeFileSync(
  path.join(directory, 'fixture.json'),
  JSON.stringify(
    {
      sha256: crypto.createHash('sha256').update(model).digest('hex'),
      bytes: [...model],
    },
    null,
    2,
  ) + '\n',
);
console.log(`Generated ${model.length}-byte ONNX fixture.`);
