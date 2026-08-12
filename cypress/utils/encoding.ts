/**
 * demoblaze's frontend base64-encodes passwords before sending them to the
 * API (see b64EncodeUnicode in the site's js/index.js). API-level tests must
 * apply the same encoding, mirrored here exactly.
 */
export function encodePassword(plainPassword: string): string {
  return btoa(
    encodeURIComponent(plainPassword).replace(/%([0-9A-F]{2})/g, (_match, hex: string) =>
      String.fromCharCode(parseInt(hex, 16)),
    ),
  );
}
