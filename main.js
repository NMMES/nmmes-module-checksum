'use strict';

const nmmes = require('nmmes-backend');
const Path = require('path');
const fs = require('fs-extra');
const crc = require('crc');

module.exports = class Checksum extends nmmes.Module {
    constructor(args, logger) {
        super(require('./package.json'), logger);

        this.options = Object.assign(nmmes.Module.defaults(Checksum), args);
    }
    async executable(map) {
        let _self = this;
        const options = this.options;

        let parsed = Path.parse(this.video.output.path);
        parsed.base = options.format;
        let output = Path.format(parsed);
        let stream = fs.createReadStream(this.video.output.path);
        this.logger.trace(`Calculating ${options.algo}...`);
        parsed.hash = await new Promise((resolve, reject) => {

            switch (options.algo) {
                case 'crc32c':
                    {
                        const crc32c = require('sse4_crc32');
                        let digest = new crc32c.CRC32();
                        stream
                        .on('error', err => {
                            return reject(err);
                        }).on('data', chunk => {
                            digest.update(chunk);
                        }).on('end', async () => {
                            return resolve(digest.crc().toString(16).toUpperCase());
                        });
                        break;
                    }
                case 'crc1':
                case 'crc8':
                case 'crc16':
                case 'crc24':
                case 'crc32':
                case 'crcjam':
                    {
                        let value = '';
                        stream
                        .on('error', err => {
                            return reject(err);
                        }).on('data', chunk => {
                            value = crc[options.algo](chunk, value);
                        }).on('end', async () => {
                            return resolve(value.toString(16).toUpperCase());
                        });
                        break;
                    }
                default:
                    return reject(new Error(`Invalid checksum algorithm`));
            }
        });
        this.logger.debug(`${options.algo} calculated to: ${parsed.hash}`);
        for (let [key, value] of Object.entries(parsed)) {
            output = output.replace(`{${key}}`, value);
        }
        await fsmove(this.video.output.path, output);
        this.video.output = Path.parse(output);
        this.video.output.path = output;
        return {};
    };
    static options() {
        return {
            'algo': {
                default: 'crc32c',
                describe: 'Algorithm to hash with.',
                choices: ['crc32c', 'crc1', 'crc8', 'crc16', 'crc24', 'crc32', 'crcjam'],
                type: 'string',
                group: 'Advanced:'
            },
            'format': {
                default: '{name}-[{hash}]{ext}',
                describe: 'The file name format for the output file.',
                type: 'string',
                group: 'Advanced:'
            }
        };
    }
}
