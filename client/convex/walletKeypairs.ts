/**
 * walletKeypairs.ts — Solana removed stub
 *
 * Solana has been removed from the project. These stubs replace the old
 * keypair generation so that dependent files continue to compile and deploy.
 * Wallet "addresses" are now just UUIDs used as unique identifiers.
 */

/** Generate a unique identifier to use as a wallet address (no Solana). */
export function generateKeypair(): {
  publicKey: string;
  secretKey: string;
} {
  const id = crypto.randomUUID();
  return {
    publicKey: `wallet_${id}`,
    secretKey: '', // No real key — Solana removed
  };
}

/** No-op — encryption removed along with Solana. */
export function encryptSecretKey(secretKey: string): string {
  return secretKey;
}

/** No-op — decryption removed along with Solana. */
export function decryptSecretKey(encryptedKey: string): string {
  return encryptedKey;
}
