# Gameplay research and implemented design — 3 October 2026

## Review and scope

The approved visual direction is retained. This pass strengthens the existing
Phaser solar scenario rather than starting another engine, campaign or backend.
Research used published developer descriptions, developer notes and player guides;
the benchmark games were not installed or independently played in this session.
The conclusions below are design interpretations, not proof that a copied pattern
will make Megawatt Valley fun. No reference game's art or code was copied.

Before this pass, the gameplay structure was approximately **5/10** in my review:
there was a solvent build/generate/maintain loop and real research, but too much
progress depended on purchasing capacity and waiting for sales. Staff jobs took
fixed travel time, busy orders could be lost, roads lacked operational value,
and higher awards relied heavily on peak output. The hail-prepared flag could
permanently block mastery. Enjoyment after the changes remains unscored until
independent players test it; automated completion cannot establish fun.

| Area | Before | Implemented improvement | Remaining weakness |
| --- | --- | --- | --- |
| Core decisions | Capacity versus reliability, then waiting | Optional delivery commitments, workforce allocation and paid maintenance | Few revenue models; no storage or shading trade-off |
| Staff | Generic dispatch and instant training | Role strengths, zones, duties, energy, breaks and four-hour training | No individual wellbeing, salary negotiation or physical break-room journeys |
| Layout | Placement legality and bridge scenery | Distance-based bridge travel, local road access, nearby workshop repair and clustered cleaning | No full road network routing or terrain simulation |
| Flow | Checklist and clustered interruptions | Readiness-based next-decision guide, earned milestone history, narrative breathing space | Independent tutorial comprehension test still needed |
| Progression | Historical output and storm preparation | Sustained reliability, research, staff development and recoverable condition | One playable scenario; mastery can still follow the first award quickly |
| Feedback | Instantaneous figures | Work queue, capacity-weighted metrics, daily operating review and contract history | No long-term charts or predictive forecasts |

## Reference comparison

| Reference and evidence | Useful pattern | Adaptation in Megawatt Valley |
| --- | --- | --- |
| **Two Point Hospital**, official publisher description [1] | Layout, staff skills, upgrades and statistics all affect operational efficiency | Give existing roads/workshops operational effects; make crew training and daily performance visible |
| **Two Point Campus**, publisher description [2], illustrated Mitton guide [3] | Preparation space; short learning objectives introduce training/research before broader star goals; staff assignments create competing uses for labour | Start paused; repair and cleaning teach a problem and earn delegation tools; next-decision guide follows readiness; later awards use research and crew development |
| **Planet Zoo**, official staff and building guides [4–5] | Training, work zones and facilities organise a growing park | Assign both site and duty in selected-worker profiles; specialists and energy make extra staff useful; an office/workshop improves recovery |
| **Parkitect**, official developer announcements [6–7] | Explicit numeric goals, visible hold-to-win countdowns and optional timed challenges alongside scenario goals | Display the daylight stability counter; keep contracts optional, with explicit deadlines/deposits and bonuses; preserve continued play after awards |
| **Anno 1800**, official workforce/conditions and power development blogs [8–9] | Workforce and infrastructure form connected bottlenecks; efficiency choices have costs | Solar layout, inverter clipping, maintenance labour, paid servicing and dedicated engineer research interact; avoid another disconnected reward menu |

The strongest common principle is **teach a bottleneck, give the player a choice,
then let them delegate the repetitive work**. This is our synthesis, not a direct
quotation or claim that the reference games share identical implementations.

## Implemented loop and level flow

1. Build an additional array and begin exporting through the starter 100 kW link.
2. Repair the scripted fault. Earn Radio Dispatch and a $2,000 learning reward.
3. Dust is introduced after that repair; order a clean. Earn the Cleaning Kit and
   a $2,000 learning reward instead of waiting for an arbitrary dust threshold.
4. Reach 120 kW peak and retain $5,000 to open River Bench. Commission solar there
   for the existing $5,000 expansion grant.
5. Choose the free Cleaning Rig or Remote Monitoring; the other costs $4,000.
6. Staff, research, infrastructure and contracts offer different investments.
7. Prepare for hail or accept damage and recover using repairs and paid service.
8. Reach the original 120 kW / $3,500 electricity-sales first award, with the
   field lessons, Site B commissioning and storm resolution completed.
9. Continue to 2★ at 220 kW peak, a commissioned Site B array, Radio Dispatch and
   six stable daylight park hours.
10. Continue to 3★ at 300 kW peak, hail survived, Cleaning Kit, twelve stable
    daylight hours, at least 85% fleet condition, two technologies researched and
    a crew member at skill 2. Existing awarded stars remain awarded.

A stable hour requires at least 90% available solar capacity, 75% panel cleanliness,
at most 15% curtailment and positive export above 1 kW. Nights pause the counter;
a failed criterion during daylight resets it. Metrics are weighted by nameplate
capacity, so a small array and a premium array do not count equally.

Non-urgent narrative decisions have eight park hours of breathing space after a
choice (40 seconds at 1x). Hail warning/climax can bypass this gap. A delayed event
at the front of the queue no longer blocks another ready event.

## Operations, people and site design

Manual and automatic jobs share a deduplicated queue. An order waits when crew
are busy, resting, training, assigned elsewhere or restricted to another duty.
Unstarted manual orders can be cancelled. Repairs have priority, then manual
orders, then automatic work. Each eligible worker takes the closest job within
that priority; this is not a global optimisation algorithm.

