import type { ExecutionSnapshot, SnapshotSummary, StepSnapshot } from '../types';

// ANSI color helpers
const dim = (s: string) => `\x1B[2m${s}\x1B[22m`;
const bold = (s: string) => `\x1B[1m${s}\x1B[22m`;
const green = (s: string) => `\x1B[32m${s}\x1B[39m`;
const red = (s: string) => `\x1B[31m${s}\x1B[39m`;
const yellow = (s: string) => `\x1B[33m${s}\x1B[39m`;
const cyan = (s: string) => `\x1B[36m${s}\x1B[39m`;
const magenta = (s: string) => `\x1B[35m${s}\x1B[39m`;
const blue = (s: string) => `\x1B[34m${s}\x1B[39m`;
const white = (s: string) => `\x1B[37m${s}\x1B[39m`;

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function formatCost(cost: number): string {
  if (cost === 0) return '$0';
  if (cost < 0.001) return `$${cost.toFixed(6)}`;
  return `$${cost.toFixed(4)}`;
}

function truncate(s: string, maxLen: number): string {
  const single = s.replaceAll('\n', ' ');
  if (single.length <= maxLen) return single;
  return single.slice(0, maxLen - 3) + '...';
}

function padEnd(s: string, len: number): string {
  if (s.length >= len) return s;
  return s + ' '.repeat(len - s.length);
}

// Application-defined structural XML tags — rendered in blue+bold
const STRUCTURAL_TAGS = new Set([
  'plugins',
  'collection',
  'collection.instructions',
  'available_tools',
  'api',
  'tool_usage_guidelines',
  'tool_selection_guidelines',
  'core_capabilities',
  'capabilities',
  'user_context',
  'session_context',
  'user_memory',
  'persona',
  'instruction',
  'guidelines',
  'tooling',
  'online-devices',
  'device',
  'security_and_privacy',
  'security_considerations',
  'workflow',
  'response_format',
  'response_expectations',
  'formatting_guardrails',
  'memory_layer_definitions',
  'memory_effort_policy',
]);

/**
 * Extract tag name from an XML tag string like `<foo>`, `</foo>`, `<foo attr="bar">`.
 */
function extractTagName(tag: string): string {
  const m = tag.match(/^<\/?(\w[\w.:-]*)/);
  return m ? m[1] : '';
}

/**
 * Format XML-structured content:
 * - Structural tags (app-defined) → blue + bold
 * - Other XML tags → white + bold
 * - Text inside XML elements → dim
 */
function formatXmlContent(text: string): string {
  const xmlTagRe = /<\/?[\w.:-]+(?:\s[^>]*)?\/?>/g;
  const lines = text.split('\n');
  let depth = 0;

  return lines
    .map((line) => {
      const tags = [...line.matchAll(xmlTagRe)];

      if (tags.length === 0) {
        return depth > 0 ? dim(line) : line;
      }

      let result = '';
      let lastIndex = 0;

      for (const match of tags) {
        const tag = match[0];
        const idx = match.index!;

        // Text before this tag
        if (idx > lastIndex) {
          const textBefore = line.slice(lastIndex, idx);
          result += depth > 0 ? dim(textBefore) : textBefore;
        }

        const tagName = extractTagName(tag);
        const colorFn = STRUCTURAL_TAGS.has(tagName) ? blue : white;

        if (tag.endsWith('/>')) {
          result += bold(colorFn(tag));
        } else if (tag.startsWith('</')) {
          depth = Math.max(0, depth - 1);
          result += bold(colorFn(tag));
        } else {
          result += bold(colorFn(tag));
          depth++;
        }

        lastIndex = idx + tag.length;
      }

      if (lastIndex < line.length) {
        const textAfter = line.slice(lastIndex);
        result += depth > 0 ? dim(textAfter) : textAfter;
      }

      return result;
    })
    .join('\n');
}

