import { GatewayClient } from '@lobechat/device-gateway-client';
import type { Command } from 'commander';

import { log, setVerbose } from '../utils/logger';

interface StatusOptions {
  gateway?: string;
  serviceToken?: string;
  timeout?: string;
  token?: string;
  userId?: string;
  verbose?: boolean;
}

export function registerStatusCommand(program: Command) {
  program
    .command('status')
    .description('Check if gateway connection can be established')
    .option('--token <jwt>', 'JWT access token')
    .option('--service-token <token>', 'Service token (requires --user-id)')
    .option('--user-id <id>', 'User ID (required with --service-token)')
    .option('--gateway <url>', 'Gateway URL', 'https://device-gateway.lobehub.com')
    .option('--timeout <ms>', 'Connection timeout in ms', '10000')
    .option('-v, --verbose', 'Enable verbose logging')
    .action(async (options: StatusOptions) => {
      if (options.verbose) setVerbose(true);

      if (!options.token && !options.serviceToken) {
        log.error('Either --token or --service-token is required');
        process.exit(1);
      }
      if (options.serviceToken && !options.userId) {
        log.error('--user-id is required when using --service-token');
        process.exit(1);
      }

      const token = options.token || options.serviceToken!;
      const timeout = Number.parseInt(options.timeout || '10000', 10);

      const client = new GatewayClient({
        gatewayUrl: options.gateway,
        logger: log,
        token,
        userId: options.serviceToken ? options.userId : undefined,
      });

      const timer = setTimeout(() => {
        log.error('FAILED - Connection timed out');
        client.disconnect();
        process.exit(1);
      }, timeout);

      client.on('connected', () => {
        clearTimeout(timer);
        log.info('CONNECTED');
        client.disconnect();
        process.exit(0);
      });

      client.on('auth_expired', () => {
        clearTimeout(timer);
        log.error('FAILED - Authentication expired');
        client.disconnect();
        process.exit(1);
      });

      client.on('error', (error) => {
        clearTimeout(timer);
        log.error(`FAILED - ${error.message}`);
        client.disconnect();
        process.exit(1);
      });

      await client.connect();
    });
}
