# Mockup Alignment

Compared the user-supplied dashboard mockup against the current `lg` rendering. Citations point at the file+line that produced each finding.

## Strong Matches

- **Three-column grid + bottom bar shell** — `AppShell.tsx:9-22` matches the mockup's 240px sidebar / center / 320–360px right panel + footer bar.
- **Sidebar logo treatment** — "FOCUS / LADDER" stacked next to a purple stepped-mountain glyph (`Sidebar.tsx:9-40`). Matches the mockup logo.
- **Nav list including Inbox + badge `7`** — `navItems.ts:26` already includes `{ id: "inbox", label: "Inbox", icon: Inbox, badge: 7 }` and `Sidebar.tsx:64-68` renders it as a pill. **Already implemented — no work needed**.
- **Streaks card structure** — three rows (focus streak / project streak / deep work hours) with circular icon tiles (`Sidebar.tsx:186-224`). Values are live from `focusStore` + `WEEK_STATS`.
- **Focus Tier card on sidebar** — large tier label, duration subline, XP bar gradient (purple→green), "Next Tier" subline (`Sidebar.tsx:100-153`). XP is live from `focusStore`.
- **Greeting** — sun icon + "Good morning, Alex." + subtitle + "Plan My Day" CTA (`MainContent.tsx:8-34`). Copy and structure match.
- **Focus Session card header** — green status dot + "Focus Session" label + "End Session" button + centered "Working on / Harmonia EP / Mixing and arrangement" with pencil affordance (`FocusSessionCard.tsx:245-269`).
- **Circular timer + Pause + "Up Next: Short Break 5 min"** — `FocusSessionCard.tsx:271-298`.
- **Sunset/mountain backdrop on the timer card** — `FocusSessionCard.tsx:25-89` is a custom inline SVG with sky gradient + two mountain ranges + pine-tree silhouettes. **Already implemented** (illustration, not a photo — see Partial Matches).
- **Three flag chips** — Focus Mode / Notifications / Distractions (`FocusSessionCard.tsx:170-194`). Icons (Smartphone / BellOff / Ban) match.
- **Idea Parking Lot** — title + count badge + subtitle + "Add Idea" button + three rows with status pills + relative dates (`IdeaParkingLot.tsx:163-213`, seed data in `ideaStore.ts:18-37` matches mockup copy exactly: "Build AI tool for drum sampling", "Learn Rust programming", "Start podcast about music production").
- **Focus Ladder right panel** — six tier rows, current highlighted with green border + "Current" label + XP subline, locked rows with Lock icon (`FocusLadderPanel.tsx:38-110`). Tier 3 is current with `1,250 / 2,000 XP` matching the mockup.
- **Focus Stats panel** — 18h 42m / 12 Sessions / 87% with green/purple/yellow value colors + solid-purple weekly bars (`FocusStatsPanel.tsx:131-156`, bar fill `#8B7CF6` at line 97). Day labels Mon–Sun.
- **Active Projects rows** — three projects with colored square icons, name, category, weekly time, ring (`ActiveProjectsPanel.tsx:11-50`). Harmonia EP / Machine Learning Path / Synapse with correct categories.
- **Bottom bar** — Today (active) / Focus / Projects / Learning Path / FAB / Progress / italic quote (`BottomBar.tsx:9-72`). Quote string matches exactly.
- **Dark theme palette** — bg/border/text/brand/accent tokens in `tailwind.config.ts` produce the muted indigo/purple+green tones the mockup uses.

## Partial Matches