export function renderSnapshot(snapshot: ExecutionSnapshot): string {
  const lines: string[] = [];
  const durationMs = (snapshot.completedAt ?? Date.now()) - snapshot.startedAt;
  const shortId = snapshot.traceId.slice(0, 12);

  // Header
  lines.push(
    bold('Agent Operation') +
      `  ${cyan(shortId)}` +
      (snapshot.model ? `  ${magenta(snapshot.model)}` : '') +
      `  ${snapshot.totalSteps} steps` +
      `  ${formatMs(durationMs)}`,
  );

  // Steps
  const lastIdx = snapshot.steps.length - 1;
  for (let i = 0; i <= lastIdx; i++) {
    const step = snapshot.steps[i];
    const isLast = i === lastIdx;
    const prefix = isLast ? '└─' : '├─';
    const childPrefix = isLast ? '   ' : '│  ';

    lines.push(
      `${prefix} Step ${step.stepIndex}  ${dim(`[${step.stepType}]`)}  ${formatMs(step.executionTimeMs)}`,
    );

    if (step.stepType === 'call_llm') {
      renderLlmStep(lines, step, childPrefix);
    } else {
      renderToolStep(lines, step, childPrefix);
    }
  }

  // Footer
  const reasonColor = snapshot.completionReason === 'done' ? green : snapshot.error ? red : yellow;
  lines.push(
    `${dim('└─')} ${reasonColor(snapshot.completionReason ?? 'unknown')}` +
      `  tokens=${formatTokens(snapshot.totalTokens)}` +
      `  cost=${formatCost(snapshot.totalCost)}`,
  );

  if (snapshot.error) {
    lines.push(`   ${red('Error:')} ${snapshot.error.type} — ${snapshot.error.message}`);
  }

  return lines.join('\n');
}

function renderLlmStep(lines: string[], step: StepSnapshot, prefix: string): void {
  const tokenInfo: string[] = [];
  if (step.inputTokens) tokenInfo.push(`in:${formatTokens(step.inputTokens)}`);
  if (step.outputTokens) tokenInfo.push(`out:${formatTokens(step.outputTokens)}`);

  if (tokenInfo.length > 0) {
    lines.push(`${prefix}${dim('├─')} LLM     ${tokenInfo.join(' ')} tokens`);
  }

  if (step.toolsCalling && step.toolsCalling.length > 0) {
    const names = step.toolsCalling.map((t) => t.identifier || t.apiName);
    lines.push(
      `${prefix}${dim('├─')} ${yellow('→')} ${step.toolsCalling.length} tool_calls: [${names.join(', ')}]`,
    );
  }

  if (step.content) {
    lines.push(`${prefix}${dim('└─')} Output  ${dim(truncate(step.content, 80))}`);
  }

  if (step.reasoning) {
    lines.push(`${prefix}${dim('└─')} Reason  ${dim(truncate(step.reasoning, 80))}`);
  }
}

function renderMessageList(lines: string[], messages: any[], maxContentLen: number): void {
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const role = msg.role ?? 'unknown';
    const roleColor =
      role === 'user' ? green : role === 'assistant' ? cyan : role === 'system' ? magenta : yellow;
    const rawContent = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
    const preview =
      rawContent && rawContent.length > maxContentLen
        ? rawContent.slice(0, maxContentLen) + '...'
        : rawContent;
    lines.push(
      `  ${dim(`[${i}]`)} ${roleColor(role)}${msg.tool_call_id ? dim(` [${msg.tool_call_id}]`) : ''}`,
    );
    if (preview) lines.push(`    ${dim(preview)}`);
    if (msg.tool_calls) {
      for (const tc of msg.tool_calls) {
        lines.push(`    ${yellow('→')} ${tc.function?.name ?? tc.id}`);
      }
    }
  }
}

function renderToolStep(lines: string[], step: StepSnapshot, prefix: string): void {
  if (step.toolsResult) {
    for (let i = 0; i < step.toolsResult.length; i++) {
      const tool = step.toolsResult[i];
      const isLast = i === step.toolsResult.length - 1;
      const connector = isLast ? '└─' : '├─';
      const status = tool.isSuccess === false ? red('✗') : green('✓');
      const name = tool.identifier || tool.apiName;
      lines.push(`${prefix}${dim(connector)} Tool  ${name}  ${status}`);
    }
  }
}

export function renderSummaryTable(summaries: SnapshotSummary[]): string {
  if (summaries.length === 0) return dim('No snapshots found.');

  const lines: string[] = [
    bold(
      padEnd('Trace ID', 14) +
        padEnd('Model', 20) +
        padEnd('Steps', 7) +
        padEnd('Tokens', 10) +
        padEnd('Duration', 10) +
        padEnd('Reason', 12) +
        'Time',
    ),
    dim('─'.repeat(90)),
  ];

  for (const s of summaries) {
    const reasonColor = s.completionReason === 'done' ? green : s.hasError ? red : yellow;
    const time = new Date(s.createdAt).toLocaleString();

    lines.push(
      cyan(padEnd(s.traceId.slice(0, 12), 14)) +
        padEnd(s.model ?? '-', 20) +
        padEnd(String(s.totalSteps), 7) +
        padEnd(formatTokens(s.totalTokens), 10) +
        padEnd(formatMs(s.durationMs), 10) +
        reasonColor(padEnd(s.completionReason ?? '-', 12)) +
        dim(time),
    );
  }

  return lines.join('\n');
}

