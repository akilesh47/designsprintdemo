# [![Build Status](https://travis-ci.org/thesolarnomad/lora-serialization.svg?branch=master)](https://travis-ci.org/thesolarnomad/lora-serialization) LoRaWAN serialization/deserialization library for The Things Network

This fully unit-tested library allows you to encode your data on the Arduino site and decode it on the [TTN](https://staging.thethingsnetwork.org/) side. It provides both a C-based encoder and a JavaScript-based decoder.

## In short

Arduino side:
```cpp
#include "LoraMessage.h"
LoraMessage message;

message
    .addUnixtime(1467632413)
    .addLatLng(-33.905052, 151.26641);

lora_send_bytes(message.getBytes(), message.getLength());
delete message;
```
TTN side:
```javascript
// include src/decoder.js
var json = decode(bytes, [unixtime, latLng], ['time', 'coords']);
```

## Usage

### Unix time (4 bytes)
Serializes/deserializes a unix time (seconds)

```cpp
byte buffer[4];
LoraEncoder encoder(buffer);
encoder.writeUnixtime(1467632413);
// buffer == {0x1d, 0x4b, 0x7a, 0x57}
```
and then in the TTN frontend, use the following method:

```javascript
unixtime(bytes.slice(x, x + 4)) // 1467632413
```

### GPS coordinates (8 bytes)
Serializes/deserializes coordinates (latitude/longitude) with a precision of 6 decimals.

```cpp
byte buffer[8];
LoraEncoder encoder(buffer);
encoder.writeLatLng(-33.905052, 151.26641);
// buffer == {0x64, 0xa6, 0xfa, 0xfd, 0x6a, 0x24, 0x04, 0x09}
```
and then in the TTN frontend, use the following method:

```javascript
latLng(bytes.slice(x, x + 8)) // [-33.905052, 151.26641]
```

### Unsigned 8bit Integer (1 byte)
Serializes/deserializes an unsigned 8bit integer.

```cpp
byte buffer[1];
LoraEncoder encoder(buffer);
uint8_t i = 10;
encoder.writeUint8(i);
// buffer == {0x0A}
```
and then in the TTN frontend, use the following method:

```javascript
uint8(bytes.slice(x, x + 1)) // 10
```

### Unsigned 16bit Integer (2 bytes)
Serializes/deserializes an unsigned 16bit integer.

```cpp
byte buffer[2];
LoraEncoder encoder(buffer);
uint16_t i = 23453;
encoder.writeUint16(i);
// buffer == {0x9d, 0x5b}
```
and then in the TTN frontend, use the following method:

```javascript
uint16(bytes.slice(x, x + 2)) // 23453
```

### Temperature (2 bytes)
Serializes/deserializes a temperature reading between -327.68 and +327.67 (inclusive) with a precision of 2 decimals.

```cpp
byte buffer[2];
LoraEncoder encoder(buffer);
encoder.writeTemperature(-123.45);
// buffer == {0x39, 0x30}
```
and then in the TTN frontend, use the following method:

```javascript
temp(bytes.slice(x, x + 2)) // -123.45
```

### Humidity (2 bytes)
Serializes/deserializes a humidity reading between 0 and 100 (inclusive) with a precision of 2 decimals.

```cpp
byte buffer[2];
LoraEncoder encoder(buffer);
encoder.writeHumidity(99.99);
// buffer == {0x0f, 0x27}
```
and then in the TTN frontend, use the following method:

```javascript
humidity(bytes.slice(x, x + 2)) // 99.99
```

## Composition

### On the Arduino side
The decoder allows you to write more than one value to a byte array:
```cpp
byte buffer[19];
LoraEncoder encoder(buffer);

encoder.writeUnixtime(1467632413);
encoder.writeLatLng(-33.905052, 151.26641);
encoder.writeUint8(10);
encoder.writeUint16(23453);
encoder.writeTemperature(80.12);
encoder.writeHumidity(99.99);
/* buffer == {
    0x1d, 0x4b, 0x7a, 0x57, // Unixtime
    0x64, 0xa6, 0xfa, 0xfd, 0x6a, 0x24, 0x04, 0x09, // latitude,longitude
    0x0A, // Uint8
    0x9d, 0x5b, // Uint16
    0x4c, 0x1f, // temperature
    0x0f, 0x27 // humidity
}
*/
```

#### Convenience class `LoraMessage`
There is a convenience class that represents a LoraMessage that you can add readings to:
```cpp
LoraMessage message;

message
    .addUnixtime(1467632413)
    .addLatLng(-33.905052, 151.26641)
    .addUint8(10)
    .addUint16(23453)
    .addTemperature(80.12)
    .addHumidity(99.99);

send(message.getBytes(), message.getLength());
/*
getBytes() == {
    0x1d, 0x4b, 0x7a, 0x57, // Unixtime
    0x64, 0xa6, 0xfa, 0xfd, 0x6a, 0x24, 0x04, 0x09, // latitude,longitude
    0x0A, // Uint8
    0x9d, 0x5b, // Uint16
    0x4c, 0x1f, // temperature
    0x0f, 0x27, // humidity
}
and
getLength() == 19
*/
```

### Composition in the TTN decoder frontend with the `decode` method

The `decode` method allows you to specify a mask for the incoming byte buffer (that was generated by this library) and apply decoding functions accordingly.

```javascript
decode(byte Array, mask Array [,mapping Array])
```

#### Example
Paste everything from `src/decoder.js` into the decoder method and use like this:

```javascript
function (bytes) {
    // code from src/decoder.js here
    return decode(bytes, [latLng, unixtime], ['coords', 'time']);
}
```
This maps the incoming byte buffer of 12 bytes to a sequence of one `latLng` (8 bytes) and one `unixtime` (4 bytes) sequence and maps the first one to a key `coords` and the second to a key `time`.

You can use: `64 A6 FA FD 6A 24 04 09 1D 4B 7A 57` for testing, and it will result in:

```json
{
  "coords": [
    -33.905052,
    151.26641
  ],
  "time": 1467632413
}
```

## Development

* Run the unit tests (C) via `cd test && make clean all test`
* Run the unit tests (JavaScript) via `npm test`

The CI will kick off once you create a pull request automatically.
# designsprintdemo