Cleaners clean 40% faster; engineers repair/service 20% faster. Existing skill,
manager support, traits and research effects remain active. Booked training costs
$800, takes four park hours after the current job and raises skill by one, capped
at five. Training pauses with the simulation and prevents new job allocation.
Idle, available engineers help research; dedicated office research provides twice
the engineer's usual assistance. Busy, training or resting engineers do not assist.

Energy falls while travelling/working. A worker finishes the current job, rests
below 20%, and returns at 65%. Idle recovery is faster on a site with a commissioned
office/workshop. Breaks are an abstraction at the worker's current location,
not physical trips to a staff room.

Travel duration follows distance along the actual bridge route. A main or built
road within 2.5 tiles of an equipment service edge gives a 25% travel reduction,
subject to a minimum journey duration. A workshop within eight tiles on the same
site shortens repairs. Roads provide local access; staff do not follow a fully
connected player-built road network. Cleaning Rig also rewards grouping solar
arrays within its four-tile neighbour range.

Service costs $450 when an eligible crew starts its journey and restores array
condition to 100%. It does not increment repaired-fault counts. Scheduled Cleaning
supports 20%, 35% or 50% dust thresholds: output protection versus fewer jobs.
Predictive Diagnostics now unlocks optional automatic service below 85% condition,
retaining a $1,500 cash reserve, alongside its existing fault reduction.

## Contracts and economy

| Offer | First delivery | Deadline | Bonus | Deposit | Gate / counted-export quality |
| --- | --- | --- | --- | --- | --- |
| School | 1,600 kWh | 96 park hours | $1,200 | $0 | First power; no extra quality condition |
| Grid | 3,200 kWh | 96 park hours | $3,200 | $500 | Radio Dispatch; at least 90% availability |
| Valley | 6,000 kWh | 120 park hours | $7,200 | $1,500 | Commissioned Site B solar and completed research; 90% availability, 85% condition |

One contract can run at a time. Only actual exported energy counts; quality-held
exports still earn ordinary electricity sales. Deadlines pause with the game and
event choices, but continue at night. Success returns the deposit and pays the
bonus once. Expiry/cancellation forfeits only the deposit. A 12-hour renewal break
precedes new offers. Each successful renewal scales new energy/reward terms by
15%, capped after four renewals; accepted terms are frozen.

The first draft made school deliveries too small and lucrative: the frugal run
reached mastery in 988 seconds. Revised terms produced 1,451 seconds, six contracts
and $16,147 remaining cash, versus 1,699 seconds without contracts in the reference
strategy. These strategies also differ in panel choice, storm preparation and
investment timing, so this is not an isolated causal comparison. Contract bonuses
remain excluded from the first award's electricity-sales requirement.

The daily review tracks sales, payroll, running costs, service fees, deposits,
bonuses/refunds and completed jobs. It excludes construction, hiring, research
and scenario grants; therefore it is an **operating review**, not company profit.

## Verification and limitations

53 tests cover progression, research, contracts, busy queues, assignments, travel,
service charges, energy/breaks, training, daylight stability, daily rollover, forged
saves and legacy migration. Both complete strategies use the real $50,000 starting
budget and ordinary actions, with no cash, weather, time or unlock overrides:

- Prepared mixed-panel company: 1★ after 1,576 seconds at 1x, 3★ another 123 seconds
  later; includes mid-storm save/resume, research and automatic maintenance.
- Frugal unprepared company: 3★ after 1,451 seconds at 1x, six contracts and five
  services; includes post-storm save/resume and non-negative cash throughout.

These are deterministic simulation runs, not human play sessions. Browser checks
exercise the standalone offline game using visible inputs and imported fixtures
for isolated UI cases. All new save fields are optional for version-1 migration;
completed objectives/stars are retained and objective descriptions are refreshed.

Next priorities: independent fresh-player sessions and slower post-1★ pacing;
a genuinely distinct second scenario; service coverage/path overlays; physical
staff facilities and individual needs; shading/terrain/cable trade-offs; performance
and longer save soak tests. No playable second campaign map is claimed.

## Sources

1. [Two Point Hospital — publisher description](https://store.steampowered.com/app/535930/Two_Point_Hospital/).
2. [Two Point Campus — publisher description](https://store.steampowered.com/app/1649080/Two_Point_Campus/).
3. [Two Point Campus — Mitton University illustrated guide](https://gamefaqs.gamespot.com/pc/323032-two-point-campus/faqs/82357/mitton-university-level-guide), community walkthrough, not developer documentation.
4. [Planet Zoo — Staff & Guests](https://www.planetzoogame.com/help-centre/player-guides/staff-and-guests), official Frontier guide; retrieved indexed excerpts where the direct endpoint refused access.
5. [Planet Zoo — Building Your Zoo](https://www.planetzoogame.com/help-centre/player-guides/building-your-zoo), official Frontier guide.
6. [Parkitect — official developer announcements, 1.0/1.1](https://store.steampowered.com/news/posts/?appgroupname=Parkitect&appids=453090&enddate=1544030873).
7. [Parkitect — official project site](https://www.themeparkitect.com/).
8. [Anno 1800 — Working Conditions](https://www.anno-union.com/devblog-working-conditions/), Ubisoft development blog.
9. [Anno 1800 — Power Overwhelming](https://www.anno-union.com/power-overwhelming/), Ubisoft development blog.
