# Megawatt Valley — Progression, Unlocks & Engagement Design v0.1

> **Implemented Phaser update — 3 October 2026:** See
> [GAMEPLAY_RESEARCH_2026-10-03.md](GAMEPLAY_RESEARCH_2026-10-03.md) and
> [CURRENT_STATUS.md](CURRENT_STATUS.md) for the running candidate. It has two
> playable sites, optional contracts, crew assignments/energy/timed training,
> work queues/policies, local infrastructure effects and sustained-reliability
> star goals. Three-star mastery no longer permanently requires hail preparation.
> Older future-scope / Unity thin-slice text below is historical design intent.


## Purpose

Megawatt Valley should not feel like a technically correct renewable-energy sandbox with a checklist attached.

The player should almost always have a reason to care about the next few minutes:

- a current problem to solve;
- a short objective to complete;
- a capability or upgrade to unlock;
- a new area / staff role / piece of equipment becoming available;
- a longer star target or company goal in the background.

The intended feeling is:

> **I keep getting better tools, bigger responsibilities, and more interesting decisions.**

Progression should gradually move the player from direct hands-on operation toward managing systems, staff, policies and eventually a portfolio.

The core progression principle is:

> **Introduce complexity → let the player understand it manually → give them better tools → delegate it → automate the repetitive parts → introduce a new layer of responsibility.**

Automation should remove stale clicks, not remove interesting decisions.

---

# 1. Research findings from reference games

This design draws lessons from several management / progression games without copying their content or structure literally.

## Two Point Hospital

Useful patterns:

- Hospitals begin with a limited set of capabilities and teach systems through immediate objectives.
- Star objectives create a visible medium-term target while emergencies, VIP visits and staff requests create interruptions and side goals.
- Research is introduced later rather than overwhelming the first level.
- Research unlocks rooms and machine upgrades, and completed research becomes available across the wider hospital organisation.
- Machine progression commonly follows a clear staged pattern: unlock the room / machine, then research upgrade II, then upgrade III.
- One star is enough to progress in the campaign; higher stars reward mastery and additional unlocks.

**Lesson for Megawatt Valley:** teach a problem first, then introduce the system that solves it. Keep the first scenario focused, while later scenarios add persistent research and richer company systems.

## Two Point Campus

Useful patterns:

- Initial Objectives act as signposts. Completing them progressively unlocks rooms, training, research and other gameplay.
- Star Objectives only take over after the campus is operating.
- New capabilities are often introduced exactly when the player needs them.
- Campus Level produces Course Points, allowing the player to upgrade existing courses or add new ones.
- A level can continue after one star, while 2-star and 3-star goals ask the player to engage more deeply with systems they already understand.

**Lesson for Megawatt Valley:** Level 1 should have a sequence of small “do this → understand why → receive something new” objectives before exposing the player to broad star goals.

## Planet Zoo

Useful patterns:

- Staff themselves perform research.
- Better-trained staff research faster.
- Research unlocks new facilities, building themes, habitat items and improved infrastructure.
- Staff training and work zones gradually turn a chaotic zoo into an organised operation.

**Lesson for Megawatt Valley:** research and capability progression can be physically represented by people and departments rather than existing only as an abstract menu.

## Timberborn

Useful patterns:

- Science unlocks new buildings and later automation.
- The colony starts with very basic manual production and progresses into sophisticated machinery and autonomous bots.
- Automation becomes valuable because the player has already experienced the workload that it replaces.

**Lesson for Megawatt Valley:** automated cleaning, monitoring, dispatch and portfolio tools should feel powerful because the player remembers doing those jobs manually.

## Factorio

Useful patterns:

- The early game deliberately contains manual work.
- Research unlocks automation, then logistics, then increasingly complex technology.
- Each new science / production tier creates a new problem that encourages the player to automate the previous tier.
- Automation is not simply a bonus; it fundamentally changes how the player interacts with the game.

**Lesson for Megawatt Valley:** one of the strongest progression rewards should be changing the *level of abstraction* at which the player manages a system.

## Against the Storm

Useful patterns:

- The player repeatedly receives blueprint choices rather than simply unlocking everything in a fixed order.
- Permanent meta-progression increases the set of options available in future settlements.
- Each settlement still creates local choices and uncertainty.

**Lesson for Megawatt Valley:** the company can permanently unlock capabilities while individual projects still force the player to choose which equipment, policies and strategies make sense locally.

## Anno

Useful patterns:

