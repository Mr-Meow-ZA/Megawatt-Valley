# Megawatt Valley — Development Timeline

**Status:** Living milestone map (sequence, not calendar dates)  
**Visual view:** open [`Docs/visuals/development-timeline.html`](visuals/development-timeline.html) in a browser  
**Sources:** `SESSION_GOALS.md`, `ROADMAP.md`, `CURRENT_STATUS.md`, `PRACTICES_AND_PLANNING.md`

Durations are intentionally **not** estimated in weeks. Progress is measured by celebration markers and session goals.

---

## You are here

```text
██████████ DONE ██████████│ NOW │░░░░ NEXT ░░░░│···· LATER ····
 Tiny Tycoon / First Playable │ S6-01 playtest │ Harden → L1 thin slice │ Hero Corner → expand
```

**Current focus:** `S6-01` — Rapha playtests `Prototype_Valley` on the home PC.

---

## Visual timeline (Mermaid)

```mermaid
timeline
    title Megawatt Valley — milestone eras
    section Era 0 · Proven
        Foundation Online : S0 Unity + GitHub
        Valley Explorer : S1 Camera
        First Foundations : S2 Build
        First Megawatt Earned : S3 Loop
        Keeping the Lights On : S4 Ops
        Tiny Tycoon / First Playable : S5 Identity
    section Era 1 · Now
        Playtest acceptance : S6-01
        ChatGPT review : S6-02
        HUD · data · tests · save : S6-03…S6-06
    section Era 2 · Near-term
        Level 1 thin slice : L1-01…L1-06
        Stretch sites / stars : after L1 fun
    section Era 3 · Gate
        Go / change / rethink : solar slice verdict
    section Era 4 · Visual
        Hero Corner V1 : style proof
        Art bible + kits V2 : production language
        Polished Level 1 : Here Comes the Sun
    section Era 5 · Later
        Wind · BESS · portfolio : after solar proven
```

```mermaid
flowchart LR
  subgraph done["✅ Done"]
    A[S0 Foundation]
    B[S1 Camera]
    C[S2 Build]
    D[S3 Energy+Cash]
    E[S4 Ops]
    F[S5 Tiny Tycoon]
  end

  subgraph now["▶ Now"]
    G[S6-01 Playtest]
  end

  subgraph next["Near-term"]
    H[S6 Harden]
    I[L1 Thin slice]
  end

  subgraph gate["Kill gate"]
    J{Fun enough?}
  end

  subgraph visual["Visual track"]
    K[Hero Corner]
    L[Art kits]
    M[Polished L1]
  end

  subgraph later["Deferred"]
    N[Wind / BESS / expand]
  end

  A --> B --> C --> D --> E --> F --> G --> H --> I --> J
  J -->|Yes| K --> L --> M
  J -->|No| H
  M --> N
```

---

## Era cards

| Era | Name | Status | Milestone outcomes |
| --- | --- | --- | --- |
| **0** | Foundation & Tiny Tycoon | ✅ Complete | Badges through First Playable; `Prototype_Valley` grey-box loop |
| **1** | Accept & Harden | ▶ Current | S6-01 playtest → S6-02 review → HUD / SO / tests / save |
| **2** | Level 1 thin slice | Queued | L1-01…L1-06; stretch = multi-site & 2★/3★ |
| **3** | Go / change / rethink | Gated | Invest in art only if thin-slice is fun |
| **4** | Hero Corner → polish | Later | V1→V6 visual checkpoints; 🎨 then 🌄 |
| **5** | Expansion systems | Deferred | Wind, BESS, portfolio, deep finance |

---

## Celebration markers

| Marker | State |
| --- | --- |
| 🏁 Foundation Online | ✅ |
| 🗺️ Valley Explorer | ✅ |
| 🔨 First Foundations | ✅ |
| ☀️ First Solar Farm | ✅ |
| ⚡ First Megawatt | ✅ |
| 💰 First Megawatt Earned | ✅ |
| 🔧 Keeping the Lights On | ✅ |
| 👷 Somebody Works Here | ✅ |
| 😂 That's Megawatt Valley | ✅ |
| ⭐ Tiny Tycoon | ✅ |
| 🎮 First Playable | ✅ |
| 🎨 Hero Corner | ☐ |
| 🌄 Here Comes the Sun | ☐ |

---

## Parallel visual track (does not replace gameplay eras)

```text
V0 Grey-box readability ──(now overlapping Era 0–2)──▶
V1 Hero Corner ──────────(after Era 3 yes)──────────▶
V2 Art bible + kits ────────────────────────────────▶
V3 L1 environment pass ─────────────────────────────▶
V4 Characters + activity ───────────────────────────▶
V5 UI / weather / VFX / audio ──────────────────────▶
V6 Polish benchmark ────────────────────────────────▶
```

Art tooling (Blender / Krita + Cursor) opens with Era 4 — see `CURSOR_BLENDER_KRITA.md`.

---

## How to update this timeline

1. When a celebration marker or S6/L1 goal completes, update this file, `SESSION_GOALS.md`, and `CURRENT_STATUS.md`.
2. Move the **You are here** chip in `visuals/development-timeline.html` to match.
3. Do **not** invent calendar deadlines unless Rapha explicitly sets them.
