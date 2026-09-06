import crypto from 'node:crypto';
import {
  importPKCS8,
  importSPKI,
  jwtVerify,
  SignJWT
} from 'jose';

import { config } from './config.js';

const algorithm = 'RS256';

let privateKeyPromise;
let publicKeyPromise;

function getPrivateKey() {
  if (!privateKeyPromise) {
    privateKeyPromise = importPKCS8(config.jwtPrivateKeyPem, algorithm);
  }
  return privateKeyPromise;
}

function getPublicKey() {
  if (!publicKeyPromise) {
    publicKeyPromise = importSPKI(config.jwtPublicKeyPem, algorithm);
  }
  return publicKeyPromise;
}

export async function signAccessToken({ userId, email, audience }) {
  const privateKey = await getPrivateKey();

  return new SignJWT({ email })
    .setProtectedHeader({ alg: algorithm, kid: config.jwtKeyId })
    .setIssuer(config.jwtIssuer)
    .setSubject(userId)
    .setAudience(audience)
    .setJti(crypto.randomUUID())
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(privateKey);
}

export async function verifyAccessToken(token, audience) {
  const publicKey = await getPublicKey();

  const { payload, protectedHeader } = await jwtVerify(token, publicKey, {
    issuer: config.jwtIssuer,
    audience
  });

  return { payload, protectedHeader };
}