- New complexity is tied to progression thresholds.
- Reaching a new population tier unlocks buildings and production chains.
- The game does not unlock only “better numbers”; it unlocks whole new systems and chains.
- The player’s old city remains useful while their responsibilities expand.

**Lesson for Megawatt Valley:** company progression should unlock whole categories of responsibility — storage, wind, advanced grid control, portfolio operations — rather than merely +5% output upgrades.

---

# 2. The four layers of progression

Megawatt Valley should use four connected progression layers.

## Layer A — Scenario onboarding progression

This happens inside a level.

The player begins with only what is necessary for the opening problem. Additional systems are unlocked through short objectives and contextual events.

Examples:

- build first solar array;
- connect to grid;
- respond to first fault manually;
- unlock radio dispatch;
- experience panel soiling;
- unlock basic cleaning capability;
- reach 1 star;
- unlock another plot.

This is the main mechanism for preventing the player from being overwhelmed.

## Layer B — Company capability progression

Persistent across the campaign.

The player’s company becomes more sophisticated over time. Once a capability is researched / earned, it is normally available in future scenarios unless a scenario deliberately restricts it.

Examples:

- better PV modules;
- tracker systems;
- remote monitoring;
- CMMS / maintenance scheduling;
- cleaning rigs;
- autonomous cleaning robots;
- drone inspection;
- predictive maintenance;
- BESS;
- wind capability;
- portfolio command centre.

This is the long-term “unlock tree”.

## Layer C — Project-specific choices

An unlocked technology is not automatically the right choice for every project.

Examples:

- fixed tilt vs tracker;
- cheap modules vs premium modules;
- wet cleaning vs dry robotic cleaning;
- local technician team vs outsourced contractor;
- overbuild generation vs invest in storage;
- manual security patrols vs expensive smart surveillance.

The company tree expands the player’s *options*. The level asks them to decide which option fits.

## Layer D — Campaign / star progression

Stars, reputation and major scenario accomplishments unlock:

- new regions;
- larger project sizes;
- new capability tiers;
- specialist staff;
- company departments;
- research projects;
- cosmetic / prestige rewards;
- new scenario types.

One star should normally move the campaign forward. Two and three stars reward mastery rather than block progression.

---

# 3. The Management Abstraction Ladder

This should become one of Megawatt Valley’s signature progression systems.

For many repetitive responsibilities, progression follows the same underlying ladder:

### Stage 1 — Do it yourself

The player directly orders or performs the action.

Purpose:
- teach cause and effect;
- make the player understand why the task matters.

### Stage 2 — Assign a person

The player delegates the action to a staff member or crew.

Purpose:
- introduce staffing, workload and priorities.

### Stage 3 — Create a rule / schedule

The player defines how the organisation should handle the task.

Purpose:
- replace repeated clicks with management decisions.

### Stage 4 — Automate the process

Equipment or software performs most routine work.

Purpose:
- free player attention for larger problems.

### Stage 5 — Manage by exception

At portfolio scale the player mostly handles unusual situations, strategy and policy.

Purpose:
- allow the game to scale from one site to many sites without drowning the player in old chores.

**Critical rule:** a manual action should become easier *before* it becomes boring.

---

# 4. Example progression ladders

## Panel cleaning

### Level 0 — Dirty hands
- Player selects an array and orders a manual clean.
- Technician / cleaner spends time cleaning.
- Cleaning competes with other staff work.
- Basic tools, slow throughput.

### Level 1 — Cleaning kit
- Better brushes / water equipment.
- Faster cleaning.
- One staff member can service a larger array area.

### Level 2 — Mobile cleaning rig
- Dedicated vehicle / trailer.
- Cleans groups of arrays efficiently.
- Higher capex and operating cost.

### Level 3 — Scheduled cleaning programme
- Player sets cleaning frequency or soiling threshold.
- Work orders are generated automatically.
- Staff still perform the job.

### Level 4 — Autonomous cleaning robots
- Robots clean at night / during low-production periods.
- Minimal labour.
- Requires capex, charging / power and robot maintenance.
- Dry / robotic cleaning may become more attractive in water-scarce regions.

### Level 5 — Portfolio optimisation
- Central system prioritises cleaning based on lost revenue, weather and resource constraints.
- Player manages exceptions and policy rather than individual arrays.

---

## Fault response and maintenance

### Level 0
- Player notices a fault and manually sends technician.

### Level 1
- Technician can be assigned to a work zone.

### Level 2
- Radio / work-order dispatch automatically sends the nearest suitable technician.

### Level 3
- Preventive maintenance schedules generate tasks automatically.

### Level 4
- SCADA and remote diagnostics identify likely fault causes and enable some remote resets.

