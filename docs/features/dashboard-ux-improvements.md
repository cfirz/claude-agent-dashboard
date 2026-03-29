# Feature: Dashboard UX/UI Improvements for Non-Technical Users

**Status:** Complete
**Date:** 2026-03-29
**Slug:** dashboard-ux-improvements

## Goal
Make the Agent Dashboard more friendly and approachable for non-technical users while preserving all existing technical terminology and functionality.

## Requirements

### 1. Contrast & Readability
- [x] Increase text contrast: `--text-secondary` to `#b4b4bf`, `--text-tertiary` to `#71717a`, `--status-idle` to `#71717a`
- [x] Bump minimum font sizes from 9-11px to 11-13px across all UI elements
- [x] Stat card labels: 12px, values: 24px
- [x] Form labels: 13px, form inputs: 14px
- [x] Log entries: 12px (up from 11px monospace)
- [x] Tags (skill/tool): 11px with 3px/10px padding (up from 10px/2px/8px)
- [x] Suggestion type badges: 11px (up from 9px)

### 2. Agent Cards Redesign
- [x] Add agent type icons (emoji-based) via `agentIcon()` function mapping agent names to icons
- [x] New `.agent-type-icon` element (28x28px, rounded) in card header
- [x] Larger status indicators: new `.status-indicator` class at 12px (up from 8px `.status-dot`)
- [x] Status labels: 11px with 3px/10px padding (up from 10px/2px/8px)
- [x] Card footer with top border separator
- [x] Clear button tooltip: "Remove this card from view"
- [x] Keep skills/tools tag rows visible (not collapsed)

### 3. Activity Log Timeline Style
- [x] Add `.log-icon` element (20px circle) with per-type coloring
- [x] `logIcon()` function returning emoji per entry type (error, session, notification, skill, default)
- [x] `logIconClass()` function returning CSS class per type
- [x] Row borders between entries (`.border-subtle` bottom border)
- [x] Remove brackets from agent name display
- [x] Both `addLogEntry()` (dashboard) and `appendLogEntry()` (global) updated

### 4. Progressive Disclosure
- [x] Token Usage section on agent detail page: collapsible via `.collapsible-header`/`.collapsible-body`
- [x] Tool Frequency section on agent detail page: collapsible
- [x] CSS for `.collapsible-header`, `.collapsible-body`, `.collapsible-arrow` with expand/collapse toggle

### 5. Advisor Panel Improvements
- [x] Add `.advisor-subtitle` element: "Suggestions to improve your agent setup"
- [x] Remove UPPERCASE from advisor title (changed to `letter-spacing: 0.3px`)
- [x] Tooltips on suggestion action buttons (Details, Approve, Dismiss)
- [x] Larger suggestion cards: type badges 11px, titles 14px, summaries 13px, buttons 12px with min-height 32px

### 6. Onboarding Overlay
- [x] First-visit welcome overlay with localStorage persistence (`onboardingSeen` key)
- [x] Three feature cards: Live Status, Activity Log, Agent Advisor
- [x] "Get Started" dismiss button
- [x] Click-outside-to-dismiss behavior
- [x] CSS: `.onboarding-overlay`, `.onboarding-box`, `.onboarding-feature`, `.onboarding-dismiss`

### 7. Tooltips System
- [x] CSS-only tooltip via `[data-tooltip]` attribute
- [x] Applied to stat card labels (Agents Defined, Active Now, Agents Spawned, Errors)
- [x] Applied to session bar token labels (Tokens In, Tokens Out)
- [x] Applied to agent card token label

### 8. Accessibility & Touch Targets
- [x] Nav items: min-height 44px
- [x] Nav agent items: min-height 40px
- [x] New Agent (+) button: 28x28px (up from 18x18px)
- [x] Clear button: min-height 28px
- [x] Tool chips: min-height 32px
- [x] Filter inputs: min-height 38px
- [x] Tab items: min-height 44px
- [x] Sidebar connection dot: 9px (up from 7px)
- [x] Nav agent dots: 9px (up from 7px)
- [x] Status dots (legacy): 10px (up from 8px)

### 9. Terminology Consistency
- [x] Keep all existing technical terms (Agent, Tokens, Session, etc.) unchanged
- [x] Consistent capitalization in status labels
- [x] Friendly empty state messages (dashboard, activity log)

## Files Modified
- `ui/dashboard.html` — All CSS and JS changes (single-file dashboard)

## Constraints
- Keep all technical terminology as-is (no renaming Agent to Helper, etc.)
- Keep skills/tools tag rows visible on agent cards
- Keep diff view in advisor panel intact
- Zero external dependencies