export function renderMessageDetail(
  step: StepSnapshot,
  msgIndex: number,
  source: 'input' | 'output' = 'output',
): string {
  const ceEvent = step.events?.find((e) => e.type === 'context_engine_result') as any;
  let messages: any[] | undefined;
  let label: string;

  if (source === 'input') {
    messages = ceEvent?.input?.messages ?? step.messages;
    label = ceEvent ? 'Context Engine Input' : 'Messages (before step)';
  } else {
    messages = ceEvent?.output ?? step.messages;
    label = ceEvent ? 'Final LLM Payload' : 'Messages (before step)';
  }

  if (!messages || messages.length === 0) {
    return red('No messages available.');
  }
  if (msgIndex < 0 || msgIndex >= messages.length) {
    return red(`Message index ${msgIndex} out of range. Available: 0-${messages.length - 1}`);
  }

  const msg = messages[msgIndex];
  const lines: string[] = [];
  const role = msg.role ?? 'unknown';
  const roleColor =
    role === 'user' ? green : role === 'assistant' ? cyan : role === 'system' ? magenta : yellow;

  lines.push(bold(`Message [${msgIndex}]`) + ` from ${label} (${messages.length} total)`);
  lines.push(
    `Role: ${roleColor(role)}${msg.tool_call_id ? `  tool_call_id: ${msg.tool_call_id}` : ''}`,
  );
  if (msg.name) lines.push(`Name: ${msg.name}`);
  lines.push(dim('─'.repeat(60)));

  const rawContent =
    typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content, null, 2);
  if (rawContent) lines.push(rawContent);

  if (msg.tool_calls && msg.tool_calls.length > 0) {
    lines.push('');
    lines.push(bold('Tool Calls:'));
    for (const tc of msg.tool_calls) {
      lines.push(`  ${yellow('→')} ${tc.function?.name ?? tc.id}`);
      if (tc.function?.arguments) {
        lines.push(`    ${dim(tc.function.arguments)}`);
      }
    }
  }

  return lines.join('\n');
}

export function renderSystemRole(step: StepSnapshot): string {
  const ceEvent = step.events?.find((e) => e.type === 'context_engine_result') as any;

  // Try input.systemRole first (user-configured agent prompt)
  const inputSystemRole = ceEvent?.input?.systemRole;

  // Fall back to the first system message in the final LLM payload (assembled system prompt)
  const outputMsgs = ceEvent?.output as any[] | undefined;
  const systemMsg = outputMsgs?.find((m: any) => m.role === 'system');
  const outputSystemRole =
    systemMsg &&
    (typeof systemMsg.content === 'string'
      ? systemMsg.content
      : JSON.stringify(systemMsg.content, null, 2));

  const systemRole = inputSystemRole || outputSystemRole;

  if (!systemRole) {
    return red('No system role found in this step.');
  }

  const lines: string[] = [];
  const source = inputSystemRole ? 'input' : 'output';
  lines.push(
    bold('System Role') + `  ${dim(`Step ${step.stepIndex}`)}  ${dim(`(from ${source})`)}`,
  );
  lines.push(dim('─'.repeat(60)));
  lines.push(formatXmlContent(systemRole));

  return lines.join('\n');
}

export function renderEnvContext(step: StepSnapshot): string {
  const ceEvent = step.events?.find((e) => e.type === 'context_engine_result') as any;
  const outputMsgs: any[] | undefined = ceEvent?.output;

  if (!outputMsgs || outputMsgs.length === 0) {
    return red('No context engine output found in this step.');
  }

  const envMsg = outputMsgs.find((m: any) => m.role === 'user');

  if (!envMsg) {
    return red('No user environment message found in LLM payload.');
  }

  const content =
    typeof envMsg.content === 'string' ? envMsg.content : JSON.stringify(envMsg.content, null, 2);

  const lines: string[] = [];
  lines.push(bold('Environment Context') + `  ${dim(`Step ${step.stepIndex}`)}`);
  lines.push(dim('─'.repeat(60)));
  lines.push(formatXmlContent(content));

  return lines.join('\n');
}

