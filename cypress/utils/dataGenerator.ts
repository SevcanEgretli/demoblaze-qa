import type { UserCredentials } from '../types/models';

/**
 * Test-data generators. Demoblaze rejects duplicate usernames and has no
 * account cleanup API, so sign-up tests must generate a unique user per run.
 */
export function generateUniqueUser(prefix = 'qa_user'): UserCredentials {
  const uniqueSuffix = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  return {
    username: `${prefix}_${uniqueSuffix}`,
    password: `Pw_${uniqueSuffix}!`,
  };
}
