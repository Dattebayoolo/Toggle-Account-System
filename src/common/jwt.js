import crypto from 'node:crypto';
import {
  exportJWK,
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

export async function signAccessToken({ userId, email, audience, scope = '' }) {
  const privateKey = await getPrivateKey();

  const claims = { email };
  if (scope) {
    claims.scope = scope;
  }

  return new SignJWT(claims)
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

/**
 * Public key set for verifiers. Includes the active signing key plus any
 * previous keys (JWT_PREVIOUS_PUBLIC_KEYS) so tokens issued before a
 * rotation remain verifiable until they expire.
 */
export async function getJwks() {
  const keys = [];

  const activeJwk = await exportJWK(await getPublicKey());
  keys.push({
    ...activeJwk,
    kid: config.jwtKeyId,
    use: 'sig',
    alg: algorithm
  });

  for (const previous of config.jwtPreviousPublicKeys || []) {
    if (!previous?.kid || !previous?.pem) {
      continue;
    }

    try {
      const jwk = await exportJWK(await importSPKI(previous.pem, algorithm));
      keys.push({ ...jwk, kid: previous.kid, use: 'sig', alg: algorithm });
    } catch (_error) {
      // Skip malformed previous keys instead of breaking the whole set.
    }
  }

  return { keys };
}