export function renderDiff(
  contentA: string,
  contentB: string,
  options: { labelA: string; labelB: string; title: string },
): string {
  const linesA = contentA.split('\n');
  const linesB = contentB.split('\n');
  const lines: string[] = [];

  lines.push(bold(`${options.title} Diff`) + `  ${cyan(options.labelA)} → ${cyan(options.labelB)}`);
  lines.push(dim('─'.repeat(60)));

  // Simple line-by-line diff
  const maxLen = Math.max(linesA.length, linesB.length);
  let hasChanges = false;

  for (let i = 0; i < maxLen; i++) {
    const a = linesA[i];
    const b = linesB[i];

    if (a === b) {
      lines.push(`  ${a ?? ''}`);
    } else {
      hasChanges = true;
      if (a !== undefined && b === undefined) {
        lines.push(red(`- ${a}`));
      } else if (a === undefined && b !== undefined) {
        lines.push(green(`+ ${b}`));
      } else {
        lines.push(red(`- ${a}`));
        lines.push(green(`+ ${b}`));
      }
    }
  }

  if (!hasChanges) {
    lines.push('');
    lines.push(dim('No differences found.'));
  }

  return lines.join('\n');
}

export function renderStepDetail(
  step: StepSnapshot,
  options?: { context?: boolean; events?: boolean; messages?: boolean; tools?: boolean },
): string {
  const lines: string[] = [
    bold(`Step ${step.stepIndex}`) + `  [${step.stepType}]  ${formatMs(step.executionTimeMs)}`,
  ];
  if (step.context?.phase) {
    lines.push(`Phase: ${cyan(step.context.phase)}`);
  }
  lines.push('');

  if (step.inputTokens || step.outputTokens) {
    lines.push(`Tokens: in=${step.inputTokens ?? 0}  out=${step.outputTokens ?? 0}`);
  }

  // Default view: show content & reasoning (unless specific flags are set)
  const hasSpecificFlag =
    options?.messages || options?.tools || options?.events || options?.context;
  if (!hasSpecificFlag || options?.messages) {
    if (step.content) {
      lines.push('');
      lines.push(bold('Content:'));
      lines.push(step.content);
    }
    if (step.reasoning) {
      lines.push('');
      lines.push(bold('Reasoning:'));
      lines.push(step.reasoning);
    }
  }

  if (options?.tools) {
    if (step.toolsCalling && step.toolsCalling.length > 0) {
      lines.push('');
      lines.push(bold('Tool Calls:'));
      for (const tc of step.toolsCalling) {
        lines.push(`  ${cyan(tc.identifier || tc.apiName)}`);
        if (tc.arguments) {
          lines.push(`    args: ${tc.arguments}`);
        }
      }
    }
    if (step.toolsResult && step.toolsResult.length > 0) {
      lines.push('');
      lines.push(bold('Tool Results:'));
      for (const tr of step.toolsResult) {
        const status = tr.isSuccess === false ? red('✗') : green('✓');
        lines.push(`  ${status} ${cyan(tr.identifier || tr.apiName)}`);
        if (tr.output) {
          const output = tr.output.length > 500 ? tr.output.slice(0, 500) + '...' : tr.output;
          lines.push(`    output: ${output}`);
        }
      }
    }
  }

  if (options?.messages) {
    // Show context engine input/output from events if available
    const ceEvent = step.events?.find((e) => e.type === 'context_engine_result') as any;

    if (ceEvent) {
      // Context engine input messages (DB messages passed to engine)
      const inputMsgs = ceEvent.input?.messages;
      if (inputMsgs) {
        lines.push('');
        lines.push(bold(`Context Engine Input: ${inputMsgs.length} messages`) + dim(' (from DB)'));
        lines.push(dim('─'.repeat(60)));
        renderMessageList(lines, inputMsgs, 200);
      }

      // Context engine params
      lines.push('');
      lines.push(bold('Context Engine Params:'));
      if (ceEvent.input?.systemRole) {
        const sr = ceEvent.input.systemRole;
        lines.push(`  systemRole: ${dim(sr.length > 100 ? sr.slice(0, 100) + '...' : sr)}`);
      }
      if (ceEvent.input?.model) lines.push(`  model: ${cyan(ceEvent.input.model)}`);
      if (ceEvent.input?.provider) lines.push(`  provider: ${ceEvent.input.provider}`);
      if (ceEvent.input?.enableHistoryCount != null)
        lines.push(`  enableHistoryCount: ${ceEvent.input.enableHistoryCount}`);
      if (ceEvent.input?.historyCount != null)
        lines.push(`  historyCount: ${ceEvent.input.historyCount}`);
      if (ceEvent.input?.forceFinish) lines.push(`  forceFinish: ${ceEvent.input.forceFinish}`);
      if (ceEvent.input?.knowledge) {
        const k = ceEvent.input.knowledge;
        const fileCount = k.fileContents?.length ?? 0;
        const kbCount = k.knowledgeBases?.length ?? 0;
        if (fileCount > 0 || kbCount > 0) {
          lines.push(`  knowledge: ${fileCount} files, ${kbCount} knowledge bases`);
        }
      }
      if (ceEvent.input?.toolsConfig?.tools?.length) {
        lines.push(`  tools: ${ceEvent.input.toolsConfig.tools.length} plugins`);
      }
      if (ceEvent.input?.userMemory) lines.push(`  userMemory: ${dim('present')}`);

      // Final messages sent to LLM
      const outputMsgs = ceEvent.output;
      if (outputMsgs) {
        lines.push('');
        lines.push(
          bold(`Final LLM Payload: ${outputMsgs.length} messages`) + dim(' (after context engine)'),
        );
        lines.push(dim('─'.repeat(60)));
        renderMessageList(lines, outputMsgs, 300);
      }
    } else if (step.messages) {
      // Fallback: show raw DB messages if no context engine event
      lines.push('');
      lines.push(bold(`Messages (before step): ${step.messages.length} messages`));
      lines.push(dim('─'.repeat(60)));
      renderMessageList(lines, step.messages, 200);
    }
  }

  if (options?.events && step.events) {
    lines.push('');
    lines.push(bold(`Events: ${step.events.length}`));
    lines.push(dim('─'.repeat(60)));
    for (const event of step.events) {
      const typeColor =
        event.type === 'llm_result'
          ? cyan
          : event.type === 'llm_start'
            ? magenta
            : event.type === 'done'
              ? green
              : event.type === 'error'
                ? red
                : yellow;
      lines.push(`  ${typeColor(event.type)}`);

      if (event.type === 'llm_result') {
        const result = event.result as any;
        if (result?.content) {
          const preview =
            result.content.length > 300 ? result.content.slice(0, 300) + '...' : result.content;
          lines.push(`    content: ${dim(preview)}`);
        }
        if (result?.tool_calls) {
          for (const tc of result.tool_calls) {
            lines.push(`    ${yellow('→')} ${tc.function?.name ?? tc.id}`);
          }
        }
      } else if (event.type === 'llm_start') {
        const payload = event.payload as any;
        if (payload?.messages) {
          lines.push(`    ${dim(`${payload.messages.length} messages`)}`);
        }
        if (payload?.model) {
          lines.push(`    model: ${payload.model}`);
        }
      } else if (event.type === 'done') {
        if (event.reason) lines.push(`    reason: ${event.reason}`);
      } else if (event.type === 'tool_result') {
        const result =
          typeof event.result === 'string'
            ? event.result.length > 200
              ? event.result.slice(0, 200) + '...'
              : event.result
            : JSON.stringify(event.result)?.slice(0, 200);
        lines.push(`    id: ${event.id ?? '-'}`);
        if (result) lines.push(`    result: ${dim(result)}`);
      }
    }
  }

  if (options?.context && step.context) {
    lines.push('');
    lines.push(bold('Runtime Context:'));
    lines.push(dim('─'.repeat(60)));
    lines.push(`  phase: ${cyan(step.context.phase)}`);
    if (step.context.payload) {
      lines.push('');
      lines.push(bold('  Payload:'));
      const payloadStr = JSON.stringify(step.context.payload, null, 2);
      const payloadLines = payloadStr.split('\n');
      for (const line of payloadLines.slice(0, 50)) {
        lines.push(`    ${dim(line)}`);
      }
      if (payloadLines.length > 50) {
        lines.push(`    ${dim(`... (${payloadLines.length - 50} more lines)`)}`);
      }
    }
    if (step.context.stepContext) {
      lines.push('');
      lines.push(bold('  Step Context:'));
      lines.push(
        `    ${dim(JSON.stringify(step.context.stepContext, null, 2).split('\n').join('\n    '))}`,
      );
    }
  }

  return lines.join('\n');
}
