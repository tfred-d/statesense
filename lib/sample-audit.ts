// Hand-crafted sample audit on Resend's "Sent Email Details" flow.
// Shown at /sample so visitors can see real output quality before running their own.
// Voice + word caps match the locked discipline in FINDING_VOICE.md.

import type { AuditResult } from "./types";

export const SAMPLE_RESEND_AUDIT: AuditResult = {
  audit_id: "sample-resend-001",
  platform: "web",
  context_tags_detected: [
    "has-async-content",
    "has-collections",
    "has-search-or-filter",
    "has-detail-view",
    "has-user-content",
    "flow-multistep",
    "flow-with-state-carry"
  ],
  summary:
    "Resend's Sent Email Details flow covers the happy path well — list, detail, multiple content views, and an Insights tab with deliverability checks. The gaps cluster around what happens when things aren't happy: no empty state for the emails list, no loading or error frames, and no in-context exit from the detail view.",
  coverage_score: 64,
  findings: [
    {
      id: "f-01",
      scope: "screen",
      finding_type: "gap",
      severity: "important",
      heuristic_id: "empty.first-time-vs-cleared",
      screen_refs: [0],
      element_anchor: "the emails table on Screen 0",
      title: "No empty state for the emails list",
      description:
        "Screen 0 shows the emails table populated with two rows. A new account with zero sent emails would see a blank table.",
      suggestion:
        "Add an empty state: 'No emails sent yet' with a link to the API quickstart or Templates."
    },
    {
      id: "f-02",
      scope: "screen",
      finding_type: "gap",
      severity: "important",
      heuristic_id: "empty.filtered-no-results",
      screen_refs: [0],
      element_anchor: "the search + filter row on Screen 0",
      title: "No state for zero filter results",
      description:
        "Screen 0 has search plus three filters. What appears when the combination returns zero results isn't designed.",
      suggestion: "Add 'No emails match these filters' with a 'Clear filters' button where rows would appear."
    },
    {
      id: "f-03",
      scope: "screen",
      finding_type: "gap",
      severity: "important",
      heuristic_id: "loading.skeleton-vs-spinner",
      screen_refs: [1],
      element_anchor: "the email detail view on Screen 1",
      title: "No loading state for the email detail",
      description:
        "Screen 1 shows metadata, events row, and preview fully loaded. No skeleton frame for the moment between clicking a row and the detail rendering.",
      suggestion: "Add a skeleton: greyed rectangles for the metadata grid, events row, and preview pane."
    },
    {
      id: "f-04",
      scope: "screen",
      finding_type: "gap",
      severity: "critical",
      heuristic_id: "error.recovery-path-present",
      screen_refs: [1, 2, 3, 4, 5],
      element_anchor: "the email detail and its tabs",
      title: "No error state if the detail fails to load",
      description:
        "Screens 1–5 show only the happy path. If events, preview, or Insights fail to fetch, no error frame is designed.",
      suggestion: "Add per-section error states with a [Retry] button — events row, preview, and Insights each need one."
    },
    {
      id: "f-05",
      scope: "screen",
      finding_type: "gap",
      severity: "important",
      heuristic_id: "connectivity.offline-mode",
      screen_refs: [0, 1, 2, 3, 4, 5],
      element_anchor: "the dashboard chrome",
      title: "No offline state for the dashboard",
      description:
        "This dashboard depends on live data. No banner or indicator for when the user loses connectivity mid-session.",
      suggestion: "Add a top-level offline banner: 'You're offline — data may be out of date.'"
    },
    {
      id: "f-06",
      scope: "screen",
      finding_type: "gap",
      severity: "important",
      heuristic_id: "counts.too-many",
      screen_refs: [1, 2, 3, 4, 5],
      element_anchor: "the events row showing Sent → Delivered → 3× Opened",
      title: "Events row not designed for many opens",
      description:
        "Screens 1–5 show 5 events. A real campaign email could log 50+ opens. No truncation, scroll, or collapse behavior is designed.",
      suggestion: "Decide how the row holds at high counts — horizontal scroll, '+47 more' truncation, or collapse-to-counter."
    },
    {
      id: "f-07",
      scope: "screen",
      finding_type: "gap",
      severity: "important",
      heuristic_id: "data.long-text-overflow",
      screen_refs: [0],
      element_anchor: "the Subject and To columns on Screen 0",
      title: "Long subjects and emails not demonstrated",
      description:
        "Screen 0's Subject column shows 'Hello World' and the To column shows a short address. No example with a 60+ character subject or long recipient.",
      suggestion: "Mock one row with a long subject and long recipient. Specify truncation (ellipsis, one line)."
    },
    {
      id: "f-08",
      scope: "screen",
      finding_type: "gap",
      severity: "important",
      heuristic_id: "actions.selected-active",
      screen_refs: [0],
      element_anchor: "the email rows in the table on Screen 0",
      title: "Email rows have no hover or selected state",
      description:
        "Screen 0's table shows two email rows in their default style only. Clicking navigates to the detail view, but no hover state signals that the rows are interactive.",
      suggestion: "Mock the hover state — subtle background fill and cursor pointer — so rows read as clickable."
    },
    {
      id: "f-09",
      scope: "screen",
      finding_type: "question",
      severity: "important",
      heuristic_id: "affordance.interactive-looks-interactive",
      screen_refs: [1],
      element_anchor: "the two icons at the top-right of the email header on Screen 1",
      title: "Two icons in the header are unlabeled",
      description:
        "At the top-right of the email header on Screen 1, two small icons sit without labels or tooltips. Their function — share, export, open externally — isn't signaled.",
      suggestion: "Is this intentional? If not, add tooltips on hover or replace with labelled buttons."
    },
    {
      id: "f-10",
      scope: "screen",
      finding_type: "question",
      severity: "important",
      heuristic_id: "hierarchy.subject-identity",
      screen_refs: [1],
      element_anchor: "the email header on Screen 1",
      title: "Header leads with recipient, not subject",
      description:
        "Screen 1's header leads with the recipient address as the largest text. The subject 'Hello World' sits smaller in the metadata grid below.",
      suggestion: "Subject is usually how users recall an email. Consider promoting it to the heading."
    },
    {
      id: "f-11",
      scope: "flow",
      finding_type: "gap",
      severity: "important",
      heuristic_id: "flow.navigation-back-cancel",
      screen_refs: [1, 2, 3, 4, 5],
      element_anchor: "the detail view header on Screens 1–5",
      title: "No back affordance from the email detail",
      description:
        "On Screens 1–5, there's no visible way to return to the emails list from within the detail view. The only path is clicking 'Emails' in the left nav.",
      suggestion: "Add a back arrow or '← Emails' link above the email header, so users have an in-context exit."
    }
  ],
  skipped_heuristics: [
    {
      heuristic_id: "auth.session-expired-mid-action",
      reason: "No long-form editing surface in this flow."
    },
    {
      heuristic_id: "auth.reauth-for-sensitive-action",
      reason: "No destructive or sensitive actions visible."
    },
    {
      heuristic_id: "validation.async-availability",
      reason: "No form fields in this flow."
    },
    {
      heuristic_id: "concurrency.stale-data-edit",
      reason: "No collaborative editing surface."
    },
    {
      heuristic_id: "recovery.confirm-irreversible",
      reason: "No irreversible actions visible."
    },
    {
      heuristic_id: "data.i18n-text-expansion",
      reason: "No PRD provided; internationalization scope unclear."
    },
    {
      heuristic_id: "intent.stated-features-present",
      reason: "No PRD provided — intent scope skipped."
    },
    {
      heuristic_id: "intent.design-contradicts-prd",
      reason: "No PRD provided — intent scope skipped."
    },
    {
      heuristic_id: "intent.stated-goals-served",
      reason: "No PRD provided — intent scope skipped."
    },
    {
      heuristic_id: "intent.primary-journey-complete",
      reason: "No PRD provided — intent scope skipped."
    },
    {
      heuristic_id: "intent.stated-constraints-respected",
      reason: "No PRD provided — intent scope skipped."
    },
    {
      heuristic_id: "intent.user-types-served",
      reason: "No PRD provided — intent scope skipped."
    }
  ]
};
