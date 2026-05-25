# Context — Resend Sent Email Details

A Resend customer reviews their email-sending dashboard. They land on a list of recently sent emails, then click into one to see its full detail: metadata, an event timeline (Sent → Delivered → Opened, with timestamps), and tabs for the rendered Preview / Plain Text / HTML / Insights views. The Insights tab surfaces deliverability hygiene checks (subdomain usage, DMARC validity, image hosting, etc.) generated from the email's content.

## What's in the flow

- **Screen 0** — Emails list. Search + 3 filter dropdowns (Last 15 days, All Statuses, All API Keys). Two rows shown.
- **Screen 1** — Email detail. Metadata grid (FROM, SUBJECT, TO, ID) + horizontal events row + Preview tab selected.
- **Screen 2** — Same screen scrolled to focus on the Preview pane.
- **Screen 3** — Plain Text tab.
- **Screen 4** — HTML tab (source view on dark background).
- **Screen 5** — Insights tab: "Possible improvements" + "Doing great" checklist.

## Inferred context tags

- has-async-content (live email events, Insights generated server-side)
- has-collections (emails list, events row, Insights checklist)
- has-search-or-filter (Screen 0 search + filter dropdowns)
- has-detail-view (per-email detail across Screens 1–5)
- has-user-content (subjects, recipients, email bodies)
- flow-multistep (list → detail → tab navigation)
- flow-with-state-carry (selected email persists into the detail view)

No PRD provided — intent-scope skipped.
