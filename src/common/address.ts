import * as base58 from 'bs58';
import { PublicKey } from '../crypto/publicKey';
import { Reader } from '../utils/reader';
import { Writer } from '../utils/writer';
import { programFromPubKey } from './program';
import { md160, sha256 } from './utils';

const ADDR_LEN = 20;

export class Address {
  static parseFromBytes(b: Buffer): Address {
    const r = new Reader(b);
    const a = new Address();
    a.deserialize(r);

    return a;
  }

  static parseFromVmCode(code: Buffer): Address {
    return new Address(md160(sha256(code)));
  }

  static fromPubKey(key: PublicKey): Address {
    const prog = programFromPubKey(key);

    return Address.parseFromVmCode(prog);
  }

  static fromBase58(encoded: string): Address {
    const decoded = base58.decode(encoded);
    const hexDecoded = new Buffer(decoded).slice(1, 20 + 1);

    const address = new Address(hexDecoded);

    if (encoded !== address.toBase58()) {
      throw new Error('[Address.fromBase58] decode encoded verify failed');
    }
    return address;
  }

  private value: Buffer;

  constructor(value: Buffer | string = '0000000000000000000000000000000000000000') {
    if (typeof value === 'string') {
      this.value = new Buffer(value, 'hex');
    } else {
      this.value = value;
    }
  }

  equals(other: Address): boolean {
    return this.value.equals(other.value);
  }

  serialize(w: Writer) {
    w.writeBytes(this.value);
  }

  deserialize(r: Reader) {
    try {
      this.value = r.readBytes(ADDR_LEN);
    } catch (e) {
      throw new Error('deserialize Uint256 error');
    }
  }

  toArray() {
    const buffer = new Buffer(this.value.length);
    this.value.copy(buffer);
    return buffer;
  }

  toBase58(): string {
    const data = Buffer.concat([new Buffer('17', 'hex'), this.value]);
    const hash = sha256(data);
    const hash2 = sha256(hash);
    const checksum = hash2.slice(0, 4);

    const datas = Buffer.concat([data, checksum]);

    return base58.encode(datas);
  }
}
