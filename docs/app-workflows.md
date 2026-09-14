# Broco-Chou application workflows

This document describes the user-facing workflows and the client-side state that supports them. The app currently persists personal planning state in Zustand/local storage and loads the recipe catalog from Supabase when it is available.

## Application state

```mermaid
stateDiagram-v2
  [*] --> Onboarding: first launch
  Onboarding --> Discovery: complete onboarding
  Discovery --> Selection: accept or favourite recipes
  Discovery --> Discovery: reject / undo
  Selection --> PlanEditor: create a custom plan
  Selection --> GeneratedPlan: generate from selections
  GeneratedPlan --> PlanEditor: modify plan
  PlanEditor --> ActivePlan: save automatically
  ActivePlan --> Cooking: open a planned recipe
  Cooking --> ActivePlan: mark cooked / skip / move
  ActivePlan --> GroceryList: generate list
  GroceryList --> ActivePlan: return to planning
  ActivePlan --> [*]: plan ends or is replaced
```

## Recipe catalog and discovery sequence

```mermaid
sequenceDiagram
  participant U as User
  participant A as Broco-Chou app
  participant S as Zustand store
  participant DB as Supabase

  U->>A: Open app
  A->>S: Render persisted personal state
  A->>DB: Fetch recipe catalog
  alt Supabase responds
    DB-->>A: Recipes
    A->>S: setRecipes(recipes)
  else Offline or unavailable
    A->>S: Keep local mock recipes
  end
  U->>A: Accept, reject, or favourite a recipe
  A->>S: Persist swipe action and selection
```

## Create or edit a seven-day plan

```mermaid
flowchart TD
  A[Open Planning] --> B{Active plan exists?}
  B -- No --> C[Create an empty plan<br/>today through day +6]
  B -- Yes --> D[Open existing plan]
  C --> E[Plan editor]
  D --> E
  E --> F[Choose a date]
  F --> G[Choose a meal slot]
  G --> H{Recipe selected?}
  H -- Yes --> I[Add or replace meal]
  H -- No --> J[Request confirmation to clear meal]
  J --> K[Remove meal]
  I --> L[Recalculate balance score]
  K --> L
  L --> M[Invalidate grocery list]
  M --> E
  E --> N[View active plan]
```

## Cooking, moving, and shopping flow

```mermaid
sequenceDiagram
  participant U as User
  participant C as Calendar
  participant S as Store
  participant G as Grocery list

  U->>C: Mark meal cooked, skip it, or move it
  C->>S: Update meal / plan status
  S->>S: Recalculate plan state
  alt Plan contents changed (move, replace, remove, skip)
    S->>S: Invalidate grocery list
  end
  U->>G: Generate shopping list
  G->>S: Aggregate active, non-skipped meals
  S-->>G: Categorized and scaled ingredients
  U->>G: Tick item or copy/share list
```

## State ownership

```mermaid
flowchart LR
  UI[React UI components] --> Store[Zustand store]
  Store --> Persist[Browser local storage]
  App[BrocoChouApp] --> API[Recipe fetch/import API]
  API --> Supabase[(Supabase recipes)]
  Store --> Planner[Weekly plan]
  Store --> Preferences[Preferences]
  Store --> History[Cooking history]
  Planner --> Grocery[Generated grocery list]
  Preferences --> Discovery[Recipe ordering]
  History --> Discovery
```

## Important implementation rules

- A plan spans the local calendar day of creation plus the following six days.
- Editing a plan invalidates its grocery list; regenerate before shopping.
- Recipe catalog loading must fail gracefully: the local catalog remains usable when Supabase is unavailable.
- Only non-skipped planned meals contribute ingredients to the grocery list.
- Persisted dates must be read through `new Date(...)` before comparing or rendering them.
