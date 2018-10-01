import { readFileSync } from 'fs';

export function loadContract(path: string) {
  return readFileSync(path);
}

export function loadAVMContract(path: string) {
  const codeBuffer = readFileSync(path);
  const codeString = codeBuffer.toString();
  return new Buffer(codeString, 'hex');
}
