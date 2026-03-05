import type { Command } from 'commander';

import { FileSnapshotStore } from '../store/file-store';
import type { ExecutionSnapshot, StepSnapshot } from '../types';
import {
  renderDiff,
  renderEnvContext,
  renderMessageDetail,
  renderSnapshot,
  renderStepDetail,
  renderSystemRole,
} from '../viewer';

function findStep(snapshot: ExecutionSnapshot, stepIndex: number): StepSnapshot {
  const step = snapshot.steps.find((s) => s.stepIndex === stepIndex);
  if (!step) {
    console.error(
      `Step ${stepIndex} not found. Available: ${snapshot.steps.map((s) => s.stepIndex).join(', ')}`,
    );
    process.exit(1);
  }
  return step;
}

function getSystemRole(step: StepSnapshot): string | undefined {
  const ceEvent = step.events?.find((e) => e.type === 'context_engine_result') as any;
  const inputRole = ceEvent?.input?.systemRole;
  if (inputRole) return inputRole;
  const outputMsgs = ceEvent?.output as any[] | undefined;
  const systemMsg = outputMsgs?.find((m: any) => m.role === 'system');
  if (!systemMsg) return undefined;
  return typeof systemMsg.content === 'string'
    ? systemMsg.content
    : JSON.stringify(systemMsg.content, null, 2);
}

function getEnvContent(step: StepSnapshot): string | undefined {
  const ceEvent = step.events?.find((e) => e.type === 'context_engine_result') as any;
  const outputMsgs = ceEvent?.output as any[] | undefined;
  const envMsg = outputMsgs?.find((m: any) => m.role === 'user');
  if (!envMsg) return undefined;
  return typeof envMsg.content === 'string'
    ? envMsg.content
    : JSON.stringify(envMsg.content, null, 2);
}

export function registerInspectCommand(program: Command) {
  program
    .command('inspect')
    .description('Inspect trace details')
    .argument('<traceId>', 'Trace ID to inspect')
    .option('-s, --step <n>', 'View specific step (default: 0 for -r/--env)')
    .option('-m, --messages', 'Show messages context')
    .option('-t, --tools', 'Show tool call details')
    .option('-e, --events', 'Show raw events (llm_start, llm_result, etc.)')
    .option('-c, --context', 'Show runtime context & payload')
    .option(
      '--msg <n>',
      'Show full content of message [N] from Final LLM Payload (use with --step)',
    )
    .option(
      '--msg-input <n>',
      'Show full content of message [N] from Context Engine Input (use with --step)',
    )
    .option('-r, --system-role', 'Show full system role content (default step 0)')
    .option('--env', 'Show environment context (default step 0)')
    .option('-d, --diff <n>', 'Diff against step N (use with -r or --env)')
    .option('-j, --json', 'Output as JSON')
    .action(
      async (
        traceId: string,
        opts: {
          context?: boolean;
          diff?: string;
          env?: boolean;
          events?: boolean;
          json?: boolean;
          messages?: boolean;
          msg?: string;
          msgInput?: string;
          step?: string;
          systemRole?: boolean;
          tools?: boolean;
        },
      ) => {
        const store = new FileSnapshotStore();
        const snapshot = await store.get(traceId);
        if (!snapshot) {
          console.error(`Snapshot not found: ${traceId}`);
          process.exit(1);
        }

        const stepIndex = opts.step !== undefined ? Number.parseInt(opts.step, 10) : undefined;

        // -r / --env default to step 0
        const effectiveStepIndex = stepIndex ?? (opts.systemRole || opts.env ? 0 : undefined);

        // --diff requires -r or --env
        if (opts.diff !== undefined && !opts.systemRole && !opts.env) {
          console.error('--diff requires -r or --env.');
          process.exit(1);
        }

        // --diff mode
        if (opts.diff !== undefined && effectiveStepIndex !== undefined) {
          const diffStepIndex = Number.parseInt(opts.diff, 10);
          const stepA = findStep(snapshot, effectiveStepIndex);
          const stepB = findStep(snapshot, diffStepIndex);
          const label = opts.systemRole ? 'System Role' : 'Environment Context';
          const contentA = opts.systemRole ? getSystemRole(stepA) : getEnvContent(stepA);
          const contentB = opts.systemRole ? getSystemRole(stepB) : getEnvContent(stepB);
          console.log(
            renderDiff(contentA ?? '', contentB ?? '', {
              labelA: `Step ${effectiveStepIndex}`,
              labelB: `Step ${diffStepIndex}`,
              title: label,
            }),
          );
          return;
        }

        // -r / --env view
        if ((opts.systemRole || opts.env) && effectiveStepIndex !== undefined) {
          const step = findStep(snapshot, effectiveStepIndex);
          if (opts.json) {
            if (opts.systemRole) {
              console.log(JSON.stringify(getSystemRole(step) ?? null, null, 2));
            } else {
              const ceEvent = step.events?.find((e) => e.type === 'context_engine_result') as any;
              const envMsg = (ceEvent?.output as any[])?.find((m: any) => m.role === 'user');
              console.log(JSON.stringify(envMsg ?? null, null, 2));
            }
          } else {
            console.log(opts.systemRole ? renderSystemRole(step) : renderEnvContext(step));
          }
          return;
        }

        if (opts.json) {
          if (stepIndex !== undefined) {
            const step = findStep(snapshot, stepIndex);
            console.log(JSON.stringify(step, null, 2));
          } else {
            console.log(JSON.stringify(snapshot, null, 2));
          }
          return;
        }

        // --msg or --msg-input: show full message detail
        const msgIndex =
          opts.msg !== undefined
            ? Number.parseInt(opts.msg, 10)
            : opts.msgInput !== undefined
              ? Number.parseInt(opts.msgInput, 10)
              : undefined;
        const msgSource: 'input' | 'output' = opts.msgInput !== undefined ? 'input' : 'output';

        if (stepIndex !== undefined) {
          const step = findStep(snapshot, stepIndex);

          if (msgIndex !== undefined) {
            console.log(renderMessageDetail(step, msgIndex, msgSource));
            return;
          }

          console.log(
            renderStepDetail(step, {
              context: opts.context,
              events: opts.events,
              messages: opts.messages,
              tools: opts.tools,
            }),
          );
          return;
        }

        console.log(renderSnapshot(snapshot));
      },
    );
}
