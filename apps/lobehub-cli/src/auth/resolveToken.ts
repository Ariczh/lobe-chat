import { log } from '../utils/logger';
import { getValidToken } from './refresh';

interface ResolveTokenOptions {
  serviceToken?: string;
  token?: string;
  userId?: string;
}

interface ResolvedAuth {
  token: string;
  userId?: string;
}

/**
 * Resolve an access token from explicit options or stored credentials.
 * Exits the process if no token can be resolved.
 */
export async function resolveToken(options: ResolveTokenOptions): Promise<ResolvedAuth> {
  // Explicit token takes priority
  if (options.token) {
    return { token: options.token };
  }

  if (options.serviceToken) {
    if (!options.userId) {
      log.error('--user-id is required when using --service-token');
      process.exit(1);
    }
    return { token: options.serviceToken, userId: options.userId };
  }

  // Try stored credentials
  const result = await getValidToken();
  if (result) {
    log.debug('Using stored credentials');
    return { token: result.credentials.accessToken };
  }

  log.error("No authentication found. Run 'lh login' first, or provide --token.");
  process.exit(1);
}
