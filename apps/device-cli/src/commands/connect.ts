import os from 'node:os';

import type { ToolCallRequestMessage } from '@lobechat/device-gateway-client';
import { GatewayClient } from '@lobechat/device-gateway-client';
import type { Command } from 'commander';

import { executeToolCall } from '../tools';
import { cleanupAllProcesses } from '../tools/shell';
import { log, setVerbose } from '../utils/logger';

interface ConnectOptions {
  deviceId?: string;
  gateway?: string;
  serviceToken?: string;
  token?: string;
  userId?: string;
  verbose?: boolean;
}

export function registerConnectCommand(program: Command) {
  program
    .command('connect')
    .description('Connect to the device gateway and listen for tool calls')
    .option('--token <jwt>', 'JWT access token')
    .option('--service-token <token>', 'Service token (requires --user-id)')
    .option('--user-id <id>', 'User ID (required with --service-token)')
    .option('--gateway <url>', 'Gateway URL', 'https://device-gateway.lobehub.com')
    .option('--device-id <id>', 'Device ID (auto-generated if not provided)')
    .option('-v, --verbose', 'Enable verbose logging')
    .action(async (options: ConnectOptions) => {
      if (options.verbose) setVerbose(true);

      // Validate auth options
      if (!options.token && !options.serviceToken) {
        log.error('Either --token or --service-token is required');
        process.exit(1);
      }
      if (options.serviceToken && !options.userId) {
        log.error('--user-id is required when using --service-token');
        process.exit(1);
      }

      const token = options.token || options.serviceToken!;

      const client = new GatewayClient({
        deviceId: options.deviceId,
        gatewayUrl: options.gateway,
        logger: log,
        token,
        userId: options.serviceToken ? options.userId : undefined,
      });

      // Print device info
      log.info('─── Device CLI ───');
      log.info(`  Device ID : ${client.currentDeviceId}`);
      log.info(`  Hostname  : ${os.hostname()}`);
      log.info(`  Platform  : ${process.platform}`);
      log.info(`  Gateway   : ${options.gateway || 'https://device-gateway.lobehub.com'}`);
      log.info(`  Auth      : ${options.serviceToken ? 'service-token' : 'jwt'}`);
      log.info('──────────────────');

      // Handle tool call requests
      client.on('tool_call_request', async (request: ToolCallRequestMessage) => {
        const { requestId, toolCall } = request;
        log.toolCall(toolCall.apiName, requestId, toolCall.arguments);

        const result = await executeToolCall(toolCall.apiName, toolCall.arguments);
        log.toolResult(requestId, result.success, result.content);

        client.sendToolCallResponse({
          requestId,
          result: {
            content: result.content,
            error: result.error,
            success: result.success,
          },
        });
      });

      // Handle auth expired
      client.on('auth_expired', () => {
        log.error('Authentication expired. Please provide a new token.');
        cleanup();
        process.exit(1);
      });

      // Handle errors
      client.on('error', (error) => {
        log.error(`Connection error: ${error.message}`);
      });

      // Graceful shutdown
      const cleanup = () => {
        log.info('Shutting down...');
        cleanupAllProcesses();
        client.disconnect();
      };

      process.on('SIGINT', () => {
        cleanup();
        process.exit(0);
      });

      process.on('SIGTERM', () => {
        cleanup();
        process.exit(0);
      });

      // Connect
      await client.connect();
    });
}