### Level 5
- Predictive maintenance forecasts failures and coordinates regional crews / spares.

**Note:** the current prototype already has automatic technician dispatch. For the real progression curve, this feature should be capability-gated so the player experiences manual dispatch briefly before earning automation.

---

## Monitoring

### Level 0
- Local visual inspection / basic equipment status.

### Level 1
- Site alarm panel.

### Level 2
- SCADA dashboard.

### Level 3
- Remote alerts and alarm filtering.

### Level 4
- Automated diagnosis / prioritisation.

### Level 5
- Portfolio command centre with cross-site exception management.

---

## Vegetation

### Level 0
- Manual clearing crew.

### Level 1
- Better tools / dedicated grounds team.

### Level 2
- Tractor / mower or managed grazing option.

### Level 3
- Scheduled vegetation programme.

### Level 4
- Autonomous mowing / monitoring.

### Level 5
- Portfolio vegetation policy, contractors and risk-based scheduling.

---

## Security

### Level 0
- Fence and manual guard patrol.

### Level 1
- Dedicated security staff and patrol zones.

### Level 2
- CCTV / lighting / intrusion sensors.

### Level 3
- Smart alerts and remote monitoring.

### Level 4
- Drone patrol / analytics.

### Level 5
- Regional security operations centre and exception response.

---

## Construction

### Level 0
- Place individual infrastructure.

### Level 1
- Copy / repeat proven layouts.

### Level 2
- Standard design templates and larger construction packages.

### Level 3
- Contractor work packages and construction scheduling.

### Level 4
- Prefabrication / standardised site kits.

### Level 5
- Portfolio development teams and parallel construction projects.

The player should gradually stop placing every tiny repeated component as the company grows.

---

# 5. Company Capability Tree

The tree should be broader than “technology”. It represents what the company knows how to do.

Working name:

**Company Capability Tree**

Possible top-level branches:

1. **Generation Technology**
2. **Operations & Reliability**
3. **Digital & Automation**
4. **People & Organisation**
5. **Grid & Flexibility**
6. **Development & Commercial**

Site services such as cleaning, vegetation and security can initially sit under Operations & Reliability instead of becoming separate giant branches.

## Capability tiers

### Tier I — Startup Operator
- basic fixed-tilt solar;
- standard / bargain modules;
- manual fault response;
- manual cleaning;
- basic fencing;
- generalist technician;
- simple tariff / cash economy.

### Tier II — Professional Site Operator
- premium modules;
- maintenance scheduling;
- cleaning equipment;
- staff training;
- radio / automatic technician dispatch;
- better inverter options;
- remote alarms;
- basic site security systems.

### Tier III — Utility-Scale Developer
- bifacial modules;
- single-axis trackers;
- SCADA;
- specialist technicians / engineers;
- cleaning vehicles;
- better substations;
- contractor management;
- advanced site studies;
- improved financing options.

### Tier IV — Automated Asset Operator
- robotic cleaning;
- drone inspection;
- predictive maintenance;
- advanced weather response;
- BESS;
- energy-management systems;
- automated work-order routing;
- regional O&M capability.

### Tier V — Integrated IPP / Portfolio Operator
- wind;
- hybrid optimisation;
- grid services;
- portfolio command centre;
- regional teams;
- advanced contracts / finance;
- automated curtailment / storage optimisation;
- multi-project development.

The exact ordering will be tuned by the campaign. The important point is that each tier changes what the player *can do*, not merely the size of a modifier.

---

# 6. How unlocks should work

Avoid one giant currency-heavy system at the beginning.

## Level 1

Use **objective / milestone unlocks**.

The player experiences a problem and earns the first solution.

Examples:

- first fault → teach manual dispatch;
- successfully repair it → unlock Radio Dispatch;
- first dust / soiling problem → teach manual cleaning;
- clean enough capacity → unlock Cleaning Kit;
- reach 1 star → unlock Site B;
- reach 2 stars → unlock / preview next capability.

This keeps the first level readable.

## Later campaign

Introduce an R&D / Engineering capability.

A research project should typically require:

- the relevant company tier / prerequisite;
- cash;
- time;
- an Engineer / Research staff assignment.

Avoid adding an abstract “science currency” unless playtesting shows that one is useful.

A player may pause one research project and work on another without losing progress.

Completed research is normally persistent across the company.

## Star and campaign gates

Some research projects only become *available to research* after:

- earning a star;
- completing a scenario;
- reaching a company reputation threshold;
- hiring / training the correct specialist;
- encountering a technology in the campaign.

