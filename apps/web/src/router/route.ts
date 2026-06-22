/**
 * Minimal route enum for the M0 shell. Two screens for now: Welcome (empty state)
 * and Settings. A real router (React Router data-mode) is anticipated by
 * docs/TECH_STACK.md §2.6 and will be wired when M1+ adds the Character Sheet
 * and detail screens.
 */
export type Route = 'welcome' | 'settings';
