# Megawatt Valley desktop release — 0.2.0

This is the independent desktop path. Unity and historical projects are untouched.
It builds the current Phaser simulation and renderer into an Electron application.
This is not a native-engine rewrite, and packaging does not establish commercial
art, performance or engagement quality by itself.

## Play on Windows
Download MEGAWATT-VALLEY-WINDOWS from the latest successful Desktop release run.
Run the Setup executable, or extract the Windows x64 ZIP and launch Megawatt Valley.exe.
No browser, editor, Node installation, server or internet connection is required.
The first build is unsigned; Windows may show an unknown-publisher prompt.
Do not delete the companion files in the portable version.

Company saves live under the application's user-data directory in saves/company.json.
Company > Open save folder reveals the exact location. Each successful save retains
the previous valid save as company.backup.json. Closing the application saves; a
write failure offers to keep playing so you can export your company.
Installer upgrades retain company saves. Uninstall does not delete user data.
To move a browser company into desktop: Export save in the browser, then Import save
from the desktop game's gear menu. Native saves are separate from browser storage.

F11 toggles fullscreen; Ctrl+S saves; F12 saves a screenshot using a native file dialog.
Display offers a persistent 30/60 FPS limit (next launch), window size, fullscreen,
and pause-on-focus-loss. Loaded companies resume paused.
The controls/playing guide is available in the native Help menu.

## Architecture
desktop/main.cjs owns the window, local protocol, native menus, settings and saves.
The isolated, sandboxed renderer cannot access Node. A narrow preload API accepts
validated version-1 saves, reads recovery candidates and exchanges window commands.
Game files are served from a fixed local protocol allowlist; there is no HTTP server.
Desktop packaging extracts the offline bundle into separate scripts/styles for CSP.
src/persistence/save.ts uses the desktop bridge when present and localStorage otherwise.
The save format and normal browser path stay compatible.

desktop/save-store.cjs uses a temporary file, fsync and atomic rename for replacement,
with a previous-save backup. Both main process and renderer validate loaded state.
The main-process validator is built from the same TypeScript boundary validator.
A durable save error is reported before closing; this is not a cloud-save system.

## Verification and scope
Desktop release CI runs gameplay tests, TypeScript, a production build, durable-store
tests and actual Windows executable checks. The executable check imports a company
from the ordinary-budget playthrough, saves, closes normally, resumes, toggles
fullscreen and recovers a deliberately damaged primary save.
Portable runtime operation is tested. Interactive installer UI is not automated.
macOS/Linux packaging, signing, storefront distribution and automatic updates are not
included in this first desktop delivery. Scenario 2 remains future content.

Versions of Electron and electron-builder are pinned in desktop/package.json. CI
includes its resolved desktop/package-lock.json alongside the build for provenance.
Source: Electron's security guidance informed isolation, protocol, CSP and IPC:
https://github.com/electron/electron/blob/main/docs/tutorial/security.md

## Development
npm ci
npm test
npm run build
node scripts/package-playable.mjs
node scripts/package-desktop.mjs
npm install --prefix desktop
npm run start --prefix desktop
npm run package --prefix desktop

The next quality work should be driven by playtest findings: readable construction/
work animations, richer authored environments, scenario pacing and sustained choices.
Moving engines is justified by measured limits, not by the presence of HTML internally.