This lets the campaign control pacing without making the tree feel arbitrary.

---

# 7. Upgrade design rules

## Rule 1 — Prefer new verbs over small percentages

Strong unlock:

> You can now schedule cleaning automatically.

Weak unlock:

> Cleaning speed +5%.

Stat improvements are fine inside an upgrade, but the headline reward should ideally create a new option, reduce a pain point or visibly change the site.

## Rule 2 — Let players feel the problem first

Do not unlock cleaning robots before the player has ever dealt with dirty panels.

Do not unlock predictive maintenance before the player understands faults.

Do not unlock a portfolio command centre while they still operate one tiny site.

## Rule 3 — Automation transfers attention upward

When one layer becomes automated, add a higher-level decision.

Example:

Manual cleaning disappears → player now chooses cleaning policy, robot fleet size, water strategy and which sites get automation first.

## Rule 4 — Upgrades should have trade-offs

Automation should not always be an automatic “best” button.

Examples:

- robots cost capex and need maintenance;
- trackers increase yield but add moving parts;
- premium panels cost more and may have longer lead times;
- drone security costs money and may require trained operators;
- outsourced maintenance avoids salaries but introduces response-time risk.

## Rule 5 — Show exciting future capabilities

The capability screen may show selected future locked nodes.

The player should occasionally see:

- Robotic Cleaning;
- BESS;
- Wind;
- Drone Inspection;
- Command Centre;

before they can use them.

This creates anticipation without dumping their mechanics into the current level.

---

# 8. Level 1 engagement redesign

The existing grey-box thin slice proves that the systems work.

It does **not** yet prove that the game is fun for a full scenario.

Before large-scale visual production, Level 1 needs an **Engagement & Progression Slice**.

The first level should not simply ask the player to place arrays repeatedly until a MW number is reached.

## Desired motivation stack

At most points after the opening tutorial, the player should have roughly:

- one immediate operational concern;
- one short-term objective;
- one visible unlock / reward they are approaching;
- one optional star / mastery objective in the background.

Not every category needs to be active every second, but the game should rarely have long stretches with no meaningful choice.

## Suggested Level 1 beats

These are progression beats, not rigid clock times.

### Beat 1 — First Power
- place first basic solar;
- connect to grid;
- earn first revenue;
- immediate celebration / feedback.

**Reward:** procurement menu expands.

### Beat 2 — Cheap or Good?
- choose bargain vs premium equipment;
- supplier event reinforces the trade-off;
- player expands the site.

**Reward:** first staff / maintenance capability.

### Beat 3 — First Failure
- one array faults;
- player manually selects the problem and dispatches Jordan.

**Reward:** unlock **Radio Dispatch** / automatic technician response.

This deliberately turns an existing prototype convenience into an earned progression reward.

### Beat 4 — Dust Happens
- soiling begins reducing output;
- player manually orders a clean;
- cleaning competes with technician availability.

**Reward:** **Basic Cleaning Kit** or cleaner role.

### Beat 5 — Growing Up
- reach first meaningful capacity / cash target;
- Site B unlocks;
- new plot has a slightly different constraint.

**Reward:** expansion plus first company capability choice.

### Beat 6 — Choose What to Improve
Give the player two useful upgrades, both eventually obtainable.

Example:

- **Cleaning Rig** — reduces labour burden;
- **Remote Monitoring** — improves fault visibility / response.

This introduces choice without permanently punishing experimentation.

### Beat 7 — Growing Pains
The larger site creates overlapping demands:

- maintenance;
- cleaning;
- cash;
- grid placement;
- event decision.

The player should now *feel* why organisation and automation matter.

### Beat 8 — First Automation Payoff
The player earns a capability that meaningfully removes repetitive work.

Example:

- scheduled cleaning;
- automatic dispatch;
- remote alarm handling.

The player should notice that the company has become easier to run.

### Beat 9 — Hail / Weather Climax
The existing hail concept becomes a test of what the player built and unlocked.

Preparation choices should interact with:

- equipment quality;
- cash;
- maintenance;
- weather protection;
- staff / automation.

### Beat 10 — Continue or Move On
- 1 star unlocks next scenario;
- 2 and 3 stars remain visible;
- continuing should offer mastery rewards / capability progress.

---

# 9. Level 1 content-density target

Do not tune primarily to a specific number of minutes.

Tune to **meaningful beats**.

A first-pass target for the eventual Level 1 experience:

