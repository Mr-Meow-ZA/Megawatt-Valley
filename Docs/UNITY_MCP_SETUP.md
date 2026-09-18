# Unity MCP setup — Megawatt Valley

Connect Cursor to a running Unity Editor so the agent can read the console,
inspect the hierarchy, and (with care) run Editor actions.

Official overview: [Unity MCP get started](https://docs.unity3d.com/Packages/com.unity.ai.assistant@2.6/manual/integration/unity-mcp-get-started.html)

## What is already in the repo

- `Packages/manifest.json` includes `com.unity.ai.assistant` (+ inference dependency).
- `.cursor/mcp.json` points Cursor at `%USERPROFILE%\.unity\relay\relay_win.exe` with `--mcp` and this project path.
- Project rules for MCP use: `Docs/PRACTICES_AND_PLANNING.md` §3.2.

## One-time setup on this PC

1. **Open the Unity project** (`Megawatt-Valley`) and wait for Package Manager to finish resolving AI Assistant.
2. Confirm you have Unity AI tools access (trial or subscription) and the project is linked to Unity Cloud.
3. **Edit → Project Settings → AI → Unity MCP** (or **Unity MCP Server**).
   - Bridge status should show **Running**. If Stopped, click **Start**.
4. Optional shortcut: under **Integrations**, choose **Cursor** → **Configure** (Unity can rewrite the MCP entry; our project file already has the Windows relay path).
5. In **Cursor**: Settings → MCP → confirm `unity-mcp` appears. Restart Cursor if it was open while Unity installed the relay.
6. First connection: Unity shows **Pending Connections**. Select **Accept** / **Allow** for Cursor.
7. Smoke test in chat: ask Cursor to *read the Unity console and summarize any errors*. You should see a Unity MCP tool call (e.g. console / scene tools).

## Rules of use (Megawatt Valley)

- MCP is optional — file edits + `Tools/Verify-UnityBuild.ps1` remain the default if the bridge is down.
- Prefer **read-only** tools (console, hierarchy, scene inspect) first.
- Prefer Cursor file edits for C#; use MCP for verification.
- Write tools (create/delete objects, broad Editor mutations) only with Rapha nearby, preferably on a feature branch.
- After MCP write sessions, spot-check Play Mode before committing.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| No Unity tools in Cursor | Unity must be open on this project; bridge Running; Cursor restarted after `.cursor/mcp.json` change |
| Relay missing | Restart Unity once so it installs `%USERPROFILE%\.unity\relay\relay_win.exe` |
| Pending forever | Accept the client under Project Settings → AI → Unity MCP |
| Wrong project | Our config passes `--project-path` to Megawatt-Valley; close other Editors if confused |
| Compile errors | Fix console errors first — the bridge may refuse to start |

## Not required

- Embedding Cursor inside the Unity window (not supported).
- Committing AI Assistant local settings under `ProjectSettings/Packages/com.unity.ai.assistant/` (gitignored).
