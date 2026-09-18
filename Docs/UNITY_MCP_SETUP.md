# Unity MCP setup — Megawatt Valley

Connect Cursor to a running Unity Editor so the agent can read the console,
inspect the hierarchy, and (with care) run Editor actions.

Official overview: [Unity MCP get started](https://docs.unity3d.com/Packages/com.unity.ai.assistant@2.6/manual/integration/unity-mcp-get-started.html)

## What is already in the repo

- `Packages/manifest.json` includes `com.unity.ai.assistant` (+ inference dependency).
- Project `.cursor/mcp.json` points at `relay_win.exe --mcp` with this project path.
- Cursor agents also need the same `unity-mcp` entry in the **user** config `%USERPROFILE%\.cursor\mcp.json` (project-only config was not enough for agent tool discovery in practice).
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

## Recommended Unity MCP settings (max useful autonomy)

In **Edit → Project Settings → AI → Unity MCP Server**:

| Setting | Recommendation | Why |
| --- | --- | --- |
| **Unity Bridge** | Running | Required |
| **Connected Clients** | Cursor listed after Accept | You already did this |
| **Tools** (all checkboxes) | **Enable every tool** | Lets Cursor read console, scenes, GameObjects, scripts, assets — needed for “do as much as possible” |
| **Validation Level** | **Standard** | Applies to `Unity_ManageScript`. Basic is too soft; comprehensive/strict slows or blocks edits. Standard catches real compile issues without babysitting |
| **Show Debug Logs** | Off | Only turn on when debugging the bridge |
| **Auto-approve in Batch Mode** | On | Fine for our shadow `Verify-UnityBuild` runs |

Do **not** leave half the tools unticked if you want Cursor to verify Play Mode work without you copy-pasting console text.

### Cursor side

1. **Settings → Tools & MCP** (or MCP) → `unity-mcp` should be **enabled** (green).
2. If tools don’t appear in chat after Accept: toggle the server off/on, or restart Cursor with Unity still open.
3. Smoke test: ask Cursor to read the Unity console.

### Note on Unity’s roadmap

Unity’s package docs now prefer **Unity CLI** over MCP for some workflows. For Megawatt Valley we still use MCP for live Editor context; file edits + `Tools/Verify-UnityBuild.ps1` remain the fallback.

## Rules of use (Megawatt Valley)

- MCP is optional — file edits + `Tools/Verify-UnityBuild.ps1` remain the default if the bridge is down.
- With all tools enabled (recommended), Cursor may read the console and inspect/edit the open scene.
- Prefer Cursor file edits for C#; use MCP for verification and scene wiring.
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
