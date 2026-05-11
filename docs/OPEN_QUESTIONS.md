# Open Questions

Product decisions that block or shape the next slices. Answers belong in the codebase as either tests, constants, or store actions.

## XP and Tier Progression

1. **What awards XP?** Minutes focused? Sessions completed? Sessions completed *as planned*? Streaks maintained? Reflections submitted?
2. **Does "ended early" earn partial XP?** Or only natural completion?
3. **Does skipping the reflection forfeit XP?** Reflections capture quality data; rewarding them might be worth the friction.
4. **What happens when XP hits the tier threshold?** Auto-advance to the next tier and reset XP to 0? Carry overflow? Bank XP into a "lifetime" total separately from "this tier" XP?
5. **Can users skip tiers?** E.g. a user who consistently does 50-minute sessions but starts on Tier 1 — do they get to jump?
6. **Can users *demote* themselves?** E.g. take a week off, drop back a tier voluntarily?

## What Counts as a Successful Session

7. **Minimum duration for a session to count?** A 30-second session that's "ended early" is technically a session. Should it appear in stats?
8. **Does "completion rate" mean `completedNaturally / total` or something else?** Currently shown as 87% (hardcoded). If derived from `sessionLog`, define the numerator and denominator.
9. **Is a pause limit reasonable?** A session paused for an hour and then completed — does that "count"?
10. **Should abandoned sessions still consume the daily plan?** Or can the user re-attempt the same plan?

## Streaks

11. **What is the daily threshold for a Focus Streak?** At least one completed session? A minimum number of minutes? Completing the planned session?
12. **Project Streak — same as Focus Streak but per-project?** Does the user pick which project counts for "streak" each day, or is it automatic (the project they spent the most time on)?
13. **Does the streak break at midnight local time?** Or after 24 hours of inactivity? Does timezone matter?

## Active Projects

14. **How many active projects are allowed?** Currently 3 (seed); the UI doesn't enforce or display a cap.
15. **What is `weeklyMinutes`?** Currently a hardcoded number on each `Project`. Should this be derived from `sessionLog` once sessions are real?
16. **What is `weeklyGoalMinutes` and who sets it?** Demo values are 1000 / 750 / 880 — arbitrary. Surface this in a project-edit flow.
17. **Can a project be "completed" and archived?**

## Sessions

18. **Should sessions be scheduled in advance, or always started manually?** Plan-My-Day is "what to work on today" but does not place sessions on a clock.
19. **Should sessions be queueable?** E.g. plan three back-to-back sessions with breaks.
20. **Does the timer continue if the user navigates away from Today?** (Once navigation exists.) Currently moot.
21. **Should completing the timer auto-start a break timer?** Mockup shows "Up Next: Short Break 5 min" — but there's no break logic yet.

## Reflection

22. **Are reflections required, optional, or skippable with a penalty?** Today they're skippable with no penalty.
23. **Should low energy scores influence next-session recommendations?** Powerful but a big product step.
24. **Is the "biggest distraction" field worth aggregating?** A word cloud or frequency list could be valuable; currently the data is collected but never surfaced.

## Navigation and Scope

25. **What's the smallest set of additional views worth building?** Insights? Focus history? Projects detail? The nav lists 7 — committing to all 7 is heavy.
26. **Where should settings live?** Profile chevron? A separate Settings view? A modal from the FAB?
27. **What does the Quick-Add `+` FAB do?** Add an idea? Start a one-tap session? Add a project? Each is a different product.
28. **What does "Inbox 7" represent?** Today the badge is hardcoded (`navItems.ts:26`). Is Inbox for parked ideas? Notifications? Suggestions?

## Personalization

29. **Should the greeting adapt to time of day?** "Good morning" → "Good afternoon" → "Good evening".
30. **Should the user be able to upload an avatar image** or is a letter avatar fine for v1?
31. **Should default duration / break length be user-configurable** or remain global constants?
