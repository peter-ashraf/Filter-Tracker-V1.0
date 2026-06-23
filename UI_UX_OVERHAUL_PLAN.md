# AquaTracker UI/UX Overhaul Plan

Direction: Option 1 + Option 2 combined: Aqua Health Dashboard plus 7-stage system map, mobile-first.

## Progress

- [x] Inspect current app UI, state, localStorage, PWA, notification, cloud sync, and settings structure.
- [x] Rework shell/navigation into mobile-first app layout with bottom nav.
- [x] Implement Home dashboard: health hero, 7-stage map, attention list, all filters preview, FAB.
- [x] Implement Filters screen with status chips, search, and compact rows.
- [ ] Redesign filter details/add-edit flow with progressive reminder disclosure.
- [x] Redesign Settings into grouped rows with Advanced / Developer Info collapsed.
- [ ] Redesign History as timeline and Insights as cleaner app-style analytics.
- [ ] Verify localStorage/import/export/cloud/push/PWA behavior remains wired end-to-end.
- [x] Preview mobile width and fix structural overflow/layout issues.
- [x] Fix mobile shell background gaps, currency rendering, and 3-state Light/Dark/System theme toggle.
- [x] Normalize mobile margins and remove the old gray body/background layer at page bottoms.

## Product Notes

The main screen should answer: what needs attention in my water system today?

The app should feel like a polished mobile PWA for household water system care. The Home screen now carries the health dashboard and 7-stage map. Filters, History, Insights, and Settings are supporting screens.

## Guardrails

- Do not reset or migrate localStorage automatically.
- Keep backup import/export working.
- Keep cloud sync and push subscription flows intact.
- Preserve the static PWA architecture unless a larger rewrite is explicitly chosen.
- Hide technical implementation details behind Advanced / Developer Info.
