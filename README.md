# NMMES-module-checksum

A checksum module for nmmes-backend.

## Dependencies

- [nmmes-backend](https://github.com/NMMES/nmmes-backend) - Required in order to run this module.

### Installation
[![NPM](https://nodei.co/npm/nmmes-module-checksum.png?compact=true)](https://nodei.co/npm/nmmes-module-checksum/)

## Options

The `--algo` option selects the cyclic redundancy check algorithm used to generate the hash.

Type: String<br>
Default: crc32c

---

The `--format` option defines the format for the output filename.

Type: String<br>
Default: {name}-[{hash}]{ext}

---
