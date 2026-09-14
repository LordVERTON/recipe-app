# Product & UX/UI roadmap

This is a living, prioritized audit of Broco-Chou’s current mobile-first recipe-planning experience. Completed work is checked so the file can be used as a delivery log as well as a backlog.

## Now — make planning dependable

- [x] Let people build and edit a seven-day plan that begins today, including adding, replacing, and clearing meals.
- [x] Make every plan date-based rather than Monday-based, so the dashboard and calendar always agree on what “today” means.
- [x] Preserve a clear empty state and a low-friction route from recipe discovery into planning.
- [x] Invalidate the shopping list after a plan is changed and explain that it is refreshed when regenerated.

## Current experience audit

| Area | What works today | Main UX/UI opportunity |
| --- | --- | --- |
| Onboarding & preferences | A focused setup captures diet, equipment, and budget. | Explain how these choices affect results and make the settings easy to revisit from the profile. |
| Recipe discovery | Swipe actions make choosing feel lightweight; recipe sheets offer ingredients and steps. | Add search and filters before choice, plus a clearer way to compare selected recipes. |
| Home | The dashboard surfaces today’s meals and a clear route to the planning tab. | Show the active plan’s date range and an at-a-glance next action when the day is empty. |
| Weekly planning | A dated seven-day plan now starts today, with direct add, change, and remove controls. | Add move/duplicate, undo, and a compact desktop overview. |
| Cooking | Meal cards support recipe viewing and marking a meal cooked. | Add skip/move actions and connect “cooked” to a rating/history prompt. |
| Shopping | Ingredients are grouped, checkable, and copyable. | Normalize quantities, retain checked state across a regeneration where possible, and identify plan changes before replacing a list. |
| Navigation & visual language | The five-tab mobile navigation and warm palette are consistent. | Strengthen non-color state indicators, keyboard focus, and icon-only control labels. |

## Next — improve clarity and control

- [ ] Add an explicit confirmation/undo affordance for destructive planning actions (clearing a meal or restarting a plan).
- [ ] Show the plan’s seven-day date range prominently on the home card and calendar; make the active day visible without relying on color alone.
- [ ] Offer filters and search in the recipe picker (diet, cooking time, season, available equipment) to reduce cognitive load in a large catalog.
- [ ] Let people set which meal slots they plan, and make generator requirements match those choices rather than always requiring seven main dishes.
- [ ] Support quantity scaling by household size and normalize units before combining grocery quantities; the current `“x + y”` output is understandable but not actionable.
- [ ] Add a “skip / move to another day” flow, with the grocery list refreshed automatically.

## Later — deepen the product

- [ ] Add accessible labels, visible keyboard focus, and larger tap-target checks across icon-only controls (copy, close, category toggles).
- [ ] Check text/color contrast for muted text and status dots; status must also have a text or icon cue for color-vision accessibility.
- [ ] Provide a desktop/tablet planning layout in addition to the current compact mobile view.
- [ ] Add a lightweight first-week walkthrough that explains swipe, plan, and shopping-list relationships.
- [ ] Add a history view with ratings and “cook again” suggestions, using existing history data.
- [ ] Enable sharing/exporting a plan and shopping list with an accessible, formatted print view.

## Design system observations

The warm, food-oriented palette and rounded cards are cohesive. The next visual step should be a consistent hierarchy: one primary action per screen, supporting actions styled as secondary, and informative status labels rather than decorative dots. Reusing the existing `mauve-taupe`, `sage-mist`, and card tokens will maintain the visual identity while improving scanability.
