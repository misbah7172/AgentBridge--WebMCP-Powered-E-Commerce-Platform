import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

type ExpectedCall = { functionName?: string; arguments?: Record<string, unknown>; unordered?: { ordered?: ExpectedCall[] }[] };
type EvalCase = {
  id: string;
  userPrompt: string;
  initialState: string;
  availableTools: string[];
  expectedCalls: ExpectedCall[];
  expectNoToolCall?: boolean;
};
type PlannedCall = { functionName?: string; arguments?: Record<string, unknown> };

const model = process.env.WEBMCP_EVAL_MODEL || 'gpt-5.6-luna';
const repetitions = Math.max(1, Number(process.env.WEBMCP_EVAL_RUNS || 3));

async function filesIn(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(entryPath) : entry.name.endsWith('.json') ? [entryPath] : [];
  }))).flat();
}

function flatten(calls: ExpectedCall[]): ExpectedCall[] {
  return calls.flatMap((call) => call.unordered ? call.unordered.flatMap((branch) => flatten(branch.ordered || [])) : [call]);
}

function argumentScore(expected: ExpectedCall[], actual: PlannedCall[]): number {
  const checks = expected.flatMap((expectedCall, index) => Object.entries(expectedCall.arguments || {}).map(([key, value]) => {
    const received = actual[index]?.arguments?.[key];
    return typeof value === 'string' && value.startsWith('${') ? received !== undefined : received === value;
  }));
  return checks.length ? checks.filter(Boolean).length / checks.length : 1;
}

async function planCase(evaluation: EvalCase, apiKey: string): Promise<{ calls: PlannedCall[]; latencyMs: number }> {
  const started = performance.now();
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      store: false,
      input: `You are evaluating tool-planning only. Do not invent IDs, product facts, or unavailable tools. Return JSON only: {"calls":[{"functionName":"...","arguments":{}}],"recovery":"..."}.\nInitial state: ${evaluation.initialState}\nAvailable tools: ${JSON.stringify(evaluation.availableTools)}\nCustomer request: ${evaluation.userPrompt}`,
      text: { format: { type: 'json_object' } },
    }),
  });
  if (!response.ok) throw new Error(`OpenAI Responses API returned ${response.status}.`);
  const payload = await response.json() as { output_text?: string };
  const planned = JSON.parse(payload.output_text || '{}') as { calls?: PlannedCall[] };
  return { calls: Array.isArray(planned.calls) ? planned.calls : [], latencyMs: Number((performance.now() - started).toFixed(2)) };
}

async function main() {
  const outputDirectory = path.resolve('eval-results');
  await mkdir(outputDirectory, { recursive: true });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const skipped = { status: 'NOT_RUN', reason: 'OPENAI_API_KEY is not configured.', model, repetitions, measuredAt: new Date().toISOString() };
    await writeFile(path.join(outputDirectory, 'llm-results.json'), `${JSON.stringify(skipped, null, 2)}\n`);
    console.log(JSON.stringify(skipped, null, 2));
    return;
  }

  const cases = await Promise.all((await filesIn(path.resolve('evals'))).map(async (file) => JSON.parse(await readFile(file, 'utf8')) as EvalCase));
  const runs = [] as Array<{ id: string; selection: number; arguments: number; chain: number; recovery: number; latencyMs: number }>;
  for (let iteration = 0; iteration < repetitions; iteration++) {
    for (const evaluation of cases) {
      const actual = await planCase(evaluation, apiKey);
      const expected = flatten(evaluation.expectedCalls);
      const names = actual.calls.map((call) => call.functionName);
      const expectedNames = expected.map((call) => call.functionName);
      const selection = Number(JSON.stringify([...new Set(names)].sort()) === JSON.stringify([...new Set(expectedNames)].sort()));
      const chain = Number(JSON.stringify(names) === JSON.stringify(expectedNames));
      const recovery = Number(evaluation.expectNoToolCall ? names.length === 0 : !names.some((name) => !evaluation.availableTools.includes(name || '')));
      runs.push({ id: evaluation.id, selection, arguments: argumentScore(expected, actual.calls), chain, recovery, latencyMs: actual.latencyMs });
    }
  }
  const average = (key: keyof typeof runs[number]) => runs.reduce((total, run) => total + Number(run[key]), 0) / runs.length;
  const report = {
    status: 'COMPLETED', model, repetitions, cases: cases.length, measuredAt: new Date().toISOString(), runs,
    metrics: {
      toolSelectionAccuracy: average('selection'), argumentAccuracy: average('arguments'),
      chainAccuracy: average('chain'), recoveryAccuracy: average('recovery'), averageLatencyMs: average('latencyMs'),
    },
    note: 'This provider evaluation scores generic planning only. It does not execute tools or mutate the application database.',
  };
  await writeFile(path.join(outputDirectory, 'llm-results.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report.metrics, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
