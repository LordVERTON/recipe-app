# Product & UX/UI roadmap

This is a living, prioritized audit of Broco-Chou’s current mobile-first recipe-planning experience. Completed work is checked so the file can be used as a delivery log as well as a backlog.

## Now — make planning dependable

- [ ] Let people build and edit a seven-day plan that begins today, including adding, replacing, and clearing meals.
- [ ] Make every plan date-based rather than Monday-based, so the dashboard and calendar always agree on what “today” means.
- [ ] Preserve a clear empty state and a low-friction route from recipe discovery into planning.
- [ ] Regenerate the shopping list after a plan is changed, while preserving a clear indication that it reflects the latest plan.

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
