import { createHash } from 'crypto';
import { Address } from './common/address';
import { programFromParams, programFromPubKey } from './common/program';
import { RawSig, Transaction } from './core/transaction';
import { PrivateKey } from './crypto/privateKey';
import { PublicKey } from './crypto/publicKey';
import { Writer } from './utils/writer';

export class Wallet {
  privateKey: PrivateKey;
  publicKey: PublicKey;
  address: Address;

  constructor(privateKey: PrivateKey | string | Buffer) {
    if (privateKey instanceof PrivateKey) {
      this.privateKey = privateKey;
    } else {
      this.privateKey = new PrivateKey(privateKey);
    }

    this.publicKey = this.privateKey.getPublicKey();
    this.address = Address.fromPubKey(this.publicKey);
  }

  signTransaction(tx: Transaction) {
    const w = new Writer();
    tx.serialize(w);
    const bytes = w.getBytes();

    const sh1 = createHash('sha256');
    const sh2 = createHash('sha256');

    sh1.update(bytes);
    sh2.update(sh1.digest());
    const hash = sh2.digest();

    const signature = this.privateKey.sign(hash);

    const invokationSript = programFromParams([signature.serialize()]);
    const verificationScript = programFromPubKey(this.publicKey);

    const sig = new RawSig(invokationSript, verificationScript);
    tx.addSig(sig);
  }
}
