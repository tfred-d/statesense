# PRD: StateSense
## Subtitle: Finding the missing pieces in app designs

### 1. Overview
StateSense is a diagnostic tool designed to bridge the gap between design and development. It identifies hidden logic gaps and missing states in app designs before they reach the engineering phase. By comparing project requirements with visual screens, it ensures that "unhappy paths" and edge cases are accounted for.

### 2. The Problem
Designers naturally focus on the "Happy Path"—the perfect user experience with fast internet and correct data. This leaves developers to guess how to handle failures (e.g., payment errors, network loss, empty states). This ambiguity leads to:
- Frequent back-and-forth between Design and Engineering.
- Production bugs caused by unhandled edge cases.
- Inconsistent user experiences during technical failures.

### 3. Core Features
- **Context Intake:** Users upload a PRD (PDF/Doc) or provide a text/voice description of the feature's goal and business rules.
- **Visual Audit:** Users upload 1–3 core screenshots of a design flow.
- **Heuristic Analysis:** The system checks the designs against common technical failure points (Latency, Auth, Validation, Connectivity).
- **Gap Report:** Outputs a checklist of missing states and logic conflicts between the requirements and the UI.

### 4. Target User
- Product Designers looking to improve handoff quality.
- Product Managers wanting to ensure requirements are fully met.
- Developers who want to avoid mid-sprint blockers due to missing designs.

### 5. Technical Approach
- **Frontend:** React/Tailwind for the dashboard and audit view.
- **LLM:** Claude 3.5 Sonnet for multi-modal analysis (Vision + Text).
- **Logic:** A predefined library of "Technical Heuristics" that the AI uses to grill the designs.

### 6. Success Metrics
- Reduction in the number of "Missing Design" tickets created by developers.
- Decrease in time spent in the design-to-dev handoff cycle.
