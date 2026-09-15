# Megawatt Valley — Level 1 Design v0.1

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

The most important test is whether the loop is enjoyable before art polish and large-scale content are added.
