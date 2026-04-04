/**
 * Agent Advisor — Plugin installer for Claude Code
 *
 * Registers the plugin with Claude Code's plugin system (for skill discovery)
 * and injects hooks into global settings (for event delivery).
 *
 * Three config files are touched (all under ~/.claude/):
 *   1. plugins/known_marketplaces.json  — marketplace registry
 *   2. plugins/installed_plugins.json   — installed plugins list
 *   3. settings.json                    — enabledPlugins + hooks
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

// ── paths ────────────────────────────────────────────────────────────────────

const __dirname  = dirname(fileURLToPath(import.meta.url));
const pluginDir  = resolve(__dirname, '..').replace(/\\/g, '\\\\');  // keep escaped backslashes for JSON
const pluginDirN = resolve(__dirname, '..');                          // native separators

const claudeDir    = join(homedir(), '.claude');
const pluginsDir   = join(claudeDir, 'plugins');
const settingsPath = join(claudeDir, 'settings.json');
const marketPath   = join(pluginsDir, 'known_marketplaces.json');
const installedPath = join(pluginsDir, 'installed_plugins.json');

const MARKETPLACE_ID = 'cfir-claude-plugins';
const PLUGIN_NAME    = 'agent-advisor';
const PLUGIN_KEY     = `${PLUGIN_NAME}@${MARKETPLACE_ID}`;
const VERSION        = '1.0.0';

// ── helpers ──────────────────────────────────────────────────────────────────

function readJSON(path) {
  try { return JSON.parse(readFileSync(path, 'utf8')); }
  catch { return null; }
}

function writeJSON(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

// ── 1. Register marketplace ─────────────────────────────────────────────────

const marketplaces = readJSON(marketPath) || {};

marketplaces[MARKETPLACE_ID] = {
  source: {
    source: 'file',
    path: join(pluginDirN, 'marketplace.json'),
  },
  installLocation: pluginDirN,
  lastUpdated: new Date().toISOString(),
};

writeJSON(marketPath, marketplaces);
console.log(`Marketplace registered in ${marketPath}`);

// ── 2. Register plugin ──────────────────────────────────────────────────────

const installed = readJSON(installedPath) || { version: 2, plugins: {} };
if (!installed.plugins) installed.plugins = {};

const now = new Date().toISOString();
const existing = installed.plugins[PLUGIN_KEY]?.[0];

installed.plugins[PLUGIN_KEY] = [{
  scope: 'user',
  installPath: pluginDirN,
  version: VERSION,
  installedAt: existing?.installedAt || now,
  lastUpdated: now,
}];

writeJSON(installedPath, installed);
console.log(`Plugin registered in ${installedPath}`);

// ── 3. Enable plugin & install hooks ────────────────────────────────────────

const settings = readJSON(settingsPath) || {};

// Enable plugin (for skill discovery)
if (!settings.enabledPlugins) settings.enabledPlugins = {};
settings.enabledPlugins[PLUGIN_KEY] = true;

// Build the server path with forward slashes for the shell command
const serverPath = resolve(pluginDirN, 'server', 'server.mjs').replace(/\\/g, '/');

const startCmd = [
  'curl -s http://localhost:8099/api/state > /dev/null 2>&1',
  `|| node "${serverPath}" &`,
  'curl -sf --max-time 10 --retry 5 --retry-delay 1 --retry-connrefused',
  '-X POST http://localhost:8099/hooks/register-project',
  '-H "Content-Type: application/json"',
  '-d "{\\"cwd\\":\\"$CLAUDE_PROJECT_DIR\\"}"',
  '> /dev/null 2>&1 || true',
].join(' ');

// Hook definitions — SessionStart auto-starts the server, the rest are HTTP
const hookDefs = {
  SessionStart:       [{ hooks: [{ type: 'command', command: startCmd },
                                  { type: 'http', url: 'http://localhost:8099/hooks/session-start' }] }],
  SubagentStart:      [{ hooks: [{ type: 'http', url: 'http://localhost:8099/hooks/subagent-start' }] }],
  SubagentStop:       [{ hooks: [{ type: 'http', url: 'http://localhost:8099/hooks/subagent-stop' }] }],
  PreToolUse:         [{ hooks: [{ type: 'http', url: 'http://localhost:8099/hooks/pre-tool-use' }] }],
  PostToolUse:        [{ hooks: [{ type: 'http', url: 'http://localhost:8099/hooks/post-tool-use' }] }],
  PostToolUseFailure: [{ hooks: [{ type: 'http', url: 'http://localhost:8099/hooks/post-tool-use-failure' }] }],
  Stop:               [{ hooks: [{ type: 'http', url: 'http://localhost:8099/hooks/stop' }] }],
  Notification:       [{ hooks: [{ type: 'http', url: 'http://localhost:8099/hooks/notification' }] }],
  SessionEnd:         [{ hooks: [{ type: 'http', url: 'http://localhost:8099/hooks/session-end' }] }],
};

// Inject hooks — remove any existing 8099 entries first, then add ours
if (!settings.hooks) settings.hooks = {};

for (const [event, newEntries] of Object.entries(hookDefs)) {
  if (!settings.hooks[event]) settings.hooks[event] = [];

  // Remove previous agent-advisor hooks (identified by localhost:8099)
  settings.hooks[event] = settings.hooks[event].filter(entry => {
    if (!entry.hooks || !Array.isArray(entry.hooks)) return true;
    const allOurs = entry.hooks.every(h =>
      (h.url && h.url.includes('localhost:8099')) ||
      (h.command && h.command.includes('localhost:8099'))
    );
    return !allOurs;
  });

  // Add fresh entries
  settings.hooks[event].push(...newEntries);
}

writeJSON(settingsPath, settings);
console.log(`Plugin enabled + hooks installed in ${settingsPath}`);

// ── 4. Install global skills ────────────────────────────────────────────────

const globalSkillsDir = join(claudeDir, 'skills');
const pluginDirFwd    = pluginDirN.replace(/\\/g, '/');   // forward slashes for bash

const SKILLS = [
  { srcDir: 'advisor',   destName: 'agent-advisor'   },
  { srcDir: 'dashboard', destName: 'agent-dashboard'  },
];

for (const skill of SKILLS) {
  const srcPath  = join(pluginDirN, 'skills', skill.srcDir, 'SKILL.md');
  const destDir  = join(globalSkillsDir, skill.destName);
  const destPath = join(destDir, 'SKILL.md');

  let content = readFileSync(srcPath, 'utf8');

  // Replace plugin-root variable with the absolute path
  content = content.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, pluginDirFwd);
  content = content.replace(/\$CLAUDE_PLUGIN_ROOT/g, pluginDirFwd);

  // Fix cross-skill command references
  content = content.replace(/\/agent-advisor:dashboard/g, '/agent-dashboard');
  content = content.replace(/\/agent-advisor:advisor/g, '/agent-advisor');

  mkdirSync(destDir, { recursive: true });
  writeFileSync(destPath, content);
  console.log(`Skill installed → ${destPath}`);
}

// ── 5. Clean up obsolete local skill ────────────────────────────────────────

const obsoleteLocal = join(pluginDirN, '.claude', 'skills', 'advisor');
try {
  rmSync(obsoleteLocal, { recursive: true });
  console.log(`Removed obsolete local skill: ${obsoleteLocal}`);
} catch { /* already gone */ }

// ── done ─────────────────────────────────────────────────────────────────────

console.log('');
console.log('Installation complete!');
console.log(`  Plugin:  ${PLUGIN_KEY}`);
console.log(`  Path:    ${pluginDirN}`);
console.log(`  Skills:  ${SKILLS.map(s => '/' + s.destName).join(', ')}`);
console.log('');
console.log('Restart Claude Code for changes to take effect.');
