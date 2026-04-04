# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.1.0] - 2026-04-04

### Added

- `scripts/install.mjs` — a proper Node.js install script that replaces the inline one-liner in `install.bat`. It registers the marketplace, writes the installed-plugins list, enables the plugin in `settings.json`, installs both skills to `~/.claude/skills/`, and cleans up the obsolete local `.claude/skills/advisor/` directory.
- `stop_server.bat` — Windows helper to stop any running server process on port 8099 without needing to hunt for the PID manually.
- `SessionStart` hook now POSTs to `/hooks/register-project` (with the current working directory) after auto-starting the server, enabling reliable cross-project monitoring from a single global install.

### Changed

- `install.bat` now delegates to `scripts/install.mjs` via `node` instead of embedding a minified one-liner. The script is idempotent and handles all nine hook events including `SessionStart`, `Stop`, `Notification`, `PostToolUseFailure`, and `SessionEnd` which the previous version missed.
- `start.bat` now waits for the server to become ready (polling `/api/state` up to 10 times) before reporting success, eliminating a race condition where the script exited before the server was accepting connections.
- Skills are now installed globally to `~/.claude/skills/` with absolute paths substituted in, so they work from any project directory.
