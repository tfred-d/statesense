# Context — Linear AI Chat

A user inside a Linear workspace opens the built-in AI assistant ("Ask Linear") and asks: "Could you please let me know which tasks I need to complete?" The assistant processes the request, retrieves the user's open issues, and returns a summary inside a side-panel chat thread. The user can follow up with more questions in the same conversation.

## What's in the flow

- **Screen 0** — Welcome / empty state. Centered "Ask Linear…" input with example-prompt cards below.
- **Screen 1** — User has typed a question; send button is active.
- **Screen 2** — Chat panel opened. User question shown at top; AI is "Thinking…" with a step description.
- **Screen 3** — AI response received: three open issue cards + a prose summary with due date callouts.

## Inferred context tags

- has-async-content (AI processing, server-fetched issues)
- has-collections (returned issue cards)
- has-detail-view (each issue card references a detail)
- has-numeric-content (issue counts, IDs, due dates)
- has-primary-cta (send button)
- flow-multistep (welcome → typing → thinking → response)
- flow-with-state-carry (user's question persists to the response screen)

No PRD provided — intent-scope skipped.
