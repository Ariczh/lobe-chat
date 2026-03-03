#!/usr/bin/env bun

import { Command } from 'commander';

import { registerConnectCommand } from './commands/connect';
import { registerStatusCommand } from './commands/status';

const program = new Command();

program
  .name('device-cli')
  .description('LobeChat Device Gateway CLI - debug and test gateway connections')
  .version('0.1.0');

registerConnectCommand(program);
registerStatusCommand(program);

program.parse();
