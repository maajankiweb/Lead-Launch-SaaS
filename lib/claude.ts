import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Runs the local Claude Code CLI (`claude -p …`) as a subprocess, using the
 * user's own Claude Code subscription/auth — NO API key involved.
 *
 * Default context uses a 1M-context model that requires paid usage credits and
 * 429s on standard plans, so we pin `--model sonnet` (standard context).
 */

export type ClaudeResult<T> =
  | { ok: true; data: T }
  | { ok: false; notInstalled?: boolean; error: string };

function getCandidatePaths(): string[] {
  const home = os.homedir() || "";
  const appData = process.env.APPDATA || (home ? path.join(home, "AppData", "Roaming") : "");
  const localAppData = process.env.LOCALAPPDATA || (home ? path.join(home, "AppData", "Local") : "");

  return [
    process.env.CLAUDE_CLI_PATH,
    appData ? path.join(appData, "npm", "claude.cmd") : "",
    appData ? path.join(appData, "npm", "claude") : "",
    localAppData ? path.join(localAppData, "Programs", "claude", "claude.exe") : "",
    home ? path.join(home, ".local", "bin", "claude") : "",
    home ? path.join(home, ".local", "bin", "claude.exe") : "",
    home ? path.join(home, ".claude", "local", "claude") : "",
    "/opt/homebrew/bin/claude",
    "/usr/local/bin/claude",
    "/usr/bin/claude",
  ].filter(Boolean) as string[];
}

export function resolveClaudeBin(): string | null {
  for (const c of getCandidatePaths()) {
    try {
      if (existsSync(c)) return c;
    } catch {
      // ignore check errors in restricted serverless environments
    }
  }
  return null; // not found in known locations
}

/** Fast check: is the CLI present at all? */
export function claudeInstalled(): boolean {
  return resolveClaudeBin() !== null;
}

/** Pull the first JSON object/array out of a possibly fenced/prefixed string. */
function extractJSON<T>(text: string): T | null {
  let s = text.trim();
  // strip ```json … ``` or ``` … ``` fences
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  // find the outermost JSON bracket span
  const firstObj = s.indexOf("{");
  const firstArr = s.indexOf("[");
  let start = -1;
  if (firstObj === -1) start = firstArr;
  else if (firstArr === -1) start = firstObj;
  else start = Math.min(firstObj, firstArr);
  if (start === -1) return null;
  const open = s[start];
  const close = open === "{" ? "}" : "]";
  const end = s.lastIndexOf(close);
  if (end <= start) return null;
  const candidate = s.slice(start, end + 1);
  try {
    return JSON.parse(candidate) as T;
  } catch {
    return null;
  }
}

export async function runClaudeJSON<T>(
  prompt: string,
  opts: { model?: string; timeoutMs?: number } = {},
): Promise<ClaudeResult<T>> {
  const bin = resolveClaudeBin();
  if (!bin) {
    return { ok: false, notInstalled: true, error: "Claude Code CLI not found on this machine." };
  }
  const model = opts.model ?? "sonnet";
  const timeout = opts.timeoutMs ?? 150_000;

  return new Promise<ClaudeResult<T>>((resolve) => {
    let child: ReturnType<typeof execFile>;
    try {
      child = execFile(
        bin,
        ["-p", prompt, "--model", model, "--output-format", "json"],
        {
          timeout,
          maxBuffer: 32 * 1024 * 1024,
          cwd: os.homedir(),
          env: process.env,
          shell: process.platform === "win32",
        },
        (err, stdout, stderr) => {
          if (err && (err as NodeJS.ErrnoException).code === "ENOENT") {
            resolve({ ok: false, notInstalled: true, error: "Claude Code CLI not found." });
            return;
          }
          let envelope: Record<string, unknown> | null = null;
          try {
            envelope = JSON.parse(stdout);
          } catch {
            envelope = extractJSON<Record<string, unknown>>(stdout);
          }
          if (!envelope) {
            const cleanStderr = (stderr || "").replace(/Warning: no stdin data received[\s\S]*?wait longer\./gi, "").trim();
            const cleanStdout = (stdout || "").replace(/Warning: no stdin data received[\s\S]*?wait longer\./gi, "").trim();
            const msg = (cleanStderr || cleanStdout || (err ? err.message : "")).slice(0, 400).trim();
            resolve({ ok: false, error: msg || "Claude Code produced no output." });
            return;
          }
          if (envelope.is_error) {
            const raw = String(envelope.result ?? "Claude Code returned an error.");
            const notLoggedIn = /log ?in|authenticat|credit|usage/i.test(raw);
            resolve({
              ok: false,
              notInstalled: notLoggedIn ? true : undefined,
              error: notLoggedIn
                ? "Not signed in to Claude Code. Run 'claude' once in a terminal to sign in, then retry."
                : raw,
            });
            return;
          }
          const text = String(envelope.result ?? "");
          const data = extractJSON<T>(text);
          if (data === null) {
            resolve({ ok: false, error: "Claude Code did not return valid JSON." });
            return;
          }
          resolve({ ok: true, data });
        },
      );

      // Close stdin immediately so Claude does not wait 3s for input
      try {
        child.stdin?.end();
      } catch {
        // ignore
      }
    } catch (e) {
      resolve({ ok: false, error: (e as Error).message });
    }
  });
}