- 8–12 guided / contextual objectives;
- 5–8 decision events;
- 2 equipment procurement choices;
- 2–3 meaningful staff / operations concepts;
- 3–5 capability unlock moments;
- 1 plot expansion;
- 1 clear automation payoff;
- 1 scripted climax;
- 1-star / 2-star / 3-star goals.

A reasonable playtime may naturally land around 30–60 minutes depending on speed and whether the player continues for higher stars, but time is secondary to engagement.

## Dead-air rule

For the opening scenario, prolonged periods where the optimal action is simply “wait for money / MW” are a design failure.

If waiting becomes necessary, the player should normally have something useful to consider:

- an upgrade;
- staff;
- maintenance;
- layout;
- research;
- an event;
- a secondary objective;
- expansion planning.

## Repetition rule

If the player performs the exact same low-level action several times with no new decision attached, the game should consider:

- a bulk tool;
- a template;
- delegation;
- scheduling;
- automation;
- a new constraint that makes the action meaningfully different.

---

# 10. Engagement gate before Hero Corner

The project should insert one gameplay gate before substantial visual production.

Working milestone:

## **Engagement Slice**

Pass when Rapha can play the grey-box Level 1 flow and say:

- I am regularly deciding what to do next;
- I am unlocking things I actually want;
- the game gives me visible short-term rewards;
- the workload evolves rather than simply increasing;
- at least one task moves from manual to automated;
- I understand why I want the next capability;
- there are no long stretches where I am just waiting;
- I would keep playing even if the visuals stayed grey-box for this test.

This does **not** require the full final technology tree or every Level 1 mechanic.

Once this passes, **V1 — Hero Corner** should begin.

After Hero Corner, gameplay content and visual production should continue in parallel rather than waiting for every game mechanic to be finished first.

---

# 11. Proposed immediate implementation track

Add a new session-goal track before Hero Corner.

## E1 — Engagement & Progression Proof

### E1-01 — Capability unlock framework
- Minimal persistent / scenario capability state.
- One small UI panel showing unlocked and locked capabilities.
- No giant research tree implementation yet.

### E1-02 — Earn automatic technician dispatch
- Start scenario with manual fault dispatch.
- Completing the first repair unlocks Radio Dispatch / Auto Dispatch.
- Reuse the current auto-dispatch behaviour behind a capability gate.

### E1-03 — Soiling and manual cleaning
- Arrays accumulate simple soiling.
- Soiling reduces generation.
- Player can order manual cleaning using existing staff movement / task patterns.

### E1-04 — First cleaning upgrade
- Unlock Basic Cleaning Kit or dedicated cleaner.
- Clearly reduces time / staff burden.

### E1-05 — Objective ladder
- Replace the loose “build until stars” opening with approximately 8 staged objectives.
- Each objective teaches, challenges or rewards something.

### E1-06 — First capability choice
- Present two useful upgrades.
- Player chooses which to unlock first; the other remains obtainable.

### E1-07 — Reward / unlock presentation
- Clear notification when a capability, plot, tool or staff option is unlocked.
- Reward should feel satisfying even in grey-box.

### E1-08 — Engagement playtest
- Rapha plays from new game through at least 1 star.
- Log boring stretches, repeated chores, unclear rewards and missing decisions.

### E1-09 — Engagement gate
- Fix the smallest set of issues required for the level to feel genuinely engaging.
- If accepted, begin Hero Corner.

---

# 12. Long-term campaign progression example

The campaign can progressively shift the player's job:

### Early game
**I operate a solar site.**
- direct actions;
- one or two staff;
- simple procurement;
- manual problems.

### Early-mid game
**I manage a solar operation.**
- specialised staff;
- schedules;
- research;
- better equipment;
- multiple plots.

### Mid game
**I develop and run utility projects.**
- construction;
- trackers;
- grid constraints;
- BESS;
- contractors;
- serious weather risk.

### Late-mid game
**I manage technologies and departments.**
- wind;
- hybrid;
- regional O&M;
- automated systems;
- finance / commercial complexity.

### Late game
**I run an IPP portfolio.**
- command centre;
- multiple simultaneous sites;
- grid services;
- predictive systems;
- capital allocation;
- strategic project pipeline.

The player's interface and responsibilities should evolve with that journey.

---

# 13. Design decision

**Do not build the complete capability tree now.**

Build only enough of the framework to prove:

1. a task can be manual;
2. the player can earn an upgrade;
3. that upgrade changes how the task is managed;
4. the player feels rewarded by that change.

Panel cleaning and technician dispatch are ideal first proofs.

If that loop is satisfying, the same progression language can be reused across the rest of Megawatt Valley.
