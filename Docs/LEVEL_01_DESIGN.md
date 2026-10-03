# Megawatt Valley — Level 1 Design v0.2

> **Implemented Phaser update — 3 October 2026:** See
> [GAMEPLAY_RESEARCH_2026-10-03.md](GAMEPLAY_RESEARCH_2026-10-03.md) and
> [CURRENT_STATUS.md](CURRENT_STATUS.md) for the running candidate. It has two
> playable sites, optional contracts, crew assignments/energy/timed training,
> work queues/policies, local infrastructure effects and sustained-reliability
> star goals. Three-star mastery no longer permanently requires hail preparation.
> Older future-scope / Unity thin-slice text below is historical design intent.


## Working title

**Level 1 — Here Comes the Sun**

This title is provisional.

## Purpose of Level 1

Level 1 is both the player's introduction to Megawatt Valley and the project's first full vertical slice.

It must teach the basic game naturally while proving that the core loop is fun:

**Select → Build → Generate → Earn → Maintain → Improve → Complete objectives**

The first level should feel approachable and slightly playful rather than punishing.

## Player setup

The player begins as the owner of a tiny renewable-energy company with:

- limited starting cash;
- a very small office / operating base;
- access only to basic solar technology;
- a small number of staff roles;
- limited equipment choice;
- one region and a few possible project sites.

Exact starting cash, project size, tariff, equipment prices, and target production values remain **TBC during prototype balancing**. The design should not hard-code narrative numbers before the economy has been tested.

## Opening fantasy

The level should communicate:

> You have enough money and knowledge to build something real, but not enough to make every mistake.

The player is not yet a giant energy company. They are trying to prove they can successfully deliver and operate their first meaningful solar project.

## Thin-slice build order

Level 1’s full destination (three sites, star tiers, climax, larger event deck) remains valid. **Implementation order** should follow the thin-slice track in `Docs/SESSION_GOALS.md` (`L1-01…L1-06`) and `Docs/PRACTICES_AND_PLANNING.md`:

1. one scenario map + office;
2. tunable start economy;
3. two equipment options;
4. five events;
5. one-star clear;
6. one climax beat;

then stretch into multi-site choice and 2★/3★.


## Engagement and progression requirement

The functional thin slice is not the final Level 1 experience.

Level 1 must create a steady feeling of **purpose → action → reward → new responsibility**. The progression model is defined in `Docs/PROGRESSION_AND_ENGAGEMENT.md`.

The player should not spend the scenario repeatedly placing the same solar object until a capacity target is reached.

### Motivation stack

After the opening tutorial, the player should usually have some combination of:

- an immediate operational concern;
- a short contextual objective;
- a visible unlock / reward approaching;
- an optional star / mastery goal.

### First manual-to-automation proof

Level 1 should deliberately demonstrate that the company is getting smarter.

Recommended first proof:

1. first fault requires manual technician dispatch;
2. successful repair unlocks **Radio Dispatch / automatic fault response**;
3. later, panel soiling introduces manual cleaning;
4. a Cleaning Kit / cleaner upgrade reduces that burden;
5. later campaign tiers visibly tease scheduled cleaning and autonomous cleaning robots.

The objective is not to make the tutorial tedious. Manual work should exist only long enough for the player to understand and appreciate the upgrade.

### Progression beats

Use a beat structure rather than rigid time gates:

1. First Power — build, connect, earn.
2. Cheap or Good? — bargain vs premium procurement.
3. First Failure — manual response, then auto-dispatch unlock.
4. Dust Happens — manual cleaning, then first cleaning improvement.
5. Growing Up — capacity / cash target unlocks Site B.
6. Choose What to Improve — first capability choice.
7. Growing Pains — overlapping responsibilities make better organisation valuable.
8. First Automation Payoff — repetitive work becomes easier.
9. Hail / Weather Climax — test prior choices.
10. Continue or Move On — 1★ unlocks progress, 2★ / 3★ remain for mastery.

Exact timing is a balancing question. Fun is more important than stretching the scenario to a target duration.

### Content-density starting target

For the eventual first-level experience, aim initially for roughly:

- 8–12 guided / contextual objectives;
- 5–8 decision events;
- 2 equipment procurement choices;
- 2–3 staff / operations concepts;
- 3–5 capability unlock moments;
- 1 plot expansion;
- 1 meaningful automation payoff;
- 1 memorable climax;
- 1★ / 2★ / 3★ goals.

These are design targets, not hard quotas.

## Candidate sites

The player should eventually choose between approximately three candidate sites.

Each should have an obvious strength and a hidden or emerging weakness.

Example structure:

### Site A — Easy Start
- good solar resource;
- moderate land cost;
- straightforward grid connection;
- relatively low risk.

