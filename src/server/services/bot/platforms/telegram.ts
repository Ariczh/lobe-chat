import debug from 'debug';

import { appEnv } from '@/envs/app';

import type { PlatformBot } from '../types';

const log = debug('lobe-server:bot:gateway:telegram');

export interface TelegramBotConfig {
  [key: string]: string | undefined;
  botToken: string;
  secretToken?: string;
  /** Optional HTTPS proxy URL for webhook (e.g. cloudflare tunnel for local dev) */
  webhookProxyUrl?: string;
}

/**
 * Extract the bot user ID from a Telegram bot token.
 * Telegram bot tokens have the format: `<bot_id>:<secret>`.
 */
function extractBotId(botToken: string): string {
  const colonIndex = botToken.indexOf(':');
  if (colonIndex === -1) return botToken;
  return botToken.slice(0, colonIndex);
}

export class Telegram implements PlatformBot {
  readonly platform = 'telegram';
  readonly applicationId: string;

  private config: TelegramBotConfig;
  private webhookSet = false;

  constructor(config: TelegramBotConfig) {
    this.config = config;
    this.applicationId = extractBotId(config.botToken);
  }

  async start(): Promise<void> {
    log('Starting TelegramBot appId=%s', this.applicationId);

    // Set the webhook URL so Telegram pushes updates to us.
    // Include applicationId in the path so the router can do a direct lookup
    // without iterating all registered bots.
    if (!this.webhookSet) {
      const baseUrl = (this.config.webhookProxyUrl || appEnv.APP_URL || '').replace(/\/$/, '');
      const webhookUrl = `${baseUrl}/api/agent/webhooks/telegram/${this.applicationId}`;
      await this.setWebhook(webhookUrl);
      this.webhookSet = true;
    }

    log('TelegramBot appId=%s started', this.applicationId);
  }

  async stop(): Promise<void> {
    log('Stopping TelegramBot appId=%s', this.applicationId);
    // Optionally remove the webhook on stop
    try {
      await this.deleteWebhook();
    } catch (error) {
      log('Failed to delete webhook for appId=%s: %O', this.applicationId, error);
    }
  }

  private async setWebhook(url: string): Promise<void> {
    const params: Record<string, string> = { url };
    if (this.config.secretToken) {
      params.secret_token = this.config.secretToken;
    }

    const response = await fetch(`https://api.telegram.org/bot${this.config.botToken}/setWebhook`, {
      body: JSON.stringify(params),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to set Telegram webhook: ${response.status} ${text}`);
    }

    log('TelegramBot appId=%s webhook set to %s', this.applicationId, url);
  }

  private async deleteWebhook(): Promise<void> {
    const response = await fetch(
      `https://api.telegram.org/bot${this.config.botToken}/deleteWebhook`,
      { method: 'POST' },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to delete Telegram webhook: ${response.status} ${text}`);
    }

    this.webhookSet = false;
    log('TelegramBot appId=%s webhook deleted', this.applicationId);
  }
}