- **Timer backdrop is illustration, not photograph** — `FocusSessionCard.tsx:25-89` renders an SVG sunset (gradients + two mountain `<path>`s + 8 triangle pines). The mockup looks photographic with realistic pines, atmospheric haze, and a wider warm-purple-pink horizon. The SVG works at any size but reads flatter. Acceptable as MVP; mockup is more painterly.
- **Profile avatar is a letter "A" on a gradient** — `Sidebar.tsx:226-238` renders a circle with the letter `A` inside a purple→green gradient. Mockup shows a small landscape/portrait photo avatar. Minor visual gap.
- **Project Streak icon is `Target`, mockup shows a lightning bolt in a circle** — `Sidebar.tsx:209` uses lucide `Target`. The mockup's middle row is a lightning bolt (zap) glyph. Easy swap to `Zap` or `Bolt`.
- **Timer ring stroke is thin** — `CircularTimer` uses `stroke = 5` at `size = 280` (`FocusSessionCard.tsx:98-99`). The mockup's ring reads thicker (~10–14px) and only covers an arc, not a full ring. Implementation uses a full circle with dash offset; the mockup uses a half-arc fading at the bottom. Functionally equivalent (still shows progress) but stylistically different.
- **Active Projects "Manage"** — `ActiveProjectsPanel.tsx:60` renders a `<span>` styled like a link. Mockup styles "Manage" as a clickable link in a slightly brighter color, but in our implementation it's not even a button. Tracked as "fake button" elsewhere.
- **Focus Ladder "View All"** — `FocusLadderPanel.tsx:122-127` is a `<button>` with hover styling but no `onClick`. Mockup implies it goes somewhere (full ladder view).

## Missing / Inaccurate

- **No real photographic asset for the timer backdrop** — mockup uses what reads as a photo; we use SVG. See above.
- **"Manage" + "View All" + nav clicks lead nowhere** — covered above and in `BACKLOG.md`. Mockup implies they're active; implementation is decorative.
- **Quick Add (`+`) FAB is disabled** — `BottomBar.tsx:48-56` literally renders `disabled aria-disabled="true" title="Quick add — coming later"`. Mockup shows it as a primary CTA. Either ship the action or visually make it less prominent.
- **Profile row chevron has no handler** — `Sidebar.tsx:236` renders `<ChevronRight />` but no profile menu or settings page exists.

## Visual Polish Issues

- **Drop-shadow on the timer digits** is good (`FocusSessionCard.tsx:133`) but the mockup's `32:18` reads slightly larger relative to the ring. Acceptable variance.
- **Tier card mountain mark** (`Sidebar.tsx:76-98`) is a small abstracted shape; the mockup has a more illustrative mountain with a flag. Same mood, less detail.
- **Bar chart Y-axis labels** (`FocusStatsPanel.tsx:70-78`) render `0`, `3h`, `6h`. Mockup matches.
- **"Up Next" badge** — mockup uses a soft pill; implementation uses `bg-white/10` chip (`FocusSessionCard.tsx:294-296`). Matches.
- **Empty states** — `IdeaParkingLot` has a dashed empty state (`IdeaParkingLot.tsx:201-204`); other lists do not (projects, ladder, stats), but those panels always have content from seed/store. Acceptable.

## Responsiveness Issues

- **Mobile (<lg)**: Sidebar and RightPanel are `hidden lg:flex` / `hidden lg:block`. Below 1024px the user sees **only** `MainContent` + `BottomBar`. There is no mobile entry point to the tier card, streaks, ladder, stats, or projects. Acceptable for an MVP desktop-first product, but flag if mobile matters.
- **Bottom-bar quote** is `hidden xl:flex` (`BottomBar.tsx:65`) — vanishes below 1280px. Fine.
- **Plan My Day modal** uses `sm:grid-cols-3` for project pills (`PlanMyDayModal.tsx:127`) so it adapts cleanly on phones.
- **Timer card height** is fixed at `h-[480px]` in `IdleState` (`FocusSessionCard.tsx:201`) — fine on desktop, slightly tall on small viewports but not broken.

## Highest-Impact UI Fixes

Ordered by visual delta against the mockup, smallest effort first:

1. **Swap Project Streak icon** from `Target` → `Zap` in `Sidebar.tsx:209`. ~1 line.
2. **Wire or remove "Manage" / "View All" / Quick-Add** — either give them handlers or drop them. Avoid leaving decorative buttons; users will click. Affects `ActiveProjectsPanel.tsx:60`, `FocusLadderPanel.tsx:122-127`, `BottomBar.tsx:48-56`.
3. **Decide on profile avatar** — keep letter avatar (cheap) or render a static image asset matching mockup. `Sidebar.tsx:228-231`.
4. **Optional: thicker timer ring** — bump `stroke` to ~10 in `CircularTimer` (`FocusSessionCard.tsx:99`) for a closer mockup match. Cheap.
5. **Optional: photographic timer backdrop** — meaningful work (asset sourcing + licensing + responsive image). Defer unless brand demands it; SVG is acceptable and ships.
