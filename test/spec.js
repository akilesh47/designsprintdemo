const path = require('path');
const chai = require('chai');
const decoder = require(path.join(__dirname, '..', 'src', 'decoder.js'));

const expect = chai.expect;
chai.should();

describe('Decoder', () => {
    const unixtimeBytes = new Buffer([0x1d, 0x4b, 0x7a, 0x57]);
    const unixtime = 1467632413;

    describe('unixtime', () => {
        it('should yell at you if the buffer is omitted', () => {
            expect(() => decoder.unixtime()).to.throw;
        });
        it('should yell at you if the buffer size is incorrect', () => {
            expect(() => decoder.unixtime(new Buffer(2))).to.throw;
        });
        it('should be possible to decode a unixtime', () => {
            decoder
                .unixtime(unixtimeBytes)
                .should.be.equal(unixtime);
        });
    });

    const latLngBytes = new Buffer([0x64, 0xa6, 0xfa, 0xfd, 0x6a, 0x24, 0x04, 0x09]);
    const latLng = [-33.905052, 151.26641];

    describe('latLng', () => {
        it('should yell at you if the buffer is omitted', () => {
            expect(() => decoder.latLng()).to.throw;
        });
        it('should yell at you if the buffer size is incorrect', () => {
            expect(() => decoder.latLng(new Buffer(9))).to.throw;
        });
        it('should be possible to decode a coordinate', () => {
            decoder
                .latLng(latLngBytes)
                .should.be.deep.equal(latLng);
        });
    });

    const uint16Bytes = new Buffer([0x9d, 0x5b]);
    const uint16 = 23453;

    describe('uint16', () => {
        it('should yell at you if the buffer is omitted', () => {
            expect(() => decoder.uint16()).to.throw;
        });
        it('should yell at you if the buffer size is incorrect', () => {
            expect(() => decoder.uint16(new Buffer(1))).to.throw;
        });
        it('should be possible to decode an int', () => {
            decoder
                .uint16(uint16Bytes)
                .should.be.equal(uint16);
        });
    });

    const uint8Bytes = new Buffer([0xFF]);
    const uint8 = 255;

    describe('uint8', () => {
        it('should yell at you if the buffer is omitted', () => {
            expect(() => decoder.uint8()).to.throw;
        });
        it('should yell at you if the buffer size is incorrect', () => {
            expect(() => decoder.uint8(new Buffer(2))).to.throw;
        });
        it('should be possible to decode an int', () => {
            decoder
                .uint8(uint8Bytes)
                .should.be.equal(uint8);
        });
    });

    const tempBytes = new Buffer([0x4c, 0x1f]);
    const temp = 80.12;

    describe('temp', () => {
        it('should yell at you if the buffer is omitted', () => {
            expect(() => decoder.temp()).to.throw;
        });
        it('should yell at you if the buffer size is incorrect', () => {
            expect(() => decoder.temp(new Buffer(1))).to.throw;
        });
        it('should be possible to decode a temperature', () => {
            decoder
                .temp(tempBytes)
                .should.be.equal(temp);
        });

        it('should be possible to decode a negative temperature', () => {
            decoder
                .temp(new Buffer([0x39, 0x30]))
                .should.be.equal(-123.45);
        });
    });

    const humidityBytes = new Buffer([0x0f, 0x27]);
    const humidity = 99.99;

    describe('humidity', () => {
        it('should yell at you if the buffer is omitted', () => {
            expect(() => decoder.humidity()).to.throw;
        });
        it('should yell at you if the buffer size is incorrect', () => {
            expect(() => decoder.humidity(new Buffer(1))).to.throw;
        });
        it('should be possible to decode a humidity', () => {
            decoder
                .humidity(humidityBytes)
                .should.be.equal(humidity);
        });
    });

    describe('decode', () => {
        it('should be able to compose decoder functions', () => {
            decoder
                .decode(
                    Buffer.concat([
                        latLngBytes,
                        unixtimeBytes,
                        uint16Bytes,
                        tempBytes,
                        uint8Bytes,
                        humidityBytes
                    ]),
                    [
                        decoder.latLng,
                        decoder.unixtime,
                        decoder.uint16,
                        decoder.temp,
                        decoder.uint8,
                        decoder.humidity
                    ]
                )
                .should.be.deep.equal({
                    0: latLng,
                    1: unixtime,
                    2: uint16,
                    3: temp,
                    4: uint8,
                    5: humidity
                });
        });

        it('should yell at you if mask is longer than input', () => {
            expect(() => decoder.decode(new Buffer(7), [latLng])).to.throw;
        });

        it('should be able to take names', () => {
            decoder
                .decode(unixtimeBytes, [decoder.unixtime], ['time'])
                .should.be.deep.equal({
                    time: unixtime
                });
        });
    });
});