### Site B — Cheap Land
- low acquisition cost;
- good space;
- weaker grid or longer connection route;
- potential weather / terrain issue.

### Site C — High Yield
- excellent solar resource;
- higher cost;
- stronger upside;
- increased environmental, construction, or community complication.

The final version should allow the player to learn that the cheapest-looking site is not always the best project.

For the earliest prototype, these may simply be three grey-box plots with different numeric modifiers.

## Initial buildable infrastructure

The first complete vertical slice should include a deliberately small catalogue:

- Solar Array
- Inverter / Power Conversion Unit
- Transformer / Grid Connection Unit
- Substation or simplified Point of Connection
- Access Road
- Fence
- Maintenance / Operations Building

Some of these may initially be combined while the gameplay loop is being proven.

## Equipment choice

The level should eventually introduce at least two equipment choices to demonstrate that procurement matters.

Example philosophy:

### Low-cost option
- cheaper;
- shorter lead time;
- lower reliability or efficiency;
- potentially higher maintenance risk.

### Premium option
- higher capex;
- better reliability / yield;
- longer lead time or higher initial cash pressure.

The lesson should be understandable without requiring the player to know technical specifications.

## First staff roles

The vertical slice may begin with a subset of:

- Technician — repairs failed equipment and performs maintenance.
- Engineer — improves diagnosis / technical performance.
- Site Manager — improves site operations and coordination.
- Security — reduces theft / vandalism risk.
- Cleaner — restores performance lost through soiling.

Not all roles need to be available in the very first five minutes.

## Tutorial philosophy

Avoid long modal tutorials.

Teach through:

- objectives;
- contextual prompts;
- highlighted controls;
- advisor / character messages;
- consequences visible in the world;
- small early tasks.

Example onboarding sequence:

1. Select the available site.
2. Open the build menu.
3. Place a solar array.
4. Connect it to the grid.
5. Observe generation.
6. Watch revenue arrive.
7. Hire or assign a technician.
8. Respond to the first minor fault.
9. Expand capacity.
10. Reach the first scenario target.

## Event deck

The prototype target is approximately 10–20 events, with a mix of:

- operational;
- weather;
- staffing;
- equipment;
- contractor / supplier;
- grid;
- security;
- humorous low-stakes events.

Events should favour decisions with trade-offs.

Possible examples:

- Hail forecast.
- Dirty panels after a dust event.
- Inverter warning alarm.
- Replacement part delayed in transit.
- Supplier offers discounted panels with questionable reliability.
- Security spots suspicious activity near the site.
- Technician requests training.
- Grid operator announces a temporary export constraint.
- Contractor discovers unexpected ground conditions.
- Consultant recommends further investigation after completing the investigation.

## First major scripted event

The level should end with or contain one memorable challenge that tests systems the player has already learned.

Possible concept:

**Severe weather warning**

The player receives advance warning of an approaching storm / hail event and must decide how aggressively to protect the plant while balancing lost revenue and preparation costs.

The exact scripted climax should be tested rather than locked now.

## Three-star structure

### 1 Star — Prove the company works

Illustrative goals:
- commission the first solar facility;
- reach a target generation amount;
- remain solvent;
- restore at least one equipment fault.

Reward:
- unlock next scenario / region.

### 2 Stars — Run it well

Illustrative goals:
- improve plant availability;
- reach a profitability target;
- train staff;
- maintain a minimum reputation / site condition.

Reward:
- equipment or capability unlock.

### 3 Stars — Master the site

Illustrative goals:
- high availability;
- stronger cumulative generation / profit target;
- successfully handle the major weather event;
- avoid major safety / reliability failures;
- complete an optional efficiency target.

Reward:
- rare unlock, cosmetic, company perk, or special technology.

Exact numbers remain TBC until simulation balancing begins.

## Humour and personality

The level should establish the writing tone early.

Example style:

**GRID CONNECTION UPDATE**

Your application has successfully progressed from **Awaiting Review** to **Awaiting Further Review**.

No gameplay text should rely on humour alone; important information must remain clear.

## Success criteria for the vertical slice

Level 1 is successful when a first-time player can:

- understand what to build;
- understand why the plant produces or stops producing;
- feel financial pressure without immediately feeling lost;
- care about staff and equipment;
- make at least a few meaningful choices;
- recover from a problem;
- complete the scenario;
- understand what they unlocked;
- want to continue or replay more efficiently.

The most important test is whether the loop is enjoyable before large-scale content is added. Once the Engagement Gate in `Docs/PROGRESSION_AND_ENGAGEMENT.md` passes, Hero Corner visual work should begin and then visuals / gameplay can advance together.
